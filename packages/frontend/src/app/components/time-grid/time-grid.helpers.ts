import { DateTime } from 'luxon';

import { sortWeekdays, timeOnly, timeOnlyISO } from '@backend/utils';

import type { CellData } from '@/app/pages/gathering-view/gathering-view.store';
import type {
  UserAvailability,
  DateRange,
  Weekday,
  Availability,
  DateRangeLuxon,
  AvailabilityLuxon,
} from '@backend/types';

export function formattedWeekday(weekday: Weekday) {
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

function fuzzyGetPeriod(
  weekday: Weekday,
  periods: Array<DateRangeLuxon & { names: string[] }>,
  target: DateTime,
  targetPeople: string[],
  requiredPeople: string[]
): CellData {
  const foundPeriod = periods.find(
    (timePeriod) => target >= timePeriod.start && target < timePeriod.end
  );

  if (foundPeriod != null) {
    const peopleCount = targetPeople.reduce(
      (count, person) => count + (foundPeriod.names.includes(person) ? 1 : 0),
      0
    );

    const requiredPeopleCount = requiredPeople.reduce(
      (count, person) => count + (foundPeriod.names.includes(person) ? 1 : 0),
      0
    );

    if (peopleCount !== 0 && requiredPeopleCount === requiredPeople.length) {
      return {
        weekday,
        totalParticipants: targetPeople.length,
        names: foundPeriod.names,
        period: { start: foundPeriod.start, end: foundPeriod.end },
      };
    }
  }

  return {
    weekday,
    totalParticipants: targetPeople.length,
    names: [],
    period: { start: target, end: target },
  };
}

export function getRowAndColumnLabels(
  combinedAvailability: Record<Weekday, DateRangeLuxon[]>,
  timezone: string,
  increment: number = 30 * 60 * 1000
) {
  const days = Object.keys(combinedAvailability) as Weekday[];
  let dayStart = Number.MAX_SAFE_INTEGER;
  let dayEnd = Number.MIN_SAFE_INTEGER;

  days.forEach((day) => {
    combinedAvailability[day].forEach((period) => {
      dayStart = Math.min(dayStart, period.start.toMillis());
      dayEnd = Math.max(dayEnd, period.end.toMillis());
    });
  });

  const dataHeight = Math.floor((dayEnd - dayStart) / increment);

  return {
    columnLabels: days,
    rowLabels: Array.from({ length: dataHeight + 1 }, (_, rowIndex) =>
      timeOnly(DateTime.fromMillis(rowIndex * increment + dayStart))
        .setZone(timezone)
        .toLocaleString(DateTime.TIME_SIMPLE)
    ),
    dataHeight,
    increment,
    dayStart,
  };
}

export function getRowAndColumnLabels2(
  combinedAvailability: Record<Weekday, DateRangeLuxon>,
  timezone: string,
  increment: number = 30 * 60 * 1000
) {
  const days = Object.keys(combinedAvailability) as Weekday[];
  let dayStart = Number.MAX_SAFE_INTEGER;
  let dayEnd = Number.MIN_SAFE_INTEGER;

  days.forEach((day) => {
    dayStart = Math.min(dayStart, combinedAvailability[day].start.toMillis());
    dayEnd = Math.max(dayEnd, combinedAvailability[day].end.toMillis());
  });

  const dataHeight = Math.floor((dayEnd - dayStart) / increment);

  return {
    columnLabels: days,
    rowLabels: Array.from({ length: dataHeight + 1 }, (_, rowIndex) =>
      timeOnly(DateTime.fromMillis(rowIndex * increment + dayStart))
        .setZone(timezone)
        .toLocaleString(DateTime.TIME_SIMPLE)
    ),
    dataHeight,
    increment,
    dayStart,
  };
}

export function parseListForTimeSlots(
  combinedAvailability: Record<Weekday, Array<DateRangeLuxon & { names: string[] }>>,
  filteredNames: string[],
  allNames: string[],
  timezone: string
): { data: CellData[][]; columnLabels: string[]; rowLabels: string[] } {
  const { columnLabels, rowLabels, dataHeight, increment, dayStart } = getRowAndColumnLabels(
    combinedAvailability,
    timezone
  );

  return {
    data: Array.from({ length: dataHeight }, (_, rowIndex) =>
      Array.from({ length: columnLabels.length }, (_, colIndex) =>
        fuzzyGetPeriod(
          columnLabels[colIndex],
          combinedAvailability[columnLabels[colIndex]],
          timeOnly(DateTime.fromMillis(rowIndex * increment + dayStart)).setZone(timezone),
          allNames,
          filteredNames
        )
      )
    ),
    columnLabels,
    rowLabels,
  };
}

export function getBestTimes(data: CellData[]) {
  data.sort((a, b) => {
    // First sort by the number of participants
    const participantDifference = b.names.length - a.names.length;
    if (participantDifference !== 0) {
      return participantDifference;
    }

    // Then sort by the longest period, assuming start and end can be subtracted to get a duration
    const durationA = timeOnly(a.period.end).toMillis() - timeOnly(a.period.start).toMillis();
    const durationB = timeOnly(b.period.end).toMillis() - timeOnly(b.period.start).toMillis();
    return durationB - durationA; // Descending order: longer periods first
  });

  const uniquePeriods = new Set<string>();
  const bestTimes: CellData[] = [];
  const mostParticipants = data[0]?.names.length ?? 0;

  if (mostParticipants !== 0) {
    data.forEach((cell) => {
      // Only show times that have at least 2 people available
      if (cell.names.length < 2) {
        return;
      }
      const periodStr = `${cell.period.start.toString()}-${cell.period.end.toString()}`;

      // Only show unique periods
      if (!uniquePeriods.has(periodStr)) {
        uniquePeriods.add(periodStr);
        bestTimes.push(cell);
      }
    });
  }

  return { bestTimes, mostParticipants };
}

function createStartStopFromSeries(weekday: Weekday, values: DateTime[]): DateRangeLuxon[] {
  return values.slice(0, -1).map((value, i) => ({
    weekday,
    start: value,
    end: values[i + 1],
  }));
}

function isAvailable(
  individualTimePeriods: DateRangeLuxon[] | undefined,
  start: DateTime,
  end: DateTime
): boolean {
  return (
    individualTimePeriods?.some((period) => start >= period.start && end <= period.end) ?? false
  );
}

function convertToLuxonDateRange(dateRange: DateRange, timezone: string): DateRangeLuxon {
  return {
    start: timeOnlyISO(dateRange.start).setZone(timezone),
    end: timeOnlyISO(dateRange.end).setZone(timezone),
  };
}

export function combineTimeSlots(
  groupTimePeriods: UserAvailability[],
  timezone: string
): Record<string, Array<DateRangeLuxon & { names: string[] }>> {
  const finalResult: Record<string, Array<DateRangeLuxon & { names: string[] }>> = {};
  const usedDays = new Set<Weekday>();

  groupTimePeriods.forEach((person) => {
    Object.keys(person.availability).forEach((dayOfWeek) => {
      usedDays.add(dayOfWeek as Weekday);
    });
  });

  // sort used days using sortWeekdays function
  const sortedUsedDays = sortWeekdays(Array.from(usedDays));

  sortedUsedDays.forEach((day) => {
    finalResult[day] = [];
    const dayStartStopSet = new Set<DateTime>();

    groupTimePeriods.forEach((person) => {
      const dayAvailability = person.availability[day]?.map((p) =>
        convertToLuxonDateRange(p, timezone)
      );
      dayAvailability?.forEach((period) => {
        dayStartStopSet.add(timeOnly(period.start));
        dayStartStopSet.add(timeOnly(period.end));
      });
    });

    const dayStartStop = createStartStopFromSeries(
      day,
      Array.from(dayStartStopSet).sort((a, b) => a.valueOf() - b.valueOf())
    );

    dayStartStop.forEach((period) => {
      const tempPeriod = {
        weekday: day,
        start: period.start,
        end: period.end,
        names: [] as string[],
      };
      groupTimePeriods.forEach((person) => {
        if (
          isAvailable(
            person.availability[day]?.map((p) => convertToLuxonDateRange(p, timezone)),
            period.start,
            period.end
          )
        ) {
          tempPeriod.names.push(person.name);
        }
      });
      finalResult[day].push(tempPeriod);
    });
  });

  return finalResult;
}

export interface Coordinate {
  rowIndex: number;
  colIndex: number;
}

export interface RowRange {
  start: number;
  end: number;
}

export type ColumnRanges = Record<number, RowRange[]>;

const simplifyCoordinates = (cells: Record<number, Set<number>>): ColumnRanges => {
  const simplifiedRanges: ColumnRanges = {};

  // Create the ranges for each column
  Object.keys(cells).forEach((col) => {
    const colNum: number = parseInt(col, 10);
    if (cells[colNum].size === 0) {
      // Skip empty sets
      return;
    }
    const rowIndexes = Array.from(cells[colNum]).sort((a, b) => a - b);
    const ranges: RowRange[] = [];
    let start = rowIndexes[0];
    let end = start;

    for (let i = 1; i < rowIndexes.length; i++) {
      if (rowIndexes[i] === end + 1) {
        // If the current index is a continuation, move the end
        end = rowIndexes[i];
      } else {
        // If not continuous, push the current range and reset start and end
        ranges.push({ start, end });
        start = rowIndexes[i];
        end = start;
      }
    }

    // Push the last range
    ranges.push({ start, end });
    simplifiedRanges[colNum] = ranges;
  });

  return simplifiedRanges;
};

const convertRowRangeToDateRangeLuxon = (
  rowRange: RowRange,
  colIndex: number,
  restriction: Record<Weekday, DateRangeLuxon>
): DateRangeLuxon => {
  // Get the weekdays sorted to match colIndex to the correct weekday
  const weekdays: Weekday[] = sortWeekdays(Object.keys(restriction) as Weekday[]);
  const selectedWeekday = weekdays[colIndex];

  // Calculate the starting and ending times
  const restrictionStart = restriction[selectedWeekday].start;
  const startDateTime = restrictionStart.plus({ minutes: 30 * rowRange.start });
  const endDateTime = restrictionStart.plus({ minutes: 30 * (rowRange.end + 1) });

  return { start: timeOnly(startDateTime), end: timeOnly(endDateTime) };
};

const convertDateRangeLuxonToRowRange = (
  dateRange: DateRangeLuxon,
  colIndex: number,
  restriction: Record<Weekday, DateRangeLuxon>
): RowRange => {
  const weekdays: Weekday[] = sortWeekdays(Object.keys(restriction) as Weekday[]);
  const weekday = weekdays[colIndex];
  const baseStart = restriction[weekday].start;
  const startDiff = timeOnly(dateRange.start).toMillis() - timeOnly(baseStart).toMillis();
  const endDiff = timeOnly(dateRange.end).toMillis() - timeOnly(baseStart).toMillis();

  // Convert milliseconds to 30-min blocks
  const start = Math.floor(startDiff / (30 * 60 * 1000));
  const end = Math.floor(endDiff / (30 * 60 * 1000)) - 1;

  return { start, end };
};

export const convertHighlightedCellsToAvailability = (
  highlightedCells: Record<number, Set<number>>,
  restriction: Record<Weekday, DateRangeLuxon>
): AvailabilityLuxon => {
  const ranges = simplifyCoordinates(highlightedCells);
  const result = {} as unknown as AvailabilityLuxon;
  const columnLabels = Object.keys(restriction) as Weekday[];

  Object.keys(ranges).forEach((col) => {
    const colNum: number = parseInt(col, 10);
    result[columnLabels[colNum]] = ranges[colNum].map((range) =>
      convertRowRangeToDateRangeLuxon(range, colNum, restriction)
    );
  });

  return result;
};

export const convertAvailabilityLuxonToHighlightedCells = (
  availability: AvailabilityLuxon,
  restriction: Record<Weekday, DateRangeLuxon>
): Record<number, Set<number>> => {
  const result: Record<number, Set<number>> = {};

  const columnLabels = sortWeekdays(Object.keys(restriction) as Weekday[]);

  Object.keys(availability).forEach((col) => {
    const colKey = col as Weekday;
    const colIndex = columnLabels.indexOf(colKey);
    availability[colKey].forEach((dateRange) => {
      const rowRange = convertDateRangeLuxonToRowRange(dateRange, colIndex, restriction);
      if (result[colIndex] == null) {
        result[colIndex] = new Set<number>();
      }
      for (let i = rowRange.start; i <= rowRange.end; i++) {
        result[colIndex].add(i);
      }
    });
  });

  return result;
};

export const convertAvailabilityToAvailabilityLuxon = (
  availability: Availability
): AvailabilityLuxon => {
  const result = {} as unknown as AvailabilityLuxon;
  Object.keys(availability).forEach((key) => {
    const weekday = key as Weekday;
    result[weekday] = availability[weekday]!.map((dateRange) => ({
      start: timeOnlyISO(dateRange.start),
      end: timeOnlyISO(dateRange.end),
    }));
  });

  return result;
};

export const convertAvailabilityLuxonToAvailability = (
  availability: AvailabilityLuxon
): Availability => {
  const result = {} as unknown as Availability;
  Object.keys(availability).forEach((key) => {
    const weekday = key as Weekday;
    result[weekday] = availability[weekday].map((dateRange) => ({
      start: dateRange.start.toISO()!,
      end: dateRange.end.toISO()!,
    }));
  });

  return result;
};
