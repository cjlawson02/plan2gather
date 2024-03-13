import GatheringDetails from './gathering-details';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof GatheringDetails> = {
  component: GatheringDetails,
};
export default meta;
type Story = StoryObj<typeof GatheringDetails>;

export const Primary: Story = {
  args: {
    gatheringData: {
      name: 'Test Gathering',
      description: 'This is a test gathering',
      timezone: 'America/New_York',
      allowedPeriod: [{ start: '', end: '' }],
      id: '123',
      availability: [{ start: '', end: '' }],
      creationDate: '',
    },
  },
};
