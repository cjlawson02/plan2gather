import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import GridContainer from '@/app/components/shared/grid/grid-container';
import {
  convertAvailabilityLuxonToAvailability,
  convertAvailabilityLuxonToHighlightedCells,
  convertAvailabilityToAvailabilityLuxon,
  convertHighlightedCellsToAvailability,
  getRowAndColumnLabels2,
} from '@/app/components/time-grid/time-grid.helpers';
import { timeOnly, sortWeekdays, timeOnlyISO } from '@backend/utils';

import type { Coordinate } from '@/app/components/time-grid/time-grid.helpers';
import type {
  Availability,
  AvailabilityLuxon,
  DateRange,
  DateRangeLuxon,
  Weekday,
} from '@backend/types';

interface TimeGridProps {
  initial: Availability;
  days: Weekday[];
  restriction: DateRange;
  timezone: string;
}

const cellWidth = 100;

const setupHighlightedCells = (
  columnLabels: string[],
  restriction: Record<Weekday, DateRangeLuxon>,
  initial: AvailabilityLuxon
) => {
  const highlightedCells: Record<number, Set<number>> = {};
  for (let i = 0; i < columnLabels.length; i++) {
    highlightedCells[i] = new Set<number>();
  }

  // Reformat the initial to fit in the restriction
  const initialDays = Object.keys(initial) as Weekday[];
  const sortedDays = sortWeekdays(initialDays);

  const revisedInitial = {} as unknown as AvailabilityLuxon;

  sortedDays.forEach((day) => {
    const dayRestriction = restriction[day];
    const dayAvailability = initial[day];

    // If the day is not allowed, skip it
    if (dayRestriction == null) {
      return;
    }

    const revisedDay = dayAvailability.map((availability) => {
      // Adjust the availability to fit within the restriction
      if (timeOnly(availability.start) < timeOnly(dayRestriction.start)) {
        availability.start = dayRestriction.start;
      }
      if (timeOnly(availability.end) > timeOnly(dayRestriction.end)) {
        availability.end = dayRestriction.end;
      }
      return availability;
    });

    revisedInitial[day] = revisedDay;
  });

  // Convert the revised initial to highlighted cells
  const initialHighlight = convertAvailabilityLuxonToHighlightedCells(revisedInitial, restriction);

  const keys = Object.keys(initialHighlight);
  keys.forEach((key) => {
    const keyInt = parseInt(key, 10);
    const set = highlightedCells[keyInt];
    const result = Array.from(initialHighlight[keyInt]);
    result.forEach((val) => {
      set.add(val);
    });
  });

  return highlightedCells;
};

const deepClone = (originalRecord: Record<number, Set<number>>) => {
  const clonedRecord: Record<number, Set<number>> = {};

  for (const key in originalRecord) {
    clonedRecord[key] = new Set(originalRecord[key]);
  }
  return clonedRecord;
};

const TimeGrid = forwardRef<unknown, TimeGridProps>(
  ({ days, restriction, timezone, initial }, ref) => {
    const initialAvailability = useMemo(
      () => convertAvailabilityToAvailabilityLuxon(initial),
      [initial]
    );
    const restrictionSchedule = useMemo(() => {
      const sortedDays = sortWeekdays(days);

      const start = timeOnlyISO(restriction.start);
      const end = timeOnlyISO(restriction.end);
      return sortedDays.reduce<Record<Weekday, DateRangeLuxon>>(
        (acc, day) => {
          acc[day] = {
            start,
            end,
          };
          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
        {} as unknown as Record<Weekday, DateRangeLuxon>
      );
    }, [days, restriction.end, restriction.start]);

    const columnLabels = useMemo(
      () => Object.keys(restrictionSchedule) as Weekday[],
      [restrictionSchedule]
    );
    const rowLabels = useMemo<string[]>(
      () => getRowAndColumnLabels2(restrictionSchedule, timezone, 30 * 60 * 1000).rowLabels,
      [restrictionSchedule, timezone]
    );
    const [tempHighlightedCells, setTempHighlightedCells] = useState<Record<number, Set<number>>>(
      () => setupHighlightedCells(columnLabels, restrictionSchedule, initialAvailability)
    );
    const [highlightedCells, setHighlightedCells] = useState<Record<number, Set<number>>>(() =>
      setupHighlightedCells(columnLabels, restrictionSchedule, initialAvailability)
    );

    // Update the highlighted cells when the initial availability changes
    useEffect(() => {
      setTempHighlightedCells(
        setupHighlightedCells(columnLabels, restrictionSchedule, initialAvailability)
      );
      setHighlightedCells(
        setupHighlightedCells(columnLabels, restrictionSchedule, initialAvailability)
      );
    }, [columnLabels, restrictionSchedule, initialAvailability]);

    const isDragging = useRef(false);
    const selectionMode = useRef<'select' | 'deselect' | null>(null);
    const startCell = useRef<Coordinate | null>(null);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        return {
          valid: true,
          data: convertAvailabilityLuxonToAvailability(
            convertHighlightedCellsToAvailability(highlightedCells, restrictionSchedule)
          ),
        };
      },
    }));

    const updateCells = useCallback(
      (start: Coordinate, end: Coordinate, mode: 'select' | 'deselect') => {
        const newHighlightedCells = deepClone(highlightedCells);
        for (
          let x = Math.min(start.rowIndex, end.rowIndex);
          x <= Math.max(start.rowIndex, end.rowIndex);
          x++
        ) {
          for (
            let y = Math.min(start.colIndex, end.colIndex);
            y <= Math.max(start.colIndex, end.colIndex);
            y++
          ) {
            if (mode === 'select') {
              newHighlightedCells[y].add(x);
            } else {
              newHighlightedCells[y].delete(x);
            }
          }
        }
        setTempHighlightedCells(newHighlightedCells);
      },
      [highlightedCells]
    );

    const handleMouseDown = useCallback(
      (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
        e.preventDefault();
        isDragging.current = true;
        startCell.current = { rowIndex, colIndex };
        selectionMode.current = highlightedCells[colIndex].has(rowIndex) ? 'deselect' : 'select';

        const newHighlightedCells = deepClone(highlightedCells);
        if (selectionMode.current === 'select') {
          newHighlightedCells[colIndex].add(rowIndex);
        } else if (selectionMode.current === 'deselect') {
          newHighlightedCells[colIndex].delete(rowIndex);
        }
        setTempHighlightedCells(newHighlightedCells);
      },
      [highlightedCells]
    );

    const handleMouseEnter = useCallback(
      (rowIndex: number, colIndex: number) => {
        if (isDragging.current && selectionMode.current != null && startCell.current != null) {
          updateCells(startCell.current, { rowIndex, colIndex }, selectionMode.current);
        }
      },
      [updateCells]
    );

    const handleMouseUp = useCallback(() => {
      isDragging.current = false;
      setHighlightedCells(tempHighlightedCells);
      selectionMode.current = null;
      startCell.current = null;
    }, [tempHighlightedCells]);

    useEffect(() => {
      if (isDragging.current) {
        window.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, handleMouseUp]);

    return (
      <GridContainer
        columnLabels={columnLabels}
        rowLabels={rowLabels}
        cellWidth={cellWidth}
        cellProps={(rowIndex, colIndex) => ({
          sx: {
            ...(tempHighlightedCells[colIndex]?.has(rowIndex)
              ? {
                  backgroundColor: (theme) => theme.palette.success.dark,
                }
              : highlightedCells[colIndex]?.has(rowIndex)
                ? {
                    backgroundColor: 'pink',
                    backgroundImage: `repeating-linear-gradient(
                    45deg,
                    rgba(0, 0, 0, 0),
                    rgba(0, 0, 0, 0) 5px,
                    rgba(0, 0, 0, 0.6) 5px,
                    rgba(0, 0, 0, 0.6) 6px
                  )`,
                    backgroundSize: '8px 8px, 8px 8px',
                  }
                : {}),
          },
          cursor: 'cell',
          component: 'button',
        })}
        handleMouseDown={handleMouseDown}
        handleMouseEnter={handleMouseEnter}
        handleMouseUp={handleMouseUp}
      />
    );
  }
);

TimeGrid.displayName = 'TimeGrid';

export default TimeGrid;
