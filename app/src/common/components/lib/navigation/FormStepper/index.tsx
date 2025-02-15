import { Stack, SxProps, Theme, Step, StepButton, Stepper, StepLabel, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { Ref, useEffect, useRef, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Routes from '@common/defs/routes';
import { Any, AnyObject } from '@common/defs/types';
import { alpha } from '@mui/material/styles';
import useStepper from '@common/hooks/useStepper';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';

export type StepComponent<T, P = Any> = (
  props: P & {
    ref?: Ref<T | undefined>;
  }
) => JSX.Element;

export interface FormStepRef {
  submit: () => Promise<void>;
}
export interface FormStepProps {
  previous: () => void;
  next: (data?: AnyObject) => void;
  ref: Ref<FormStepRef | undefined>;
  data: AnyObject | undefined;
}
export interface FormStep<FORM_STEP_ID> {
  id: FORM_STEP_ID;
  label: string;
  component: StepComponent<FormStepRef, FormStepProps>;
  previousLabel?: string;
  nextLabel?: string;
}
interface FormStepperProps<FormData, FORM_STEP_ID> {
  id: string;
  steps: FormStep<FORM_STEP_ID>[];
  onSubmit: (data: FormData) => Promise<boolean>;
  abortLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  endLabel?: string;
  sx?: SxProps<Theme>;
  vertical?: boolean;
}
const FormStepper = <FormData extends AnyObject, FORM_STEP_ID>({
  vertical = false,
  ...props
}: FormStepperProps<FormData, FORM_STEP_ID>) => {
  const { id, steps, onSubmit, abortLabel, previousLabel, nextLabel, endLabel, sx } = props;
  const [activeStepId, setActiveStepId] = useState<FORM_STEP_ID>(steps[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const formRef = useRef<FormStepRef>();
  const { t } = useTranslation(['common']);
  const {
    loaded,
    setStepData,
    getStepData,
    getAllData,
    isStepCompleted,
    setLastVisitedStepId,
    lastVisitedStepId,
    reset,
  } = useStepper<FormData, FORM_STEP_ID>(id);
  const activeStep = steps.find((step) => step.id === activeStepId);
  const isFirstStep = activeStepId === steps[0].id;
  const isLastStep = activeStepId === steps[steps.length - 1].id;
  useEffect(() => {
    if (loaded) {
      if (lastVisitedStepId) {
        setActiveStepId(lastVisitedStepId);
      }
    }
  }, [loaded]);
  if (!activeStep) {
    router.push(Routes.Common.NotFound);
    return null;
  }
  const onPrevious = () => {
    if (!isFirstStep) {
      setActiveStepId(steps[steps.findIndex((s) => s.id === activeStepId) - 1].id);
    }
  };
  const onNext = async () => {
    if (formRef && formRef.current && formRef.current.submit) {
      await formRef.current.submit();
    }
  };
  const next = (data?: AnyObject) => {
    if (data) {
      setStepData(activeStepId, data);
    }
    if (!isLastStep) {
      const nextStepId = steps[steps.findIndex((s) => s.id === activeStepId) + 1].id;
      setActiveStepId(nextStepId);
      setLastVisitedStepId(nextStepId);
    } else {
      const allData = getAllData();
      if (allData) {
        setIsSubmitting(true);
        onSubmit(allData).then((success) => {
          if (success) {
            reset();
          }
          setIsSubmitting(false);
        });
      }
    }
  };
  const getPreviousLabel = () => {
    if (isFirstStep && abortLabel) {
      return abortLabel;
    }
    if (activeStep.previousLabel) {
      return activeStep.previousLabel;
    }
    if (previousLabel) {
      return previousLabel;
    }
    return isFirstStep ? t('common:cancel') : t('common:previous');
  };
  const getNextLabel = () => {
    if (isLastStep && endLabel) {
      return endLabel;
    }
    if (activeStep.nextLabel) {
      return activeStep.nextLabel;
    }
    if (nextLabel) {
      return nextLabel;
    }
    return isLastStep ? t('common:finish') : t('common:next');
  };
  return (
    <>
      <Stack sx={sx} gap={4} flexDirection={vertical ? 'row' : 'column'}>
        <Stepper
          nonLinear
          alternativeLabel={!vertical}
          activeStep={steps.findIndex((s) => s.id === activeStepId)}
          orientation={vertical ? 'vertical' : 'horizontal'}
          sx={{ height: 'fit-content' }}
        >
          {steps.map((step) => (
            <Step
              key={step.id as string}
              id={step.id as string}
              completed={isStepCompleted(step.id)}
              disabled={!isStepCompleted(step.id) && lastVisitedStepId !== step.id}
            >
              <StepButton
                onClick={() => {
                  setActiveStepId(step.id);
                }}
              >
                <StepLabel>{step.label}</StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <Stack gap={4} flex={1}>
          {loaded ? (
            <activeStep.component
              ref={formRef}
              previous={onPrevious}
              next={next}
              data={getStepData(activeStep.id)}
            />
          ) : (
            <Skeleton variant="rounded" height={200} />
          )}
          <Stack direction="row" alignItems="center">
            {!isFirstStep && (
              <Button
                onClick={onPrevious}
                variant="text"
                startIcon={<ArrowBackIcon />}
                disabled={isSubmitting}
                sx={{
                  paddingY: 1.5,
                  paddingX: 2.5,
                  color: 'error.main',
                  backgroundColor: 'common.white',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.12),
                  },
                }}
              >
                {getPreviousLabel()}
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              onClick={onNext}
              disabled={isSubmitting}
              sx={{
                paddingY: 1.5,
                paddingX: 2.5,
                marginLeft: 'auto',
              }}
              endIcon={<ArrowForwardIcon />}
            >
              {getNextLabel()}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default FormStepper;
