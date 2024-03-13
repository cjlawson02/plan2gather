import { Stack, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DateTime } from 'luxon';
import { forwardRef, useImperativeHandle } from 'react';
import { FormContainer, ToggleButtonGroupElement, useForm } from 'react-hook-form-mui';

import { weekdays } from '@backend/types';
import { sortWeekdays } from '@backend/utils';

import TimeRangePicker from './time-range-picker/time-range-picker';

import type { PossibleDatesData } from '@/app/components/creation-form/creation.store';
import type { Weekday } from '@backend/types';

interface PossibleDatesStepProps {
  initial: PossibleDatesData;
  timezone: string | undefined;
}

const PossibleDatesStep = forwardRef<unknown, PossibleDatesStepProps>(
  ({ initial, timezone }, ref) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const formContext = useForm<{ weekdays: Weekday[]; start: DateTime; end: DateTime }>({
      defaultValues: {
        weekdays: initial.weekdays ?? [],
        start: initial.period?.start ?? DateTime.local().set({ hour: 9, minute: 0 }),
        end: initial.period?.end ?? DateTime.local().set({ hour: 17, minute: 0 }),
      },
    });

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const isFormValid = await new Promise<{
          valid: boolean;
          data?: PossibleDatesData;
        }>((resolve) => {
          void formContext.handleSubmit(
            (data) => {
              if (data.weekdays.length === 0) {
                resolve({ valid: false });
              } else {
                resolve({
                  valid: true,
                  data: {
                    weekdays: sortWeekdays(data.weekdays),
                    period: { start: data.start, end: data.end },
                  },
                });
              }
            },
            () => {
              resolve({ valid: false });
            }
          )();
        });

        return isFormValid;
      },
    }));

    const options = weekdays.map((day) => ({
      id: day,
      label: day.slice(0, isMobile ? 1 : 3),
    }));

    return (
      <>
        <Typography variant="h5" gutterBottom>
          What days are best?
        </Typography>
        <FormContainer formContext={formContext}>
          <Stack spacing={2} direction="column">
            <Stack spacing={2} maxWidth="sm" sx={{ alignSelf: 'center' }}>
              <ToggleButtonGroupElement
                name="weekdays"
                label="Days of the Week"
                helperText="Select days of the week that would work for the gathering"
                options={options}
                required
              />
              <TimeRangePicker
                sx={{ mt: 2 }}
                helperText="Select what time range the gathering should ocurr between"
                timezone={timezone}
              />
            </Stack>
          </Stack>
        </FormContainer>
      </>
    );
  }
);

PossibleDatesStep.displayName = 'PossibleDatesStep';

export default PossibleDatesStep;
