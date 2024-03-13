import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Paper, Stack } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

import { formattedWeekday } from '@/app/components/time-grid/time-grid.helpers';

import type { DateRangeLuxon, Weekday } from '@backend/types';

export interface TimePopoverProps {
  weekday: Weekday;
  dateRange: DateRangeLuxon;
  users: string[];
  timezone: string;
  bestTime?: boolean;
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  const nameParts = name.split(' ');
  let initials;

  if (nameParts.length > 1) {
    // If the name has at least two parts, use the first letter of the first two parts
    initials = `${nameParts[0][0]}${nameParts[1][0]}`;
  } else {
    // If the name is a single word, use the first two letters of that word
    initials = nameParts[0].substring(0, 1);
  }

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials,
  };
}

export default function TimePopover({
  weekday,
  dateRange,
  users,
  timezone,
  bestTime,
}: TimePopoverProps) {
  const { start, end } = dateRange;
  const startDate = start.setZone(timezone);
  const endDate = end.setZone(timezone);
  const maxAmt = 4;
  const displayedUsers = useMemo<string[]>(
    () => (users.length <= maxAmt ? users : users.slice(0, maxAmt - 1)),
    [users]
  );
  const overflowUsers = useMemo<string[]>(
    () => (users.length <= maxAmt ? [] : users.slice(maxAmt - 1)),
    [users]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Paper
        sx={{
          padding: '10px',
        }}
      >
        <Typography variant="body1">
          {formattedWeekday(weekday)}
          {' @ '}
          {startDate.toFormat('t')}
          {' - '}
          {endDate.toFormat('t')}
        </Typography>
        <Typography variant="subtitle2">{timezone}</Typography>
        <Stack spacing={2} direction="row" sx={{ justifyContent: 'flex-end' }}>
          {bestTime === true && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: 'lime', width: '100%' }}
            >
              <CheckCircleOutlineIcon />
              <Typography variant="subtitle2">Best time</Typography>
            </Stack>
          )}
          <Box>
            <AvatarGroup>
              {displayedUsers.map((user) => (
                <Tooltip title={user} key={user}>
                  {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                  <Avatar {...stringAvatar(user)} />
                </Tooltip>
              ))}
              {overflowUsers.length > 0 && (
                <Tooltip title={overflowUsers.join(', ')}>
                  <Avatar>+{overflowUsers.length}</Avatar>
                </Tooltip>
              )}
            </AvatarGroup>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
