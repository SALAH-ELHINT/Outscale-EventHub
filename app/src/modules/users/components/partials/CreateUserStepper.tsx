import FormStepper, { FormStep } from '@common/components/lib/navigation/FormStepper';
import Routes from '@common/defs/routes';
import Step1 from '@modules/users/components/partials/create/Step1';
import Step2 from '@modules/users/components/partials/create/Step2';
import useUsers, { CreateOneInput } from '@modules/users/hooks/api/useUsers';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

enum CREATE_USER_STEP_ID {
  STEP1 = 'step1',
  STEP2 = 'step2',
}

interface CreateUserStepperProps {}
const CreateUserStepper = (_props: CreateUserStepperProps) => {
  const { createOne } = useUsers();
  const router = useRouter();
  const { t } = useTranslation(['user']);

  const steps: FormStep<CREATE_USER_STEP_ID>[] = [
    {
      id: CREATE_USER_STEP_ID.STEP1,
      label: t('user:form.step1_label'),
      component: Step1,
    },
    {
      id: CREATE_USER_STEP_ID.STEP2,
      label: t('user:form.step2_label'),
      component: Step2,
    },
  ];

  const onSubmit = async (data: CreateOneInput) => {
    const response = await createOne(data, {
      displayProgress: true,
      displaySuccess: true,
    });
    if (response.success) {
      router.push(Routes.Users.ReadAll);
      return true;
    }
    return false;
  };
  return (
    <>
      <FormStepper<CreateOneInput, CREATE_USER_STEP_ID>
        id="create-user-stepper"
        steps={steps}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default CreateUserStepper;
