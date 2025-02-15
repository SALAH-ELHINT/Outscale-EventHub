import { NextPage } from 'next';
import LoginForm from '@modules/auth/components/pages/LoginForm';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import Routes from '@common/defs/routes';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const LoginPage: NextPage = () => {
  return (
    <>
      <LoginForm />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'sign-in', 'common'])),
  },
});
export default withAuth(LoginPage, { mode: AUTH_MODE.LOGGED_OUT, redirectUrl: Routes.Common.Home });
