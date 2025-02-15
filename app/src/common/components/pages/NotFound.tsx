import NotFoundIllustration from '@common/assets/svgs/NotFoundIllustration';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import Routes from '@common/defs/routes';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation(['404']);
  return (
    <Container className="flex flex-col items-center justify-center pt-12" maxWidth="xs">
      <Typography variant="h3" paragraph className="mb-6" textAlign="center">
        {t('404:not_found')}
      </Typography>
      <Typography
        variant="body1"
        paragraph
        className="mb-6 text-center"
        textAlign="center"
        sx={{ color: 'text.secondary' }}
      >
        {t('404:description')}
        <br />
        {t('404:suggestion')}
      </Typography>
      <NotFoundIllustration
        sx={{
          width: '100%',
          marginTop: '2rem',
          marginBottom: '4rem',
        }}
      />
      <Box sx={{ textAlign: 'center' }}>
        <Button component={NextLink} href={Routes.Common.Home} size="large" variant="contained">
          {t('404:return_home')}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
