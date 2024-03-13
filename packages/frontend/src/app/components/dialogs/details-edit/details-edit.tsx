import { Button, Dialog, DialogActions, DialogContent, Divider } from '@mui/material';
import { useCallback, useRef, useState } from 'react';

import DetailsStep from '@/app/components/creation-form/steps/details/details';
import PossibleDatesStep from '@/app/components/creation-form/steps/possible-dates/possible-dates';
import LoadingButton from '@/app/components/shared/buttons/loading/loading';
import { trpc } from '@/trpc';
import { timeOnlyISO } from '@backend/utils';

import DeleteGatheringDialog from './delete-gathering/delete-gathering';

import type { PossibleDatesData } from '@/app/components/creation-form/creation.store';
import type { SubmitFunction } from '@/app/components/creation-form/types';
import type { GatheringFormDetails, GatheringData } from '@backend/types';

export interface DetailsEditDialogProps {
  data: GatheringData;
  open: boolean;
  onClose: () => void;
}

export default function DetailsEditDialog(props: DetailsEditDialogProps) {
  const { data, onClose, open } = props;

  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const detailsSubmitRef = useRef<{
    submit: SubmitFunction<GatheringFormDetails>;
  }>();

  const periodSubmitRef = useRef<{
    submit: SubmitFunction<PossibleDatesData>;
  }>();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const utils = trpc.useUtils();

  const submitAPI = trpc.gatherings.putDetails.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await utils.gatherings.get.invalidate({ id: data.id });
      handleClose();
      setLoading(false);
    },
  });

  const handleSubmit = useCallback(async () => {
    const detailsResult = await detailsSubmitRef.current?.submit();
    const periodResult = await periodSubmitRef.current?.submit();
    if (
      detailsResult?.valid === true &&
      periodResult?.valid === true &&
      detailsResult.data != null &&
      periodResult.data != null
    ) {
      submitAPI.mutate({
        id: data.id,
        details: {
          name: detailsResult.data.name,
          description: detailsResult.data.description,
          timezone: detailsResult.data.timezone,
        },
        allowedPeriod: {
          weekdays: periodResult.data.weekdays,
          period: {
            start: periodResult.data.period.start.toISO()!,
            end: periodResult.data.period.end.toISO()!,
          },
        },
      });
    }
  }, [data.id, submitAPI]);

  const details: GatheringFormDetails = {
    name: data.name,
    description: data.description,
    timezone: data.timezone,
  };

  const possibleDates: PossibleDatesData = {
    weekdays: data.allowedPeriod.weekdays,
    period: {
      start: timeOnlyISO(data.allowedPeriod.period.start),
      end: timeOnlyISO(data.allowedPeriod.period.end),
    },
  };

  return (
    <>
      <Dialog
        onClose={() => {
          handleClose();
        }}
        open={open}
      >
        <DialogContent>
          <DetailsStep initial={details} ref={detailsSubmitRef} disableTimezoneEdit />
          <Divider sx={{ my: 2 }} />
          <PossibleDatesStep
            initial={possibleDates}
            timezone={details.timezone}
            ref={periodSubmitRef}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteOpen(true);
            }}
            disabled={loading}
            color="error"
            type="button"
            sx={{ marginRight: 'auto' }}
          >
            Delete Gathering
          </Button>
          <Button
            onClick={() => {
              handleClose();
            }}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={() => {
              void handleSubmit();
            }}
            loading={loading}
            type="submit"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <DeleteGatheringDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
        }}
        id={data.id}
      />
    </>
  );
}
