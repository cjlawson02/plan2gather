import { Typography } from '@mui/material';

import TimeGrid from './time-grid';
import { combineTimeSlots, parseListForTimeSlots } from './time-grid.helpers';

import type { UserAvailability } from '@backend/types';

interface TimeGridWrapperProps {
  userAvailability: UserAvailability[];
  timezone: string;
  requiredUsers: string[];
  allUsers: string[];
}

export default function TimeGridWrapper({
  userAvailability,
  timezone,
  requiredUsers,
  allUsers,
}: TimeGridWrapperProps) {
  const { data, columnLabels, rowLabels } = parseListForTimeSlots(
    combineTimeSlots(userAvailability, timezone),
    requiredUsers,
    allUsers,
    timezone
  );
  return data.length > 0 ? (
    <TimeGrid data={data} columnLabels={columnLabels} rowLabels={rowLabels} timezone={timezone} />
  ) : (
    <Typography>No availability found</Typography>
  );
}
