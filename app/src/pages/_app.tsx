import { Theme, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import Layout from '@common/layout/Layout';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import type {} from '@mui/lab/themeAugmentation';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { DataProvider } from '@common/contexts/DataContext';
import palette from '@common/theme/palette';
import typography from '@common/theme/typography';
import shadows from '@common/theme/shadows';
import ProgressBar from '@common/components/lib/feedbacks/ProgressBar';
import LoadingScreen from '@common/components/lib/feedbacks/LoadingScreen';
import customShadows from '@common/theme/customShadows';
import SnackbarProvider from '@common/contexts/SnackbarProvider';
import GlobalStyles from '@common/theme/GlobalStyles';
import ComponentsOverrides from '@common/theme/ComponentsOverrides';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-data-grid-premium/themeAugmentation';
import { RoutingHistoryProvider } from '@common/contexts/RoutingHistoryContext';
import { DialogProvider } from '@common/contexts/DialogContext';
import { appWithTranslation } from 'next-i18next';
import { frFR, enUS, esES } from '@mui/material/locale';
import { getUserLanguage } from '@common/components/lib/utils/language';
import { useRouter } from 'next/router';

// declare module '@mui/material/Button' { // If we add a color, then we need to add the color in each component
//    interface ButtonPropsColorOverrides {
//    }
// }

const App = ({ Component, pageProps }: AppProps) => {
  const { initialized: authInitialized } = useAuth();
  if (!authInitialized) {
    return <LoadingScreen />;
  }
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};
const AppWrapper = (props: AppProps) => {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const router = useRouter();

  useEffect(() => {
    setRootElement(() => document.querySelector('#__next'));
  }, []);

  const getLocale = (lang: string) => {
    switch (lang) {
      case 'en':
        return enUS;
      case 'es':
        return esES;
      default:
        return frFR;
    }
  };

  useEffect(() => {
    const checkAndRedirectLocale = () => {
      const userLang = getUserLanguage();
      const currentLang = router.locale;

      if (userLang && currentLang !== userLang) {
        router.push({ pathname: router.pathname, query: router.query }, router, {
          locale: userLang,
        });
      }
    };

    checkAndRedirectLocale();
  }, [router]);

  useEffect(() => {
    if (rootElement) {
      const locale = getLocale(router.locale || 'fr');
      setTheme(() =>
        createTheme(
          {
            palette,
            typography,
            shape: { borderRadius: 12 },
            shadows,
            customShadows,
            components: ComponentsOverrides,
            breakpoints: {
              values: {
                xs: 0,
                sm: 600,
                md: 960,
                lg: 1280,
                xl: 1920,
              },
            },
          },
          locale
        )
      );
    }
  }, [rootElement]);
  if (!theme) {
    return <LoadingScreen />;
  }
  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles />
          <DataProvider>
            <RoutingHistoryProvider>
              <SnackbarProvider>
                <DialogProvider>
                  <ProgressBar />
                  <App {...props} />
                </DialogProvider>
              </SnackbarProvider>
            </RoutingHistoryProvider>
          </DataProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
};

export default appWithTranslation(AppWrapper);
