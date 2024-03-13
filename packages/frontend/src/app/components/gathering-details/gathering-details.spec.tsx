import { render } from '@testing-library/react';
import { DateTime } from 'luxon';

import useCreationStore from '@/app/components/creation-form/creation.store';

import GatheringDetails from './gathering-details';

describe('GatheringDetails', () => {
  beforeEach(() => {
    useCreationStore.setState({
      details: {
        name: 'Test Gathering',
        description: 'Test Gathering Description',
        timezone: 'America/New_York',
      },
      allowedPeriod: {
        weekdays: ['wednesday'],
        period: {
          start: DateTime.fromISO('2021-10-10T12:00:00.000Z'),
          end: DateTime.fromISO('2021-10-10T13:00:00.000Z'),
        },
      },
    });
  });

  it('should render successfully', () => {
    const { baseElement } = render(<GatheringDetails />);
    expect(baseElement).toBeTruthy();
  });
});
