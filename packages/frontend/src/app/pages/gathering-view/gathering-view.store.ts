import { create } from 'zustand';

import {
  getBestTimes,
  parseListForTimeSlots,
  combineTimeSlots,
} from '@/app/components/time-grid/time-grid.helpers';

import type { DateRangeLuxon, UserAvailability, Weekday } from '@backend/types';

export interface CellData {
  totalParticipants: number;
  names: string[];
  weekday: Weekday;
  period: DateRangeLuxon;
}

export interface GatheringViewData {
  checkedUsers: string[];
  setCheckedUsers: (checkedUsers: string[]) => void;
  cellData: CellData[][];
  setCellData: (
    userAvailability: UserAvailability[],
    timezone: string,
    requiredUsers: string[],
    allUsers: string[]
  ) => void;
  bestTimes: CellData[];
  mostParticipants: number;
  columnLabels: string[];
  rowLabels: string[];
}

const useGatheringViewData = create<GatheringViewData>((set) => ({
  checkedUsers: [],
  setCheckedUsers: (checkedUsers) => {
    set({ checkedUsers });
  },
  cellData: [],
  setCellData: (userAvailability, timezone, requiredUsers, allUsers) => {
    const { data, columnLabels, rowLabels } = parseListForTimeSlots(
      combineTimeSlots(userAvailability, timezone),
      requiredUsers,
      allUsers,
      timezone
    );
    const { bestTimes, mostParticipants } = getBestTimes(data.flat());
    set({ bestTimes, mostParticipants, cellData: data, columnLabels, rowLabels });
  },
  bestTimes: [],
  mostParticipants: 0,
  columnLabels: [],
  rowLabels: [],
}));

export default useGatheringViewData;
