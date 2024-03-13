import { render } from '@testing-library/react';

import { timeOnlyISO } from '@backend/utils';

import TimePopover from './time-popover';

import type { DateRangeLuxon } from '@backend/types';

const dateRange: DateRangeLuxon = {
  start: timeOnlyISO('2022-01-01T00:00:00.000Z'),
  end: timeOnlyISO('2022-01-01T23:59:59.999Z'),
};

describe('TimePopover', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TimePopover
        weekday="monday"
        dateRange={dateRange}
        users={['Chris']}
        timezone="America/Los_Angeles"
      />
    );
    expect(baseElement).toBeTruthy();
  });
});
