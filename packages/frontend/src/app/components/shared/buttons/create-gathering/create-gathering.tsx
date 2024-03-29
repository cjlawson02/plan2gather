import GroupsIcon from '@mui/icons-material/Groups'; // or any other relevant icon
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';

import type { Theme } from '@mui/material/styles';

export default function CreateGatheringButton({ variant }: { variant: 'toolbar' | 'homepage' }) {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const route = '/create';
  const icon = <GroupsIcon />;
  const isToolbar = variant === 'toolbar';
  const text = 'Plan a Gathering';

  if (isToolbar) {
    return isMobile ? (
      <IconButton href={route} color="primary">
        {icon}
      </IconButton>
    ) : (
      <Button href={route} startIcon={icon} variant="outlined">
        {text}
      </Button>
    );
  }

  return (
    <Button
      href={route}
      startIcon={(isMobile || variant !== 'homepage') && icon}
      variant={variant === 'homepage' ? 'contained' : 'outlined'}
      data-testid="create-gathering"
    >
      {text}
    </Button>
  );
}
