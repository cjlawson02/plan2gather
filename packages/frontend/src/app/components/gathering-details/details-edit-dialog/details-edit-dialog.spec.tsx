import { render } from '@testing-library/react';
import { GatheringFormData } from '@plan2gather/backend/types';
import DetailsEditDialog from './details-edit-dialog';
import { TRPCWrapper } from '../../../../utils/test-utils';

describe('DetailsEditDialog', () => {
  const defaultGatheringData: GatheringFormData = {
    name: 'Test Gathering',
    description: 'Test Gathering Description',
    timezone: 'America/New_York',
    allowedPeriods: {
      wednesday: [
        {
          start: '2021-10-10T12:00:00.000Z',
          end: '2021-10-10T13:00:00.000Z',
        },
      ],
    },
  };

  it('should render successfully', () => {
    const { baseElement } = render(
      <TRPCWrapper>
        <DetailsEditDialog
          data={defaultGatheringData}
          open
          onClose={() => {}}
        />
      </TRPCWrapper>
    );
    expect(baseElement).toBeTruthy();
  });
});