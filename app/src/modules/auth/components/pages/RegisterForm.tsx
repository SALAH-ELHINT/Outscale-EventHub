import FormProvider, { RHFTextField } from '@common/components/lib/react-hook-form';
import { LockOpen } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Typography, Link, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import useAuth, { RegisterInput } from '@modules/auth/hooks/api/useAuth';
import Routes from '@common/defs/routes';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/router';

const RegisterForm = () => {
  const { register } = useAuth();
  const router = useRouter();

  const RegisterSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email format')
      .max(191, 'Email cannot exceed 191 characters')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(191, 'Password cannot exceed 191 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Password confirmation is required'),
  });

  const methods = useForm<RegisterInput>({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: '',
    }
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: RegisterInput) => {
    const response = await register(data, { 
      displayProgress: true, 
      displaySuccess: true 
    });
    
    if (response.success) {
      router.push(Routes.Common.Home);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Typography
        component="h1"
        variant="h4"
        sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}
      >
        Create Account
      </Typography>

      <Card sx={{ p: 3 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RHFTextField 
                name="email" 
                label="Email" 
                autoComplete="email"
              />
            </Grid>

            <Grid item xs={12}>
              <RHFTextField 
                name="password" 
                label="Password" 
                type="password"
                autoComplete="new-password"
                helperText="Must contain at least 8 characters, one uppercase, one lowercase and one number"
              />
            </Grid>

            <Grid item xs={12}>
              <RHFTextField 
                name="passwordConfirmation" 
                label="Confirm Password" 
                type="password"
                autoComplete="new-password"
              />
            </Grid>

            <Grid item xs={12}>
              <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                type="submit"
                startIcon={<LockOpen />}
                loadingPosition="start"
                loading={isSubmitting}
              >
                Create Account
              </LoadingButton>
            </Grid>

            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href={Routes.Auth.Login} sx={{ textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </FormProvider>
      </Card>
    </Box>
  );
};

export default RegisterForm;