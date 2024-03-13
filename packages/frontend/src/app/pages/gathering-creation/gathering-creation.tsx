import { Card, CardContent } from '@mui/material';
import Typography from '@mui/material/Typography';

import CreationStepper from '@/app/components/creation-form/stepper/stepper';

export default function Creation() {
  return (
    <>
      <Typography component="h1" variant="h4" align="left" color="text.primary" gutterBottom>
        Plan a Gathering
      </Typography>
      <Card>
        <CardContent>
          <CreationStepper />
        </CardContent>
      </Card>
    </>
  );
}
