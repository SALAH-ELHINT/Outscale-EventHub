import NotFound from '@common/components/pages/NotFound';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const ForbiddenPage: NextPage = () => {
  return (
    <>
      <NotFound />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', '404'])),
  },
});

export default ForbiddenPage;
