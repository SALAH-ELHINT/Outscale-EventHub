import {
  FormStepProps,
  FormStepRef,
  StepComponent,
} from '@common/components/lib/navigation/FormStepper';
import { RHFTextField } from '@common/components/lib/react-hook-form';
import CreateCrudItemForm from '@common/components/partials/CreateCrudItemForm';
import {
  FormSubmitResponse,
  CurrentFormStepRef as ParentCurrentFormStepRef,
} from '@common/components/partials/UpsertCrudItemForm';
import Routes from '@common/defs/routes';
import { User } from '@modules/users/defs/types';
import useUsers, { CreateOneInput } from '@modules/users/hooks/api/useUsers';
import { Grid } from '@mui/material';
import { Ref, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

interface CreateUserStep1Props extends FormStepProps {}

interface CurrentFormStepRef extends ParentCurrentFormStepRef {
  submit: () => Promise<FormSubmitResponse<CreateOneInput>>;
}

const CreateUserStep1 = forwardRef((props: CreateUserStep1Props, ref: Ref<FormStepRef>) => {
  const { next, data } = props;
  const formRef = useRef<CurrentFormStepRef>();
  const { t } = useTranslation(['user', 'common']);
  const schema = Yup.object().shape({
    email: Yup.string()
      .email(t('common:email_format_incorrect'))
      .required(t('common:field_required')),
    password: Yup.string().required(t('common:field_required')),
  });
  const defaultValues: Omit<CreateOneInput, 'role'> = {
    email: data?.email || '',
    password: data?.password || '',
  };
  useImperativeHandle(ref, () => ({
    submit: async () => {
      const res = await formRef?.current?.submit();
      if (res && !res.hasErrors) {
        next(res?.data);
      }
    },
  }));
  return (
    <>
      <CreateCrudItemForm<User, CreateOneInput>
        routes={Routes.Users}
        useItems={useUsers}
        schema={schema}
        defaultValues={defaultValues}
        ref={formRef}
        displayCard
        displayFooter={false}
      >
        <Grid container spacing={3} sx={{ padding: 6 }}>
          <Grid item xs={6}>
            <RHFTextField name="email" label={t('common:email')} />
          </Grid>
          <Grid item xs={6}>
            <RHFTextField name="password" label={t('common:password')} type="password" />
          </Grid>
        </Grid>
      </CreateCrudItemForm>
    </>
  );
});

export default CreateUserStep1 as StepComponent<FormStepRef, CreateUserStep1Props>;
