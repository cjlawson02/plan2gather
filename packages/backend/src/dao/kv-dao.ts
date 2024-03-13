import { gatheringBackendDataSchema, gatheringDataSchema } from '@backend/types';

import type KvWrapper from './kv-wrapper';
import type {
  GatheringBackendData,
  GatheringFormDetails,
  GatheringFormPeriods,
  GatheringListResponseData,
  UserAvailabilityBackend,
} from '@backend/types';

const EXPIRATION_TTL = 60 * 60 * 24 * 7; // 7 days

export default class KVDAO {
  constructor(private readonly gatheringsNamespace: KvWrapper) {}

  /**
   * Get a gathering with the creationUserId.
   * DO NOT USE THIS TO RETURN DATA TO THE USER.
   *
   * @param id - The ID of the gathering to get.
   * @returns - The gathering with the given ID.
   */
  async getBackendGathering(id: string) {
    return await this.gatheringsNamespace.get(gatheringBackendDataSchema, id);
  }

  /**
   * Get a gathering.
   *
   * @param id - The ID of the gathering to get.
   * @returns - The gathering with the given ID.
   */
  async getGathering(id: string) {
    // The backend data is gatheringBackendDataSchema, but we want to return the
    // data without the creationUserId.
    return gatheringDataSchema.parse(await this.getBackendGathering(id));
  }

  /**
   * Get the gatherings a user owns.
   * @param userId - The ID of the user to get the gatherings for.
   * @returns - The IDs of the gatherings the user owns.
   */
  async getOwnedGatherings(userId: string): Promise<GatheringListResponseData> {
    const gatherings = await this.gatheringsNamespace.getAll(gatheringBackendDataSchema);

    const ownedGatheringIds: GatheringListResponseData = [];

    gatherings.forEach((gathering) => {
      if (gathering.creationUserId === userId) {
        ownedGatheringIds.push({
          id: gathering.id,
          name: gathering.name,
          editPerms: true,
        });
      }
    });

    return ownedGatheringIds;
  }

  /**
   * Get the gatherings a user is participating in.
   * @param userId - The ID of the user to get the gatherings for.
   * @returns - The IDs of the gatherings the user is participating in.
   */
  async getParticipatingGatherings(userId: string): Promise<GatheringListResponseData> {
    const gatherings = await this.gatheringsNamespace.getAll(gatheringBackendDataSchema);

    const participatingGatheringIds: GatheringListResponseData = [];

    gatherings.forEach((gathering) => {
      if (gathering.availability[userId] != null) {
        participatingGatheringIds.push({
          id: gathering.id,
          name: gathering.name,
          editPerms: gathering.creationUserId === userId,
        });
      }
    });

    return participatingGatheringIds;
  }

  /**
   * Add or update a gathering.
   * TODO: The TTL gets reset every time the gathering is updated
   *
   * @param gathering - The gathering to add/update.
   * @returns The gathering that was added/updated.
   */
  async putGathering(gathering: GatheringBackendData) {
    await this.gatheringsNamespace.put(gatheringBackendDataSchema, gathering.id, gathering, {
      expirationTtl: EXPIRATION_TTL,
    });

    return gathering;
  }

  async putDetails(id: string, details: GatheringFormDetails) {
    const existingGathering = await this.getBackendGathering(id);
    const gatheringWithDetails: GatheringBackendData = {
      ...existingGathering,
      ...details,
    };

    await this.putGathering(gatheringWithDetails);
  }

  async putAllowedPeriod(id: string, allowedPeriod: GatheringFormPeriods) {
    const existingGathering = await this.getBackendGathering(id);
    const gatheringWithPeriod: GatheringBackendData = {
      ...existingGathering,
      ...allowedPeriod,
    };

    await this.putGathering(gatheringWithPeriod);
  }

  /**
   * Add or update a gathering's availability.
   *
   * @param id - The ID of the gathering to update.
   * @param availability - The availability to add/update.
   */
  async putAvailability(id: string, availability: UserAvailabilityBackend) {
    const existingGathering = await this.getBackendGathering(id);

    const gatheringWithAvailability: GatheringBackendData = {
      ...existingGathering,
      availability: {
        ...existingGathering.availability,
        ...availability,
      },
    };

    await this.putGathering(gatheringWithAvailability);
  }

  async removeAvailability(id: string, userId: string) {
    const existingGathering = await this.getBackendGathering(id);

    const updatedAvailability = { ...existingGathering.availability };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete updatedAvailability[userId];

    const gatheringWithAvailability = {
      ...existingGathering,
      availability: updatedAvailability,
    };

    await this.putGathering(gatheringWithAvailability);
  }

  /**
   * Remove a gathering.
   *
   * @param id - The ID of the gathering to remove.
   */
  async removeGathering(id: string) {
    await this.gatheringsNamespace.delete(id);
  }
}
