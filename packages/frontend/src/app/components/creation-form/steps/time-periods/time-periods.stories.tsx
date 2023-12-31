import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

import TimePeriodsStep from './time-periods';

import type { Meta } from '@storybook/react';

const meta: Meta<typeof TimePeriodsStep> = {
  component: TimePeriodsStep,
  decorators: [
    (Story) => (
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Story />
      </LocalizationProvider>
    ),
  ],
};
export default meta;

export const Primary = {
  args: {
    initial: {
      tuesday: [
        {
          start: '2023-12-05T09:00:00.000-08:00',
          end: '2023-12-05T10:00:00.000-08:00',
        },
      ],
      thursday: [
        {
          start: '2023-12-05T01:00:00.000-08:00',
          end: '2023-12-05T04:00:00.000-08:00',
        },
      ],
    },
    days: ['tuesday', 'thursday'],
    allowMultiple: false,
    timezone: 'America/Los_Angeles',
  },
};
