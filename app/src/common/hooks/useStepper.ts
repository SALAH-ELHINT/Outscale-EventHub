import { AnyObject } from '@common/defs/types';
import { useEffect, useMemo, useState } from 'react';

interface Step<STEP_ID> {
  id: STEP_ID;
  data: AnyObject;
}
interface Stepper<STEP_ID> {
  id: string;
  steps: Step<STEP_ID>[];
  lastVisitedStepId?: STEP_ID;
}

const useStepper = <Data extends AnyObject, STEP_ID>(id: string) => {
  const defaultStepper: Stepper<STEP_ID> = useMemo(() => {
    return {
      id,
      steps: [],
    };
  }, [id]);
  const [stepper, setStepper] = useState<null | Stepper<STEP_ID>>(null);

  useEffect(() => {
    const existing = localStorage.getItem('steppers');
    if (existing) {
      const existingData = JSON.parse(existing);
      const existingIndex = existingData.findIndex((item: Stepper<STEP_ID>) => item.id === id);
      if (existingIndex > -1) {
        setStepper(existingData[existingIndex]);
      }
    } else {
      setStepper(defaultStepper);
    }
  }, []);

  useEffect(() => {
    if (stepper) {
      const stepperData = stepper;
      const existing = localStorage.getItem('steppers');
      if (!existing) {
        localStorage.setItem('steppers', JSON.stringify([stepperData]));
      } else {
        const existingData = JSON.parse(existing);
        const existingIndex = existingData.findIndex((item: Stepper<STEP_ID>) => item.id === id);
        if (existingIndex > -1) {
          existingData[existingIndex] = stepperData;
        } else {
          existingData.push(stepperData);
        }
        localStorage.setItem('steppers', JSON.stringify(existingData));
      }
    }
  }, [stepper]);

  const setStepData = (stepId: STEP_ID, data: AnyObject) => {
    if (!stepper) {
      return;
    }
    const newSteps = [...stepper.steps];
    const stepIndex = newSteps.findIndex((step) => step.id === stepId);
    if (stepIndex > -1) {
      newSteps[stepIndex].data = data;
    } else {
      newSteps.push({ id: stepId, data });
    }

    setStepper((prevState) => {
      const newStepper: Stepper<STEP_ID> | null = prevState;
      if (newStepper) {
        newStepper.steps = newSteps;
      }
      return newStepper;
    });
  };
  const getStep = (stepId: STEP_ID) => {
    return stepper ? stepper.steps.find((step) => step.id === stepId) : undefined;
  };
  const getStepData = (stepId: STEP_ID) => {
    const step = getStep(stepId);
    if (step) {
      return step.data;
    }
  };
  const isStepCompleted = (stepId: STEP_ID) => {
    const step = getStep(stepId);
    if (!step) {
      return false;
    }
    return Object.keys(step.data).length > 0;
  };
  const getAllData = (): Data | undefined => {
    if (!stepper) {
      return undefined;
    }
    const data = stepper.steps.reduce((acc: AnyObject, step: Step<STEP_ID>) => {
      return { ...acc, ...step.data };
    }, {});
    return data as Data;
  };
  const setLastVisitedStepId = (stepId: STEP_ID) => {
    if (!stepper) {
      return;
    }
    setStepper((stepper) => {
      if (stepper) {
        return { ...stepper, lastVisitedStepId: stepId };
      }
      return stepper;
    });
  };
  const reset = () => {
    setStepper(defaultStepper);
  };
  const loaded = stepper !== null;
  const lastVisitedStepId = stepper?.lastVisitedStepId;
  return {
    loaded,
    stepper,
    setStepper,
    setStepData,
    getStep,
    getStepData,
    isStepCompleted,
    getAllData,
    setLastVisitedStepId,
    lastVisitedStepId,
    reset,
  };
};

export default useStepper;
