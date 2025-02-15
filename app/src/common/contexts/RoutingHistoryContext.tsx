import React, { useState, useContext, useEffect, PropsWithChildren, useMemo } from 'react';
import { useRouter } from 'next/router';

type Route = {
  url: string;
  query: { [key: string]: string | string[] | undefined };
};

type RoutingHistoryContextValue = {
  history: Route[];
  previousRoute: Route | null;
  goBack: () => void;
};

const RoutingHistoryContext = React.createContext<RoutingHistoryContextValue>({
  history: [],
  previousRoute: null,
  goBack: () => {},
});

export const RoutingHistoryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const [history, setHistory] = useState<Route[]>([]);
  const [previousRoute, setPreviousRoute] = useState<Route | null>(null);

  useEffect(() => {
    const route: Route = {
      url: router.asPath,
      query: router.query,
    };
    setHistory([route]);
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const route: Route = {
        url,
        query: router.query,
      };
      setHistory((prevHistory) => [...prevHistory, route]);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const goBack = () => {
    if (history.length >= 2) {
      setPreviousRoute(history[history.length - 2]);
      router.back();
    }
  };

  useEffect(() => {
    if (history.length >= 2) {
      setPreviousRoute(history[history.length - 2]);
    } else {
      setPreviousRoute(null);
    }
  }, [history]);

  const contextValue = useMemo(() => {
    return { history, previousRoute, goBack };
  }, [history, previousRoute, goBack]);

  return (
    <RoutingHistoryContext.Provider value={contextValue}>{children}</RoutingHistoryContext.Provider>
  );
};

export const useRoutingHistory = (): RoutingHistoryContextValue =>
  useContext<RoutingHistoryContextValue>(RoutingHistoryContext);
