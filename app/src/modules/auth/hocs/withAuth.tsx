import React from 'react';
import { useRouter } from 'next/router';
import useAuth from '@modules/auth/hooks/api/useAuth';
import Routes from '@common/defs/routes';

type Props = Record<string, unknown>;

export enum AUTH_MODE {
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
}

interface WithAuthOptions {
  mode?: AUTH_MODE;
  redirectUrl?: string;
}

const withAuth = (Component: React.ComponentType<Props>, options: WithAuthOptions = {}) => {
  // create a new component that renders the original component with auth checking
  const WrappedComponent = (props: Props) => {
    const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
    if (authEnabled) {
      const router = useRouter();
      const { user } = useAuth();
      const mode = options.mode ?? AUTH_MODE.LOGGED_IN;
      if (mode === AUTH_MODE.LOGGED_IN && !user) {
        // if login coming from home page then dont add url query param
        if (router.pathname === Routes.Common.Home) {
          router.push(options.redirectUrl ?? Routes.Auth.Login);
          return null;
        }
        // if login coming from any other page then add url query param to redirect back to the same page after login
        router.push({
          pathname: options.redirectUrl ? options.redirectUrl : Routes.Auth.Login,
          query: { url: encodeURIComponent(router.pathname) },
        });
        return null;
      }
      if (mode === AUTH_MODE.LOGGED_OUT && user) {
        // if there is a url query param then redirect to that url after login
        if (router.query.url) {
          router.push(decodeURIComponent(router.query.url as string));
          return null;
        }
        router.push(options.redirectUrl ?? Routes.Common.Home);
        return null;
      }
    }

    return <Component {...(props as Props)} />;
  };

  // set the display name of the wrapped component for debugging purposes
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default withAuth;
