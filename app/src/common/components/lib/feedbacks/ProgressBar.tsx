import { memo, useEffect } from 'react';
import NProgress from 'nprogress';
import { useRouter } from 'next/router';
import { GlobalStyles, useTheme } from '@mui/material';

const ProgressBar = () => {
  const theme = useTheme();
  const router = useRouter();

  NProgress.configure({ showSpinner: false });

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleStart = () => {
      timeout = setTimeout(() => NProgress.start(), 300);
    };

    const handleStop = () => {
      setTimeout(() => {
        NProgress.done();
        clearTimeout(timeout);
      }, 300);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <GlobalStyles
      styles={{
        '#nprogress': {
          pointerEvents: 'none',
          zIndex: 9999,
          '.bar': {
            top: 0,
            left: 0,
            height: 3,
            zIndex: 9999,
            width: '100%',
            position: 'fixed',
            backgroundColor: theme.palette.primary.main,
            boxShadow: `0 0 2px ${theme.palette.primary.main}`,
          },
          '.peg': {
            right: 0,
            opacity: 1,
            width: 100,
            height: '100%',
            display: 'block',
            position: 'absolute',
            transform: 'rotate(3deg) translate(0px, -4px)',
            boxShadow: `0 0 10px ${theme.palette.primary.main}, 0 0 5px ${theme.palette.primary.main}`,
          },
        },
      }}
    />
  );
};

export default memo(ProgressBar);
