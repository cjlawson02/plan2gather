import { useCallback, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircleOutline';
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';
import { DateRange, Weekday } from '@plan2gather/backend/types';
import { DateTime } from 'luxon';
import TimeRangePicker from './time-range-picker/time-range-picker';

type TimeRangeSelectionsProps = {
  initial: Record<string, DateTime>;
  day: Weekday;
  allowMultiple: boolean;
  restriction: DateRange | undefined;
  timezone: string | undefined;
};

function TimeRangeSelections({
  initial,
  day,
  allowMultiple,
  restriction,
  timezone,
}: TimeRangeSelectionsProps) {
  const [timePeriods, setTimePeriods] = useState<{ id: string }[]>([]);

  const addTimePeriod = useCallback(() => {
    setTimePeriods((prev) => [
      ...prev,
      {
        id: uuidv4(),
      },
    ]);
  }, []);

  const removeTimePeriod = useCallback((id: string) => {
    setTimePeriods((prev) => prev.filter((range) => range.id !== id));
  }, []);

  useEffect(() => {
    let totalPeriods = 0;
    Object.keys(initial).forEach((key) => {
      if (key.startsWith(day) && key.endsWith('start')) {
        totalPeriods += 1;
      }
    });

    let tpTotal = timePeriods.length;
    while (tpTotal < totalPeriods) {
      addTimePeriod();
      tpTotal += 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addTimePeriod, day, initial]);

  return (
    <>
      <Stack spacing={1}>
        {timePeriods.map((range, index) => (
          <TimeRangePicker
            key={range.id}
            namePrefix={`${day}_${index}`}
            restriction={restriction}
            timezone={timezone}
            onRemove={() => removeTimePeriod(range.id)}
          />
        ))}
      </Stack>
      {(allowMultiple || timePeriods.length < 1) && (
        <IconButton size="large" onClick={() => addTimePeriod()}>
          <AddCircleIcon fontSize="inherit" />
        </IconButton>
      )}
    </>
  );
}

export default TimeRangeSelections;