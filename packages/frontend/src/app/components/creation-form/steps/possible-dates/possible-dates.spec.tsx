import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';

import PossibleDatesStep from './possible-dates';

import type { PossibleDatesData } from '@/app/components/creation-form/creation.store';

describe('PossibleDatesStep', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <PossibleDatesStep
          initial={{} as unknown as PossibleDatesData}
          timezone="America/Los_Angeles"
        />
      </LocalizationProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
