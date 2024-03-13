import TimeGrid from './availability-grid';

import type { Meta } from '@storybook/react';

const meta: Meta<typeof TimeGrid> = {
  component: TimeGrid,
};
export default meta;

export const Primary = {
  args: {
    columnLabels: ['monday', 'tuesday'],
    rowLabels: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM'],
  },
};
