import Forbidden from '@modules/permissions/components/pages/Forbidden';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const ForbiddenPage: NextPage = () => {
  return (
    <>
      <Forbidden />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'permissions'])),
  },
});

export default ForbiddenPage;
