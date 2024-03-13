import Typography from '@mui/material/Typography';
import { forwardRef, useImperativeHandle } from 'react';

import GatheringDetails from '@/app/components/gathering-details/gathering-details';

const ConfirmationStep = forwardRef<unknown, unknown>((_, ref) => {
  useImperativeHandle(ref, () => ({
    submit: () => ({
      valid: true,
    }),
  }));

  return (
    <>
      <Typography variant="h5">Confirm Gathering</Typography>
      <GatheringDetails />
    </>
  );
});

ConfirmationStep.displayName = 'ConfirmationStep';

export default ConfirmationStep;
