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
    setLoading(true); // Set loading to true
    setError(null); // Clear previous errors
    setResponse(null); // Clear previous response
    const displayProgress = options?.displayProgress ?? false;
    const verbose = options?.verbose ?? false;

    try {
      if (displayProgress) {
        start(); // Start the progress bar
      }

      if (verbose) {
        console.log('Starting fetch request...');
        console.log('URL:', url);
        console.log('Options:', options);
      }

      let finalUrl = url;
      const requestOptions: RequestInit = { ...options?.request };

      if (options?.request?.data) {
        if (requestOptions.method === 'GET') {
          const queryParams = createURLSearchParams(options.request.data);
          // Handle GET request by adding query parameters to the URL
          const urlObj = new URL(url); // Parse the initial URL
          urlObj.search += (urlObj.search ? '&' : '') + queryParams; // Add new parameters to existing parameters
          finalUrl = urlObj.toString(); // Convert the URL object back to a string
        } else if (
          requestOptions.method === 'POST' ||
          requestOptions.method === 'PUT' ||
          requestOptions.method === 'PATCH' ||
          requestOptions.method === 'DELETE'
        ) {
          if (!(options?.request?.data instanceof FormData)) {
            if (options?.request?.headers?.get('Content-Type') === 'application/json') {
              // Handle POST, PUT, DELETE requests by setting the request body
              requestOptions.body = JSON.stringify(options.request.data);
            } else if (
              options?.request?.headers?.get('Content-Type') === 'application/x-www-form-urlencoded'
            ) {
              const queryParams = createURLSearchParams(options.request.data);
              requestOptions.body = queryParams;
            } else {
              // Most of the case it will be Content-Type=text/html, let's format the body correctly
              requestOptions.body = JSON.stringify(options.request.data);
            }
          } else {
            requestOptions.body = options.request.data;
          }
        }
      }

      const httpResponse = await fetch(finalUrl, requestOptions);

      if (verbose) {
        console.log('HTTP response status:', httpResponse.status);
      }

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

      setResponse(response); // Set the response state

      if (verbose) {
        console.log('Fetch successful, response:', response);
      }

      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Set the error message
        if (verbose) {
          console.error('Fetch error:', err.message);
        }
      } else {
        setError('An error occurred'); // Set a generic error message
        if (verbose) {
          console.error('Fetch error: An error occurred');
        }
      }
      return null;
    } finally {
      setLoading(false); // Set loading to false
      if (displayProgress) {
        stop(); // Stop the progress bar
      }
      if (verbose) {
        console.log('Fetch request completed.');
      }
    }
  }, []);

  return { response, loading, error, makeFetch };
};

export default useFetch;
