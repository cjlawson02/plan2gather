import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

import TimeRangePicker from './time-range-picker';

import type { Meta } from '@storybook/react';

const meta: Meta<typeof TimeRangePicker> = {
  component: TimeRangePicker,
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
  args: {},
};
