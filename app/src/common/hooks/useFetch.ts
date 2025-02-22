import { Any } from '@common/defs/types';
import useProgressBar from '@common/hooks/useProgressBar';
import useUtils from '@common/hooks/useUtils';
import { useState, useCallback } from 'react';

export interface FetchOptions {
  verbose?: boolean;
  displayProgress?: boolean;
  request?: {
    headers?: Headers;
    data?: Any;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  };
}

const useFetch = <T>() => {
  const [response, setResponse] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { start, stop } = useProgressBar();
  const { createURLSearchParams } = useUtils();

  const makeFetch = useCallback(async (url: string, options?: FetchOptions): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setResponse(null);
    const displayProgress = options?.displayProgress ?? false;
    const verbose = options?.verbose ?? false;

    try {
      if (displayProgress) {
        start();
      }

      let finalUrl = url;
      const requestOptions: RequestInit = { ...options?.request };

      if (options?.request?.data) {
        if (requestOptions.method === 'GET') {
          const queryParams = createURLSearchParams(options.request.data);
         
          const urlObj = new URL(url);
          urlObj.search += (urlObj.search ? '&' : '') + queryParams;
          finalUrl = urlObj.toString();
        } else if (
          requestOptions.method === 'POST' ||
          requestOptions.method === 'PUT' ||
          requestOptions.method === 'PATCH' ||
          requestOptions.method === 'DELETE'
        ) {
          if (!(options?.request?.data instanceof FormData)) {
            if (options?.request?.headers?.get('Content-Type') === 'application/json') {
             
              requestOptions.body = JSON.stringify(options.request.data);
            } else if (
              options?.request?.headers?.get('Content-Type') === 'application/x-www-form-urlencoded'
            ) {
              const queryParams = createURLSearchParams(options.request.data);
              requestOptions.body = queryParams;
            } else {
             
              requestOptions.body = JSON.stringify(options.request.data);
            }
          } else {
            requestOptions.body = options.request.data;
          }
        }
      }

      const httpResponse = await fetch(finalUrl, requestOptions);

      if (!httpResponse.ok && httpResponse.status !== 403) {
        throw new Error(`Error: ${httpResponse.statusText}`);
      }

      let response;
      if (
        (options &&
          options.request &&
          options.request.headers &&
          options.request.headers.get('Accept') === 'application/json') ||
        httpResponse.headers.get('Content-Type') === 'application/json'
      ) {
        response = await httpResponse.json();
      } else {
        response = await httpResponse.text();
      }

      setResponse(response);

      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        if (verbose) {
          console.error('Fetch error:', err.message);
        }
      } else {
        setError('An error occurred');
        if (verbose) {
          console.error('Fetch error: An error occurred');
        }
      }
      return null;
    } finally {
      setLoading(false);
      if (displayProgress) {
        stop();
      }
    }
  }, []);

  return { response, loading, error, makeFetch };
};

export default useFetch;
