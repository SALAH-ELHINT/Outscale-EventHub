import ForbiddenIllustration from '@common/assets/svgs/ForbiddenIllustration';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import Routes from '@common/defs/routes';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Forbidden = () => {
  const { t } = useTranslation(['permissions']);
  return (
    <Container className="flex flex-col items-center justify-center pt-12" maxWidth="xs">
      <Typography variant="h3" paragraph className="mb-6" textAlign="center">
        {t('permissions:unauthorized_access')}
      </Typography>
      <Typography
        variant="body1"
        paragraph
        className="mb-6 text-center"
        textAlign="center"
        sx={{ color: 'text.secondary' }}
      >
        {t('permissions:access_limited')}
        <br />
        {t('permissions:contact_admin')}
      </Typography>
      <ForbiddenIllustration
        sx={{
          width: '100%',
          marginTop: '2rem',
          marginBottom: '4rem',
        }}
      />
      <Box sx={{ textAlign: 'center' }}>
        <Button component={NextLink} href={Routes.Common.Home} size="large" variant="contained">
          {t('permissions:return_home')}
        </Button>
      </Box>
    </Container>
  );
};

export default Forbidden;
