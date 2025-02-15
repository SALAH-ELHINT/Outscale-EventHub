import { Any } from '@common/defs/types';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import useFetch from '@common/hooks/useFetch';
import { useTranslation } from 'react-i18next';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: T;
}
export interface FetchApiOptions {
  verbose?: boolean;
  displaySuccess?: boolean;
  displayProgress?: boolean;
}
export interface ApiOptions extends FetchApiOptions {
  headers?: HeadersInit;
  data?: Any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}
const useApi = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { makeFetch } = useFetch<ApiResponse<Any>>();
  const { t, i18n } = useTranslation(['common']);

  const fetchApi = useCallback(
    async <T>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> => {
      const authToken = localStorage.getItem('authToken');
      const headers: Headers = new Headers();
      headers.set('Accept', 'application/json');
      if (!(options?.data instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      headers.set('Accept-Language', i18n.language);
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }
      if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          headers.set(key, value as string);
        });
      }
      const method = options?.method ?? (options?.data ? 'POST' : 'GET');
      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      const verbose = options?.verbose ?? false;
      if (verbose) {
        console.log(`useApi: requesting ${url}`, options);
      }

      const requestOptions = {
        method,
        headers,
        data: options?.data,
      };

      const response = await makeFetch(url, {
        verbose,
        displayProgress: options?.displayProgress,
        request: requestOptions,
      });

      if (verbose) {
        console.log(`useApi: response`, response);
      }
      if (!response) {
        const errorMessage = t('common:error_occurred');
        enqueueSnackbar(errorMessage, { variant: 'error' });
        return { success: false, errors: [errorMessage] };
      }
      if (!response.success && !response.errors) {
        response.success = false;
        response.errors = [t('common:error_occurred')];
      }
      const displaySuccess = options?.displaySuccess ?? false;
      if (!response.success) {
        if (response.errors) {
          for (let i = 0; i < response.errors.length; i++) {
            enqueueSnackbar(response.errors[i], { variant: 'error' });
          }
        } else {
          enqueueSnackbar(t('common:error_occurred'), { variant: 'error' });
        }
      } else if (displaySuccess && response.message) {
        enqueueSnackbar(response.message, { variant: 'success' });
      }
      return response;
    },
    [enqueueSnackbar, makeFetch, t, i18n.language]
  );

  return fetchApi;
};

export default useApi;
