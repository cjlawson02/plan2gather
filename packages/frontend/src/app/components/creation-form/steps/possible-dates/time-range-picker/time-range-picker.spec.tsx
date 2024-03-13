import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import { FormContainer } from 'react-hook-form-mui';

import TimeRangePicker from './time-range-picker';

describe('TimeRangePicker', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <FormContainer>
          <TimeRangePicker
            index={0}
            range={{ start: null, end: null, id: '1234' }}
            onRemove={() => {}}
            onUpdate={() => {}}
          />
        </FormContainer>
      </LocalizationProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
