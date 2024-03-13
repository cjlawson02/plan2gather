import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import {
  gatheringFormDataSchema,
  gatheringFormDetailsSchema,
  gatheringFormPeriodSchema,
  userAvailabilityBackendSchema,
  userAvailabilitySchema,
} from '@backend/types';
import { isRangeWithinRange, timeRangeToLuxon } from '@backend/utils';
import t from 'packages/backend/src/trpc';

import userProcedure from './userid-middleware';

import type { GatheringBackendData, UserAvailability, Weekday } from '@backend/types';

export default t.router({
  get: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => await ctx.env.kvDao.getGathering(input.id)),
  getEditPermission: userProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const gathering = await ctx.env.kvDao.getBackendGathering(input.id);

      return gathering.creationUserId === ctx.userId;
    }),
  put: userProcedure.input(gatheringFormDataSchema).mutation(async ({ ctx, input }) => {
    const gatheringId = nanoid();

    const gathering: GatheringBackendData = {
      id: gatheringId,
      ...input,
      availability: {},
      creationDate: new Date().toISOString(),
      creationUserId: ctx.userId,
    };

    await ctx.env.kvDao.putGathering(gathering);

    return gatheringId;
  }),
  putDetails: userProcedure
    .input(
      z.object({
        id: z.string(),
        details: gatheringFormDetailsSchema.optional(),
        allowedPeriod: gatheringFormPeriodSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const gathering = await ctx.env.kvDao.getBackendGathering(input.id);

      if (gathering.creationUserId !== ctx.userId) {
        throw new TRPCError({
          message: 'You are not allowed to update this gathering.',
          code: 'FORBIDDEN',
        });
      }

      if (input.details != null) {
        await ctx.env.kvDao.putDetails(input.id, input.details);
      }
      if (input.allowedPeriod != null) {
        await ctx.env.kvDao.putAllowedPeriod(input.id, { allowedPeriod: input.allowedPeriod });
      }

      return 'ok';
    }),
  putAvailability: userProcedure
    .input(z.object({ id: z.string(), availability: userAvailabilitySchema }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const { availability } = input.availability;

      const gathering = await ctx.env.kvDao.getGathering(input.id);
      const allowedTimeOnly = timeRangeToLuxon(gathering.allowedPeriod.period);

      const weekdayKeys = Object.keys(availability);
      weekdayKeys.forEach((key) => {
        const periods = availability[key as Weekday];
        periods?.forEach((period) => {
          const periodTimeOnly = timeRangeToLuxon(period);
          if (!isRangeWithinRange(periodTimeOnly, allowedTimeOnly)) {
            throw new TRPCError({
              message: `The period ${periodTimeOnly.start.toFormat('t')} - ${periodTimeOnly.end.toFormat('t')} is not allowed for ${key}. Valid period is ${allowedTimeOnly.start.toFormat('t')} - ${allowedTimeOnly.end.toFormat('t')}.`,
              code: 'BAD_REQUEST',
            });
          }
        });
      });

      await ctx.env.kvDao.putAvailability(
        input.id,
        userAvailabilityBackendSchema.parse({
          [userId]: {
            name: input.availability.name,
            availability,
          },
        })
      );

      return 'ok';
    }),
  getAvailability: t.procedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const gathering = await ctx.env.kvDao.getBackendGathering(input.id);

    // We need to parse the user availability to the frontend schema.
    // This strips the userId from the availability.
    return Object.values(gathering.availability);
  }),
  getOwnAvailability: userProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const gathering = await ctx.env.kvDao.getBackendGathering(input.id);

      // Find the user's availability for the gathering.
      const availability = gathering.availability[ctx.userId] ?? 'none';

      return availability as UserAvailability | 'none';
    }),
  getOwnedGatherings: userProcedure.query(
    async ({ ctx }) => await ctx.env.kvDao.getOwnedGatherings(ctx.userId)
  ),
  getParticipatingGatherings: userProcedure.query(
    async ({ ctx }) => await ctx.env.kvDao.getParticipatingGatherings(ctx.userId)
  ),
  leaveGathering: userProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.env.kvDao.removeAvailability(input.id, ctx.userId);

      return 'ok';
    }),
  remove: userProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const gathering = await ctx.env.kvDao.getBackendGathering(input.id);

    if (gathering.creationUserId !== ctx.userId) {
      throw new TRPCError({
        message: 'You are not allowed to remove this gathering.',
        code: 'FORBIDDEN',
      });
    }

    await ctx.env.kvDao.removeGathering(input.id);

    return 'ok';
  }),
  putTestData: userProcedure.mutation(async ({ ctx }) => {
    const gatheringId = nanoid();

    const gathering: GatheringBackendData = {
      id: gatheringId,
      name: 'Pizza Party',
      description: 'We should have some pizza to celebrate our successes',
      timezone: 'America/Los_Angeles',
      allowedPeriod: {
        weekdays: ['sunday', 'friday', 'saturday'],
        period: { start: '2024-03-04T16:00:00.000-08:00', end: '2024-03-04T23:00:00.000-08:00' },
      },
      availability: {
        randomid0: {
          name: 'Jeff Bezos',
          availability: {
            sunday: [
              { start: '2024-03-04T16:00:00.000-08:00', end: '2024-03-04T19:00:00.000-08:00' },
            ],
            friday: [
              { start: '2024-03-04T19:30:00.000-08:00', end: '2024-03-04T22:30:00.000-08:00' },
            ],
            saturday: [
              { start: '2024-03-04T18:00:00.000-08:00', end: '2024-03-04T23:00:00.000-08:00' },
            ],
          },
        },
        randomid1: {
          name: 'Steve Jobs',
          availability: {
            sunday: [
              { start: '2024-03-04T19:30:00.000-08:00', end: '2024-03-04T21:00:00.000-08:00' },
            ],
            friday: [
              { start: '2024-03-04T17:30:00.000-08:00', end: '2024-03-04T19:30:00.000-08:00' },
              { start: '2024-03-04T22:00:00.000-08:00', end: '2024-03-04T23:00:00.000-08:00' },
            ],
            saturday: [
              { start: '2024-03-04T19:30:00.000-08:00', end: '2024-03-04T22:30:00.000-08:00' },
            ],
          },
        },
        randomid2: {
          name: 'Tim Cook',
          availability: {
            sunday: [
              { start: '2024-03-04T17:00:00.000-08:00', end: '2024-03-04T18:30:00.000-08:00' },
              { start: '2024-03-04T20:00:00.000-08:00', end: '2024-03-04T22:00:00.000-08:00' },
            ],
            friday: [
              { start: '2024-03-04T18:30:00.000-08:00', end: '2024-03-04T20:30:00.000-08:00' },
            ],
            saturday: [
              { start: '2024-03-04T17:00:00.000-08:00', end: '2024-03-04T19:00:00.000-08:00' },
              { start: '2024-03-04T21:00:00.000-08:00', end: '2024-03-04T23:00:00.000-08:00' },
            ],
          },
        },
        randomid3: {
          name: 'Bill Gates',
          availability: {
            sunday: [
              { start: '2024-03-04T17:00:00.000-08:00', end: '2024-03-04T18:30:00.000-08:00' },
              { start: '2024-03-04T21:00:00.000-08:00', end: '2024-03-04T23:00:00.000-08:00' },
            ],
            friday: [
              { start: '2024-03-04T16:00:00.000-08:00', end: '2024-03-04T17:00:00.000-08:00' },
              { start: '2024-03-04T18:30:00.000-08:00', end: '2024-03-04T22:30:00.000-08:00' },
            ],
            saturday: [
              { start: '2024-03-04T16:30:00.000-08:00', end: '2024-03-04T21:00:00.000-08:00' },
            ],
          },
        },
      },
      creationDate: new Date().toISOString(),
      creationUserId: ctx.userId,
    };

    await ctx.env.kvDao.putGathering(gathering);

    return gatheringId;
  }),
});
