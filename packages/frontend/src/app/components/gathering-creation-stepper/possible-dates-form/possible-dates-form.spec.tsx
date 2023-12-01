import { render } from '@testing-library/react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import PossibleDatesForm from './possible-dates-form';

describe('PossibleDatesForm', () => {
  it('should render successfully', () => {
    const mockOnSuccessfulSubmit = vi.fn();

    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <PossibleDatesForm
          formData={{ type: 'date', data: [] }}
          onSuccessfulSubmit={mockOnSuccessfulSubmit}
        />
      </LocalizationProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
