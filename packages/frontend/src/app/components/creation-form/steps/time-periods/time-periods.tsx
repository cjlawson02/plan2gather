import {
  convertBackendDatesToTimePeriods,
  convertTimePeriodsToBackendDates,
  sortWeekdays,
} from '@backend/utils';
import { useMediaQuery } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Fragment, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { FormContainer } from 'react-hook-form-mui';

import TimeRangeSelections from './time-range-selections/time-range-selections';

import type { Weekday, Availability } from '@backend/types';
import type { Theme } from '@mui/material';
import type { DateTime } from 'luxon';

export interface TimePeriodsStepProps {
  initial: Availability;
  days: Weekday[];
  restrictions?: Availability;
  allowMultiple?: boolean;
  assumeFullDay?: boolean;
  timezone: string | undefined;
}

function DayHeaderCell({ day }: { day: Weekday }) {
  return <TableCell>{day.charAt(0).toUpperCase() + day.slice(1)}</TableCell>;
}

const TimePeriodsStep = forwardRef<unknown, TimePeriodsStepProps>(
  ({ initial, days, restrictions, timezone, allowMultiple, assumeFullDay }, ref) => {
    const initialValues = convertBackendDatesToTimePeriods(initial);
    const formContext = useForm<Record<string, DateTime>>({
      defaultValues: initialValues ?? {},
    });
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    const sortedDays = sortWeekdays(days);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const isFormValid = await new Promise<{
          valid: boolean;
          data?: Availability;
        }>((resolve) => {
          void formContext.handleSubmit(
            (data) => {
              resolve({
                valid: true,
                data:
                  assumeFullDay ?? false
                    ? convertTimePeriodsToBackendDates(data, days)
                    : convertTimePeriodsToBackendDates(data),
              });
            },
            () => {
              resolve({ valid: false });
            }
          )();
        });

        return isFormValid;
      },
    }));

    return (
      <FormContainer formContext={formContext}>
        <TableContainer>
          <Table>
            {isSmallScreen ? (
              sortedDays.map((day) => (
                <Fragment key={day}>
                  <TableHead>
                    <TableRow>
                      <DayHeaderCell day={day} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ verticalAlign: 'top' }}>
                      <TableCell>
                        <TimeRangeSelections
                          initial={initialValues ?? {}}
                          day={day}
                          restriction={restrictions?.[day]?.[0]}
                          timezone={timezone}
                          allowMultiple={allowMultiple ?? false}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Fragment>
              ))
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    {sortedDays.map((day) => (
                      <DayHeaderCell key={day} day={day} />
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ verticalAlign: 'top' }}>
                    {sortedDays.map((day) => (
                      <TableCell key={day}>
                        <TimeRangeSelections
                          initial={initialValues ?? {}}
                          day={day}
                          restriction={restrictions?.[day]?.[0]}
                          timezone={timezone}
                          allowMultiple={allowMultiple ?? false}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </>
            )}
          </Table>
        </TableContainer>
      </FormContainer>
    );
  }
);

export default TimePeriodsStep;

TimePeriodsStep.displayName = 'TimePeriodsStep';

TimePeriodsStep.defaultProps = {
  restrictions: undefined,
  allowMultiple: false,
  assumeFullDay: false,
};
