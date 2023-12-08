import type { Meta } from '@storybook/react';
import TimeGrid from './timegrid';

const meta: Meta<typeof TimeGrid> = {
  component: TimeGrid,
  title: 'TimeGrid', // Title for your story
  parameters: {
    controls: { hideNoControlsWarning: true }, // Optional: Hide controls warning
  },
};

const test = [
  {
    name: 'Chris',
    availability: {
      monday: [
        {
          start: '2023-12-06T09:00:00.000-08:00',
          end: '2023-12-06T17:00:00.000-08:00',
        },
        {
          start: '2023-12-06T09:00:00.000-08:00',
          end: '2023-12-06T09:30:00.000-08:00',
        },
      ],
      friday: [
        {
          start: '2023-12-06T09:00:00.000-08:00',
          end: '2023-12-06T09:30:00.000-08:00',
        },
      ],
    },
  },
  {
    name: 'Spencer',
    availability: {
      monday: [
        {
          start: '2023-12-06T09:00:00.000-08:00',
          end: '2023-12-06T15:00:00.000-08:00',
        },
        {
          start: '2023-12-06T09:00:00.000-08:00',
          end: '2023-12-06T09:30:00.000-08:00',
        },
      ],
      friday: [
        {
          start: '2023-12-06T09:00:00.000-08:00',
          end: '2023-12-06T09:30:00.000-08:00',
        },
      ],
    },
  },
];

export default meta;

export function Primary(args: {
  data: {
    color: string;
    names: string[];
    period: { start: string; end: string };
  }[][];
  columnLabels: string[];
  rowLabels: string[];
}) {
  return <TimeGrid {...args} />;
}

function fuzzyGetPeriod(
  periods: { start: string; end: string; names: string[] }[],
  target: number,
  targetPeople: string[]
) {
  periods.forEach((timePeriod) => {
    if (
      target >= Date.parse(timePeriod.start) &&
      target <= Date.parse(timePeriod.end)
    ) {
      let peopleCount = 0;
      targetPeople.forEach((tp) => {
        if (timePeriod.names.includes(tp)) {
          peopleCount += 1;
        }
      });
      if (peopleCount !== 0) {
        return {
          color: `rgba(0, ${
            100 + 155 * (peopleCount / targetPeople.length)
          }, 0, 1)`,
          names: timePeriod.names,
          period: { start: timePeriod.start, end: timePeriod.end },
        };
      }
    }
  });
  return {
    color: '#cccccc',
    names: [],
    period: { start: target, end: target },
  };
}

function formatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

function parseListForTimeSlots(
  combinedAvailability: Record<
    string,
    { start: string; end: string; names: string[] }[]
  >,
  increment: number = 15 * 60 * 1000,
  padding: number = 2,
  filteredNames: string[] = ['Spencer', 'Chris']
) {
  const days = Object.keys(combinedAvailability);
  let dayStart: number = Number.MAX_SAFE_INTEGER;
  let dayEnd: number = Number.MIN_SAFE_INTEGER;
  days.forEach((day) => {
    combinedAvailability[day].forEach((period) => {
      dayStart = Math.min(dayStart, Date.parse(period.start));
      dayEnd = Math.max(dayEnd, Date.parse(period.end));
    });
  });

  dayStart -= increment * padding;
  dayEnd += increment * padding;
  const dataHeight = Math.ceil((dayEnd - dayStart) / increment);

  return {
    data: Array.from({ length: dataHeight }, (_, rowIndex) =>
      Array.from({ length: days.length }, (_, colIndex) =>
        fuzzyGetPeriod(
          combinedAvailability[days[colIndex]],
          rowIndex * increment + dayStart,
          filteredNames
        )
      )
    ),
    columnLabels: days,
    rowLabels: Array.from({ length: dataHeight }, (_, rowIndex) =>
      formatTime(new Date(rowIndex * increment + dayStart))
    ),
  };
}

function createStartStopFromSeries(
  values: string[]
): { start: string; end: string }[] {
  const result: { start: string; end: string }[] = [];

  for (let i = 0; i < values.length - 1; i += 1) {
    result.push({
      start: values[i],
      end: values[i + 1],
    });
  }

  return result;
}

function isAvailable(
  individualTimePeriods: { start: string; end: string }[],
  start: string,
  end: string
): boolean {
  return individualTimePeriods.some(
    (timePeriod) =>
      Date.parse(start) >= Date.parse(timePeriod.start) &&
      Date.parse(end) <= Date.parse(timePeriod.end)
  );
}

function combineTimeSlots(
  groupTimePeriods: {
    name: string;
    availability: Record<string, { start: string; end: string }[]>;
  }[]
): Record<string, { start: string; end: string; names: string[] }[]> {
  const finalResult: Record<
    string,
    { start: string; end: string; names: string[] }[]
  > = {};
  const usedDays: Set<string> = new Set();

  groupTimePeriods.forEach((person) => {
    Object.keys(person.availability).forEach((dayOfWeek) => {
      usedDays.add(dayOfWeek);
    });
  });

  usedDays.forEach((day) => {
    finalResult[day] = [];
    const dayStartStopSet: Set<string> = new Set();

    groupTimePeriods.forEach((person) => {
      const dayAvailability: { start: string; end: string }[] =
        person.availability[day] ?? [];

      dayAvailability.forEach((period) => {
        dayStartStopSet.add(period.start);
        dayStartStopSet.add(period.end);
      });
    });

    const dayStartStop = createStartStopFromSeries(
      Array.from(dayStartStopSet).sort()
    );

    dayStartStop.forEach((period) => {
      const tempPeriod: { start: string; end: string; names: string[] } = {
        start: period.start,
        end: period.end,
        names: [],
      };
      groupTimePeriods.forEach((person) => {
        if (isAvailable(person.availability[day], period.start, period.end)) {
          tempPeriod.names.push(person.name);
        }
      });
      finalResult[day].push(tempPeriod);
    });
  });

  return finalResult;
}

Primary.args = parseListForTimeSlots(combineTimeSlots(test));
