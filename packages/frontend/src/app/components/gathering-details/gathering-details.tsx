import { Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';

import useCreationStore from '@/app/components/creation-form/creation.store';
import BulletedList from '@/app/components/shared/bulleted-list/bulleted-list';
import BulletedListItem from '@/app/components/shared/bulleted-list/bulleted-list-item/bulleted-list-item';
import { formattedWeekday } from '@/app/components/time-grid/time-grid.helpers';

export default function GatheringDetails() {
  const userTimezone = DateTime.local().zoneName;

  const details = useCreationStore((state) => state.details);
  const allowedPeriod = useCreationStore((state) => state.allowedPeriod);

  return (
    <>
      <Typography variant="h6">{details.name}</Typography>
      <Typography variant="body1" gutterBottom>
        {details.description}
      </Typography>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2">Event Timezone: {details.timezone}</Typography>
        {details.timezone !== userTimezone && (
          <Typography variant="body2">Your Timezone: {userTimezone}</Typography>
        )}
      </Box>
      {/* show allowed weekdays and allowed time */}
      <Typography variant="h6">Days of the week</Typography>
      <Typography variant="subtitle2">
        Participants will submit their availability for the following days of the week:
      </Typography>
      <Stack direction="row" spacing={1}>
        <BulletedList>
          {allowedPeriod.weekdays.map((weekday) => (
            <BulletedListItem key={weekday}>{formattedWeekday(weekday)}</BulletedListItem>
          ))}
        </BulletedList>
      </Stack>
      <Typography variant="h6">Time Range</Typography>
      <Typography variant="subtitle2">
        Participants will submit their availability for the following time range:
      </Typography>
      <Typography variant="body1">
        {allowedPeriod.period.start.toFormat('t')} - {allowedPeriod.period.end.toFormat('t')}
      </Typography>
    </>
  );
}
