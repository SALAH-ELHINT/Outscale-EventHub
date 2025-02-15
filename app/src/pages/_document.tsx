import palette from '@common/theme/palette';
import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />

        <meta name="theme-color" content={palette.primary.main} />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Meta */}
        <meta name="description" content={process.env.NEXT_PUBLIC_APP_DESCRIPTION} />
        <meta name="keywords" content="react,material,next,application,dashboard,admin,template" />
        <meta name="author" content="CyberScale" />
      </Head>
      <body className="m-0 p-0">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};
export default Document;
