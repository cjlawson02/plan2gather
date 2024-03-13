import { DateTime } from 'luxon';
import { create } from 'zustand';

import type { DateRangeLuxon, GatheringFormDetails, Weekday } from '@backend/types';

export interface PossibleDatesData {
  weekdays: Weekday[];
  period: DateRangeLuxon;
}

export interface CreationStore {
  details: GatheringFormDetails;
  allowedPeriod: PossibleDatesData;
  setDetails: (details: GatheringFormDetails) => void;
  setAllowedPeriod: (possibleDates: PossibleDatesData) => void;
}

const useCreationStore = create<CreationStore>((set) => ({
  details: {
    timezone: DateTime.local().zoneName,
  } as unknown as GatheringFormDetails,
  allowedPeriod: {} as unknown as PossibleDatesData,
  timePeriods: {},
  timePeriodsFormData: null,
  setDetails: (details) => {
    set({ details });
  },
  setAllowedPeriod: (allowedPeriod) => {
    set({ allowedPeriod });
  },
}));

export default useCreationStore;
