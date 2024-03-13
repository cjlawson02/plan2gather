import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { DateTime } from 'luxon';
import { useRef, useState } from 'react';
import { FormContainer, TextFieldElement, useForm } from 'react-hook-form-mui';

import LoadingButton from '@/app/components/shared/buttons/loading/loading';
import { trpc } from '@/trpc';

import TimeGrid from './availability-grid/availability-grid';
import ConfirmTimezoneDialog from './confirm-timezone/confirm-timezone';
import LeaveGatheringDialog from './leave-gathering/leave-gathering';

import type { SubmitFunction } from '@/app/components/creation-form/types';
import type { Availability, GatheringData, UserAvailability } from '@backend/types';

export interface TimePeriodDialogProps {
  initial: UserAvailability | undefined;
  gatheringData: GatheringData;
  open: boolean;
  onClose: () => void;
}

export default function TimePeriodDialog(props: TimePeriodDialogProps) {
  const { gatheringData, onClose, open, initial } = props;

  const [confirmTimezoneOpen, setConfirmTimezoneOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const initialName = initial?.name ?? '';

  const utils = trpc.useUtils();

  const putAvailabilityAPI = trpc.gatherings.putAvailability.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await utils.gatherings.get.invalidate({ id: gatheringData.id });
      await utils.gatherings.getAvailability.invalidate({
        id: gatheringData.id,
      });
      await utils.gatherings.getOwnAvailability.invalidate({
        id: gatheringData.id,
      });
      await utils.gatherings.getParticipatingGatherings.invalidate();
      setLoading(false);
      handleClose();
    },
  });

  const submitRef = useRef<{ submit: SubmitFunction<Availability> }>();

  const formContext = useForm<{ name: string }>({
    defaultValues: {
      name: initialName,
    },
  });

  const submitToAPI = async () => {
    const nameResult = await new Promise<{
      valid: boolean;
      data?: { name: string };
    }>((resolve) => {
      void formContext.handleSubmit(
        (data) => {
          resolve({ valid: true, data });
        },
        () => {
          resolve({ valid: false });
        }
      )();
    });

    const timePeriodResult = await submitRef.current?.submit();

    if (
      timePeriodResult?.valid === true &&
      nameResult.valid &&
      nameResult.data != null &&
      timePeriodResult.data != null
    ) {
      putAvailabilityAPI.mutate({
        id: gatheringData.id,
        availability: {
          name: nameResult.data.name,
          availability: timePeriodResult.data,
        },
      });
    }
  };

  const handleSubmit = () => {
    if (gatheringData.timezone !== DateTime.local().zoneName) {
      setConfirmTimezoneOpen(true);
    } else {
      void submitToAPI();
    }
  };

  return (
    <>
      <Dialog onClose={handleClose} open={open} maxWidth="xl">
        <DialogTitle>Set your availability</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2" gutterBottom>
              Treat all fields as public information. Do not include any personal information.
            </Typography>
            <FormContainer formContext={formContext}>
              <TextFieldElement
                label="Your name"
                name="name"
                helperText="Enter your name as you want it to appear to other participants."
                required
              />
            </FormContainer>
            <Divider />
            <Typography variant="subtitle2" sx={{ color: 'warning.main' }} gutterBottom>
              Please enter your availability in the event timezone: {gatheringData.timezone}
            </Typography>
            <DialogContentText>
              Click and drag to select the times you are available. You can also click and drag to
              deselect times you are not available.
            </DialogContentText>
            <TimeGrid
              initial={initial?.availability ?? {}}
              restriction={gatheringData.allowedPeriod.period}
              days={gatheringData.allowedPeriod.weekdays}
              timezone={gatheringData.timezone}
              ref={submitRef}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {initial != null && (
            <Button
              onClick={() => {
                setLeaveOpen(true);
              }}
              disabled={loading}
              type="button"
              color="error"
              sx={{ mr: 'auto' }}
            >
              Leave Gathering
            </Button>
          )}
          <Button onClick={handleClose} disabled={loading} type="button">
            Cancel
          </Button>
          <LoadingButton onClick={handleSubmit} loading={loading} type="submit">
            Submit Availability
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <ConfirmTimezoneDialog
        timezone={gatheringData.timezone}
        open={confirmTimezoneOpen}
        onClose={(confirmed) => {
          setConfirmTimezoneOpen(false);
          if (confirmed) {
            void submitToAPI();
          }
        }}
      />
      <LeaveGatheringDialog
        open={leaveOpen}
        onClose={(didLeave) => {
          setLeaveOpen(false);
          if (didLeave) {
            handleClose();
          }
        }}
        id={gatheringData.id}
      />
    </>
  );
}
