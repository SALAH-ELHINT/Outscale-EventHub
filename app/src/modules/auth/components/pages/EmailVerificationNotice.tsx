import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useApi from '@common/hooks/useApi';
import ApiRoutes from '@common/defs/api-routes';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

const VerifyEmail = () => {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const fetchApi = useApi();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const { expires, signature } = router.query;
                if (!expires || !signature) {
                    setStatus('error');
                    setMessage('Invalid verification link: Missing parameters');
                    return;
                }

                const queryString = `?expires=${expires}&signature=${signature}`;
                const response = await fetchApi(ApiRoutes.Auth.VerifyEmail + queryString);
                
                if (response.success) {
                    setStatus('success');
                    setMessage(response.message || 'Email verified successfully');

                    setTimeout(() => {
                        router.push(response.redirect || '/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Failed to verify email');
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
                    <Typography sx={{ mt: 2 }}>
                        Verifying your email address...
                    </Typography>
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

export default VerifyEmail;