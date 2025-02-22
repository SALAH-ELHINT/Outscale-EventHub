import ApiRoutes from '@common/defs/api-routes';
import useApi from '@common/hooks/useApi';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const VerifyEmail = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const fetchApi = useApi();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { expires, signature } = router.query;
        if (!expires || !signature) return;

        const queryString = `?expires=${expires}&signature=${signature}`;
        const response = await fetchApi(ApiRoutes.Auth.VerifyEmail + queryString);

        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Email verified successfully');

          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify email. Invalid verification link.');
      }
    };

    if (router.isReady && router.query.expires && router.query.signature) {
      verifyEmail();
    }
  }, [router.isReady, router.query]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      {status === 'loading' && (
        <>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Verifying your email address...</Typography>
        </>
      )}

      {status === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
  if (locale && locale !== 'fr') {
    return {
      redirect: {
        destination: `/verify-email?${new URLSearchParams(
          query as Record<string, string>
        ).toString()}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'auth'])),
    },
  };
};

export default VerifyEmail;
