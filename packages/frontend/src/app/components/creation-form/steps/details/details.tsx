import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { DateTime } from 'luxon';
import { forwardRef, useImperativeHandle } from 'react';
import {
  AutocompleteElement,
  FormContainer,
  TextFieldElement,
  TextareaAutosizeElement,
  useForm,
} from 'react-hook-form-mui';
import { zones } from 'tzdata';

import { gatheringFormDetailsSchema } from '@backend/types';

import type { GatheringFormDetails } from '@backend/types';

const DetailsStep = forwardRef<
  unknown,
  { initial: GatheringFormDetails; disableTimezoneEdit?: boolean }
>(({ initial, disableTimezoneEdit }, ref) => {
  // Get all valid timezones
  const allTimeZones = Object.entries(zones)
    .filter(([_, v]) => Array.isArray(v))
    .map(([zoneName]) => zoneName)
    .filter((tz) => DateTime.local().setZone(tz).isValid && tz.includes('/'))
    .sort((a, b) => {
      // Extract the numerical part and parse it into an integer
      const offsetA = parseInt(a.split('GMT')[1], 10);
      const offsetB = parseInt(b.split('GMT')[1], 10);

      // Compare the integer offsets
      return offsetA - offsetB;
    });

  const formContext = useForm<GatheringFormDetails>({
    resolver: zodResolver(gatheringFormDetailsSchema),
    defaultValues: initial ?? undefined,
  });

  const selectedTimezone = formContext.watch('timezone') as string | null;

  const selectedDateTime = DateTime.local().setZone(formContext.watch('timezone'));

  const diffTimezone = formContext.watch('timezone') !== initial?.timezone;
  const calculatedDiff = selectedDateTime.offset / 60 - DateTime.local().offset / 60;

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const isFormValid = await new Promise<{
        valid: boolean;
        data?: GatheringFormDetails;
      }>((resolve) => {
        void formContext.handleSubmit(
          (data) => {
            resolve({ valid: true, data });
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
    <>
      <Typography variant="h5">Gathering Details</Typography>
      <Typography variant="subtitle2" gutterBottom sx={{ paddingBottom: 1.5 }}>
        Treat all fields as public information. Do not include any personal information.
      </Typography>
      <FormContainer formContext={formContext}>
        <Stack spacing={2} direction="column">
          <Stack spacing={2} maxWidth="sm" sx={{ alignSelf: 'center' }}>
            <TextFieldElement
              name="name"
              label="Gathering Name"
              helperText="This name will be shared with all participants."
              required
            />
            <TextareaAutosizeElement
              name="description"
              label="Gathering Description"
              helperText="Optionally include a description of your gathering."
            />
            <AutocompleteElement
              name="timezone"
              label="Gathering Timezone"
              options={allTimeZones}
              autocompleteProps={{
                isOptionEqualToValue: (option, value) => option === value,
                getOptionLabel: (option) => option.replace(/_/g, ' '),
                filterOptions: (options, { inputValue }) => {
                  const normalizedInput = inputValue.toLowerCase().replace(/\s/g, '_'); // Replace spaces with underscores and make lowercase for comparison
                  return options.filter((option) => option.toLowerCase().includes(normalizedInput));
                },
                disabled: disableTimezoneEdit,
              }}
              textFieldProps={{
                helperText:
                  'The user will be notified if their timezone is different from the gathering timezone.',
              }}
              required
            />
            {(disableTimezoneEdit ?? false) && (
              <Typography variant="subtitle2" sx={{ color: 'warning.main' }} gutterBottom>
                This gathering is in {formContext.watch('timezone')}. To change the timezone, create
                a new gathering.
              </Typography>
            )}
          </Stack>
          {selectedTimezone != null && (
            <Grid container sx={{ textAlign: 'center' }}>
              <Grid xs={12} sm={diffTimezone ? 5 : 12}>
                <Typography variant="subtitle2" gutterBottom>
                  Current time in {formContext.watch('timezone')}:{' '}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {selectedDateTime.toFormat('ff')}
                </Typography>
              </Grid>
              {diffTimezone && (
                <>
                  <Grid xs={12} sm={2}>
                    {/* Show an arrow pointing to the left, and + or - how many hours between the timezones */}
                    <Typography variant="subtitle2" gutterBottom>
                      Time difference:{' '}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {/* Calculate hours different */}
                      {!Number.isNaN(calculatedDiff) ? '+' : ''}
                      {calculatedDiff} hours
                    </Typography>
                  </Grid>
                  <Grid xs={12} sm={5}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your current time in {initial?.timezone}:{' '}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {DateTime.local().setZone(initial?.timezone).toFormat('ff')}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </Stack>
      </FormContainer>
    </>
  );
});

DetailsStep.displayName = 'DetailsStep';

DetailsStep.defaultProps = {
  disableTimezoneEdit: false,
};

export default DetailsStep;
