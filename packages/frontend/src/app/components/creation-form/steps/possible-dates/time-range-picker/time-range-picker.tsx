/* eslint-disable react/jsx-props-no-spreading */
import { Box, FormHelperText, FormLabel } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { TimePickerElement, type TimePickerElementProps } from 'react-hook-form-mui';

interface TimeRangeProps {
  timezone: string | undefined;
  helperText?: string;
  sx?: Record<string, unknown>;
}

export default function TimeRangePicker({ sx, helperText, timezone }: TimeRangeProps) {
  const timeSteps = { hours: 1, minutes: 30 };

  const [startTime, setStartTime] = useState(null);

  const timePickerProps = (name: 'start' | 'end'): TimePickerElementProps => ({
    name: `${name}`,
    label: name === 'start' ? 'Start Time' : 'End Time',
    timeSteps,
    minutesStep: timeSteps.minutes,
    timezone,
    required: true,
    disableIgnoringDatePartForTimeValidation: true,
  });

  return (
    <Box>
      <FormLabel required>Time Range</FormLabel>
      <Stack direction="row" spacing={1} sx={{ ...sx, alignItems: 'center', minWidth: 310 }}>
        <TimePickerElement
          {...timePickerProps('start')}
          onChange={setStartTime}
          aria-describedby="time-range-helper-text"
        />
        <Typography>&ndash;</Typography>
        <TimePickerElement
          {...timePickerProps('end')}
          minTime={startTime}
          aria-describedby="time-range-helper-text"
        />
      </Stack>
      <FormHelperText sx={{ mx: '14px' }} id="time-range-helper-text">
        {helperText}
      </FormHelperText>
    </Box>
  );
}
