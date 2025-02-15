import ApiRoutes from '@common/defs/api-routes';
import { Upload } from '@modules/uploads/defs/types';
import useApi, { ApiResponse, FetchApiOptions } from '@common/hooks/useApi';
import { Id } from '@common/defs/types';
import useSWRImmutable from 'swr';
import { useEffect, useState } from 'react';

export interface CreateOneInput {
  name?: string;
  file: File;
}

export type UpdateOneInput = CreateOneInput;

export interface UpsertUploadsInput extends CreateOneInput {}

interface UseUploadsResponse {
  items: Upload[] | null;
  createOne: (
    _input: CreateOneInput,
    options?: FetchApiOptions
  ) => Promise<ApiResponse<{ item: Upload }>>;
  readOne: (id: Id, options?: FetchApiOptions) => Promise<ApiResponse<{ item: Upload }>>;
  readAll: (options?: FetchApiOptions) => Promise<ApiResponse<{ items: Upload[] }>>;
  updateOne: (
    id: Id,
    _input: UpdateOneInput,
    options?: FetchApiOptions
  ) => Promise<ApiResponse<{ item: Upload }>>;
  deleteOne: (id: Id, options?: FetchApiOptions) => Promise<ApiResponse<{ item: Upload | null }>>;
  deleteMulti: (ids: Id[], options?: FetchApiOptions) => Promise<ApiResponse<null>>;
}

interface UseUploadsOptions {
  fetchItems?: boolean;
}
const defaultOptions = {
  fetchItems: false,
};

const useUploads = (opts: UseUploadsOptions = defaultOptions): UseUploadsResponse => {
  const fetchApi = useApi();

  const { data, mutate } = useSWRImmutable<Upload[] | null>(
    opts.fetchItems ? ApiRoutes.Uploads.ReadAll : null,
    async (_url: string) => {
      const response = await readAll();
      return response.data?.items ?? null;
    }
  );

  const [items, setItems] = useState<Upload[] | null>(null);

  useEffect(() => {
    setItems(data ?? null);
  }, [data]);

  const createOne = async (
    input: CreateOneInput,
    options?: FetchApiOptions
  ): Promise<ApiResponse<{ item: Upload }>> => {
    const formData = new FormData();
    formData.append('file', input.file);
    const response = await fetchApi<{ item: Upload }>(ApiRoutes.Uploads.CreateOne, {
      method: 'POST',
      data: formData,
      ...options,
    });

    if (response.success) {
      mutate();
    }

    return response;
  };

  const readOne = async (id: Id, options?: FetchApiOptions) => {
    const response = await fetchApi<{ item: Upload }>(
      ApiRoutes.Uploads.ReadOne.replace('{id}', id.toString()),
      options
    );

    return response;
  };
  const readAll = async (options?: FetchApiOptions) => {
    const response = await fetchApi<{ items: Upload[] }>(ApiRoutes.Uploads.ReadAll, options);

    if (response.success) {
      setItems(response.data?.items ?? null);
    }

    return response;
  };

  const updateOne = async (
    id: Id,
    input: UpdateOneInput,
    options?: FetchApiOptions
  ): Promise<ApiResponse<{ item: Upload }>> => {
    const formData = new FormData();
    formData.append('file', input.file);
    const response = await fetchApi<{ item: Upload }>(
      ApiRoutes.Uploads.UpdateOne.replace('{id}', id.toString()),
      {
        method: 'POST',
        data: formData,
        ...options,
      }
    );

    if (response.success) {
      mutate();
    }

    return response;
  };

  const deleteOne = async (id: Id, options?: FetchApiOptions) => {
    const response = await fetchApi<{ item: Upload }>(
      ApiRoutes.Uploads.DeleteOne.replace('{id}', id.toString()),
      {
        method: 'DELETE',
        ...options,
      }
    );

    if (response.success) {
      mutate();
    }

    return response;
  };

  const deleteMulti = async (ids: Id[], options?: FetchApiOptions) => {
    const response = await fetchApi<null>(ApiRoutes.Uploads.ReadAll, {
      method: 'DELETE',
      data: { ids },
      ...options,
    });

    if (response.success) {
      mutate();
    }

    return response;
  };

  return {
    items,
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteMulti,
  };
};

export default useUploads;
