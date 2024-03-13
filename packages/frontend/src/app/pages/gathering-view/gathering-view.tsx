import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import DetailsEditDialog from '@/app/components/dialogs/details-edit/details-edit';
import TimePeriodDialog from '@/app/components/dialogs/user-availability/user-availability';
import Filter from '@/app/components/filter/filter';
import { CopyButton } from '@/app/components/shared/buttons/copy/copy';
import DropdownShareButton from '@/app/components/shared/buttons/share/share';
import TimeGrid from '@/app/components/time-grid/time-grid';
import { formattedWeekday } from '@/app/components/time-grid/time-grid.helpers';
import NotFound from '@/app/pages/not-found/not-found';
import { trpc } from '@/trpc';

import useGatheringViewData from './gathering-view.store';

import type { Weekday } from '@backend/types';

export default function GatheringView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const params = useParams();
  const id = params.id!;

  const {
    cellData,
    rowLabels,
    columnLabels,
    mostParticipants,
    checkedUsers,
    bestTimes,
    setCellData,
  } = useGatheringViewData((state) => ({
    cellData: state.cellData,
    rowLabels: state.rowLabels,
    columnLabels: state.columnLabels,
    mostParticipants: state.mostParticipants,
    checkedUsers: state.checkedUsers,
    bestTimes: state.bestTimes,
    setCellData: state.setCellData,
  }));

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const gathering = trpc.gatherings.get.useQuery({
    id,
  });
  const ownAvailability = trpc.gatherings.getOwnAvailability.useQuery({
    id,
  });
  const fullAvailability = trpc.gatherings.getAvailability.useQuery({
    id,
  });
  const editPerms = trpc.gatherings.getEditPermission.useQuery({
    id,
  });

  const isLoading =
    gathering.isLoading ||
    fullAvailability.isLoading ||
    ownAvailability.isLoading ||
    editPerms.isLoading;

  const { data } = gathering;
  const fullAvailabilityData = fullAvailability.data;
  const ownAvailabilityData = ownAvailability.data === 'none' ? undefined : ownAvailability.data;
  const canEdit = editPerms.data ?? false;

  const modifiedAvailabilityData = useMemo(() => {
    if (fullAvailabilityData == null || data?.timezone == null) return [];

    return fullAvailabilityData.map((item) => {
      const allowedWeekdays = data?.allowedPeriod.weekdays;
      const availability = Object.entries(item.availability)
        .filter(([weekday]) => allowedWeekdays?.includes(weekday as Weekday))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      return { ...item, availability };
    });
  }, [fullAvailabilityData, data?.allowedPeriod, data?.timezone]);

  useEffect(() => {
    if (modifiedAvailabilityData.length > 0 && data?.timezone != null) {
      const userLabels = modifiedAvailabilityData.map((a) => a.name);
      setCellData(modifiedAvailabilityData, data.timezone, checkedUsers, userLabels);
    }
  }, [modifiedAvailabilityData, data?.timezone, checkedUsers, setCellData]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (data == null) {
    return <NotFound />;
  }

  let userLabels: string[] = [];
  if (fullAvailabilityData != null) {
    userLabels = fullAvailabilityData.map((a) => a.name);
  }

  const userTimezone = DateTime.local().zoneName;

  return (
    <>
      <Box sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h3" component="h1">
            {data.name}
          </Typography>
          {canEdit && (
            <Tooltip title="Edit" arrow disableInteractive>
              <IconButton
                onClick={() => {
                  setOpenEdit(true);
                }}
                aria-label="edit"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <DropdownShareButton />
        </Stack>
        {data.description != null && data.description.length > 0 && (
          <Typography variant="subtitle2">Description: {data.description}</Typography>
        )}
        <Typography variant="subtitle2">Event timezone: {data.timezone}</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  {ownAvailabilityData != null ? 'Your Availability' : 'Add your Availability'}
                </Typography>
                <Typography variant="body2" align="center" gutterBottom>
                  {ownAvailabilityData != null
                    ? 'Edit your availability by clicking the button below'
                    : 'Join the gathering to add your availability'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button onClick={handleClickOpen} variant="outlined">
                    {ownAvailabilityData != null
                      ? `Edit ${ownAvailabilityData.name}'s Availability`
                      : 'Join Gathering'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  Invite Others
                </Typography>
                <Typography variant="body2" align="center" gutterBottom>
                  Share this gathering with others
                </Typography>
                <TextField
                  defaultValue={window.location.href}
                  size="small"
                  sx={{ width: '100%' }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <CopyButton
                          text={window.location.href}
                          ariaLabel="copy link to clipboard"
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </CardContent>
            </Card>
            {fullAvailabilityData != null && fullAvailabilityData.length > 0 && (
              <>
                <Card>
                  <CardContent>
                    <Typography variant="h6" align="center">
                      Participants
                    </Typography>
                    <Typography variant="body2" align="center" gutterBottom>
                      Select to only show when they are available
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Filter userLabels={userLabels} />
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="h6">Best Times</Typography>
                      <CheckCircleOutlineIcon />
                    </Stack>
                    <Typography variant="body2" align="center" gutterBottom>
                      Times are shown in the event&apos;s timezone
                    </Typography>
                    {bestTimes.length > 0 ? (
                      bestTimes.map((data) => {
                        const timeText = `${formattedWeekday(data.weekday)}, ${data.period.start.toFormat('t')} - ${data.period.end.toFormat('t')}`;
                        return (
                          <Stack
                            direction="row"
                            spacing={1}
                            key={timeText}
                            sx={{ mb: 1 }}
                            alignItems="center"
                          >
                            <Tooltip title={`${data.names.join(', ')}`} arrow disableInteractive>
                              <Chip
                                color={
                                  data.names.length === bestTimes[0].names.length
                                    ? 'primary'
                                    : 'default'
                                }
                                label={`${data.names.length}/${data.totalParticipants}`}
                              />
                            </Tooltip>
                            <Typography>{timeText}</Typography>
                            <CopyButton text={timeText} ariaLabel="copy time to clipboard" />
                          </Stack>
                        );
                      })
                    ) : (
                      <Typography align="center">No best times found</Typography>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </Stack>
        </Grid>

        <Grid xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5">Group Availability</Typography>
              <Typography variant="body2" gutterBottom>
                Times are shown in the event&apos;s timezone. Click a time slot to view participants
                who are available at that time.
              </Typography>
              <Divider />
              {data.timezone !== userTimezone && (
                <Typography variant="subtitle2" sx={{ color: 'warning.main' }} gutterBottom>
                  The time grid is in the {data.timezone} timezone.
                </Typography>
              )}
              {fullAvailabilityData != null &&
              fullAvailabilityData.length > 0 &&
              cellData.length > 0 ? (
                <TimeGrid
                  data={cellData}
                  rowLabels={rowLabels}
                  columnLabels={columnLabels}
                  timezone={data.timezone}
                  mostParticipants={mostParticipants}
                />
              ) : (
                <Stack alignItems="center" sx={{ mt: 2 }}>
                  <Typography variant="h6" align="center">
                    No availability submitted yet!
                  </Typography>
                  <Typography variant="body2" align="center" gutterBottom>
                    Submit yours by clicking the button below
                  </Typography>
                  <Button onClick={handleClickOpen} variant="outlined">
                    Join Gathering
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <TimePeriodDialog
        initial={ownAvailabilityData}
        gatheringData={data}
        open={dialogOpen}
        onClose={handleClose}
      />
      <DetailsEditDialog
        data={data}
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
        }}
      />
    </>
  );
}
