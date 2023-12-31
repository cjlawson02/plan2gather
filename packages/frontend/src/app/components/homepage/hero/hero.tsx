import { Box, Typography } from '@mui/material';

import CreateGatheringButton from '@/app/components/shared/buttons/create-gathering/create-gathering';

import HeroLayout from './layout/hero-layout';

export default function Hero() {
  return (
    <HeroLayout
      sxBackground={{
        backgroundImage: 'url(/images/hero.webp)',
        backgroundColor: '#448ab7',
        backgroundPosition: 'center',
      }}
    >
      <Typography variant="h1" fontWeight={1} align="center" color="text.primary">
        Plan2Gather
      </Typography>
      <Typography component="h2" variant="h6" align="center" color="text.primary">
        Discover the lightning-speed hangout harmonizer
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center" paddingTop={2}>
        <CreateGatheringButton variant="homepage" />
      </Box>
    </HeroLayout>
  );
}
