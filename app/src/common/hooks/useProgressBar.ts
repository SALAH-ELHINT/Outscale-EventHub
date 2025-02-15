import NProgress from 'nprogress';
import { useEffect } from 'react';

const useProgressBar = () => {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    return () => {
      NProgress.remove();
    };
  }, []);

  const start = () => {
    NProgress.start();
  };

  const stop = () => {
    NProgress.done();
  };

  return { start, stop };
};

export default useProgressBar;
