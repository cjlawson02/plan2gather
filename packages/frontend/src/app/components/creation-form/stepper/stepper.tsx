import Container from '@mui/material/Container';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import useCreationStore from '@/app/components/creation-form/creation.store';
import Confirmation from '@/app/components/creation-form/steps/confirmation/confirmation';
import DetailsForm from '@/app/components/creation-form/steps/details/details';
import PossibleDates from '@/app/components/creation-form/steps/possible-dates/possible-dates';
import { trpc } from '@/trpc';

import CreationStepperControls from './stepper-controls/stepper-controls';

import type {
  CreationStore,
  PossibleDatesData,
} from '@/app/components/creation-form/creation.store';
import type { SubmitFunction } from '@/app/components/creation-form/types';
import type { GatheringFormData, GatheringFormDetails } from '@backend/types';
import type { Theme } from '@mui/material/styles';

// Define a type for step information
interface StepInfo<T> {
  name: string;
  submitRef: React.RefObject<{ submit: SubmitFunction<T> }>;
}

export default function CreationStepper() {
  // Keeps track of the current step in the stepper
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const detailsRef = useRef<{ submit: SubmitFunction<GatheringFormDetails> }>(null);
  const possibleDatesRef = useRef<{
    submit: SubmitFunction<PossibleDatesData>;
  }>(null);
  const confirmRef = useRef<{ submit: SubmitFunction<undefined> }>(null);

  // Define your steps with their respective refs
  const steps: Array<StepInfo<GatheringFormDetails | PossibleDatesData | undefined>> = useMemo(
    () => [
      { name: 'Details', submitRef: detailsRef },
      { name: 'Possible Dates', submitRef: possibleDatesRef },
      { name: 'Confirm Gathering', submitRef: confirmRef },
    ],
    []
  );

  const store = useCreationStore();

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const utils = trpc.useUtils();
  const createGathering = trpc.gatherings.put.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async (id) => {
      await utils.gatherings.getOwnedGatherings.invalidate();
      navigate(`/gathering/${id}`);
      setLoading(false);
    },
  });

  const transformToGatheringData = useCallback((data: CreationStore): GatheringFormData | null => {
    if (data.details != null && data.allowedPeriod.weekdays.length > 0) {
      const result = {
        name: data.details.name,
        description: data.details.description,
        timezone: data.details.timezone,
        allowedPeriod: {
          weekdays: data.allowedPeriod.weekdays,
          period: {
            start: data.allowedPeriod.period.start.toISO()!,
            end: data.allowedPeriod.period.end.toISO()!,
          },
        },
      };
      return result;
    }
    return null;
  }, []);

  // Handles setting the step
  const handleSetStep = useCallback(
    async (callback: (prevStep: number) => number) => {
      const step = callback(activeStep);
      const currentStepRef = steps[activeStep].submitRef;

      // When navigating forward, we need to do form validation
      if (step > activeStep) {
        const result = await currentStepRef.current?.submit();
        if (result != null && result.valid) {
          // Store the result data based on the active step
          switch (activeStep) {
            case 0:
              store.setDetails(result.data as GatheringFormDetails);
              break;
            case 1:
              store.setAllowedPeriod(result.data as PossibleDatesData);
              break;
            case 2:
            default:
              break;
          }

          // If we're on the last step, create the gathering
          if (steps.length === step) {
            const data = transformToGatheringData(store);
            if (data != null) {
              createGathering.mutate(data);
            } else {
              throw new Error('Invalid data');
            }
          } else {
            setActiveStep(step);
          }
        }
      } else {
        setActiveStep(step);
      }
    },
    [activeStep, createGathering, steps, store, transformToGatheringData]
  );

  const stepComponents = steps.map((step) => {
    switch (step.name) {
      case 'Details':
        return <DetailsForm initial={store.details} ref={step.submitRef} />;
      case 'Possible Dates':
        return (
          <PossibleDates
            initial={store.allowedPeriod}
            timezone={store.details?.timezone}
            ref={step.submitRef}
          />
        );
      case 'Confirm Gathering':
        return <Confirmation ref={step.submitRef} />;
      default:
        return null;
    }
  });

  const createContent = useCallback(
    (child: React.ReactNode) => (
      <>
        <Container>{child}</Container>
        <CreationStepperControls
          activeStep={activeStep}
          setActiveStep={(callback) => {
            void handleSetStep(callback);
          }}
          numSteps={steps.length}
          loading={loading}
        />
      </>
    ),
    [activeStep, handleSetStep, loading, steps.length]
  );

  return (
    <>
      <Stepper
        activeStep={activeStep}
        sx={{ paddingBottom: 2 }}
        orientation={isSmallScreen ? 'vertical' : 'horizontal'}
      >
        {steps.map((step, index) => (
          <Step key={step.name}>
            <StepLabel>{step.name}</StepLabel>
            {isSmallScreen && <StepContent>{createContent(stepComponents[index])}</StepContent>}
          </Step>
        ))}
      </Stepper>
      {!isSmallScreen && createContent(stepComponents[activeStep])}
    </>
  );
}
