import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { TRPCWrapper } from '@/utils/test-utils';

import DetailsEditDialog from './details-edit';

import type { GatheringFormData } from '@backend/types';

describe('DetailsEditDialog', () => {
  const defaultGatheringData: GatheringFormData = {
    name: 'Test Gathering',
    description: 'Test Gathering Description',
    timezone: 'America/New_York',
    allowedPeriod: {
      weekdays: ['sunday'],
      period: {
        start: '2021-10-10T12:00:00.000Z',
        end: '2021-10-10T13:00:00.000Z',
      },
    },
  };

  it('should render successfully', () => {
    const { baseElement } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <BrowserRouter>
          <TRPCWrapper>
            <DetailsEditDialog data={defaultGatheringData} open onClose={() => {}} />
          </TRPCWrapper>
        </BrowserRouter>
      </LocalizationProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
