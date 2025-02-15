import { NextPage } from 'next';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import Routes from '@common/defs/routes';
import RequestPasswordReset from '@modules/auth/components/pages/RequestPasswordReset';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const RequestPasswordResetPage: NextPage = () => {
  return (
    <>
      <RequestPasswordReset />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'common', 'auth'])),
  },
});

export default withAuth(RequestPasswordResetPage, {
  mode: AUTH_MODE.LOGGED_OUT,
  redirectUrl: Routes.Common.Home,
});
