import { useState, useEffect } from 'react';
import useSWRImmutable, { KeyedMutator } from 'swr';
import useApi, { ApiResponse, FetchApiOptions } from '@common/hooks/useApi';
import { Any, CrudApiRoutes, Id } from '@common/defs/types';

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  totalItems: number;
}
export interface FilterParam {
  filterColumn: string;
  filterOperator: string;
  filterValue?: Any;
}

export interface SortParam {
  column: string;
  dir: string;
}

interface SavedReadAllParams {
  page?: number;
  pageSize?: number | 'all';
  columnsSort?: SortParam;
  filter?: FilterParam;
}

export type ItemsData<Item> = { items: Item[]; meta: PaginationMeta };
export type ItemData<Item> = { item: Item };
export type ItemsResponse<Item> = ApiResponse<ItemsData<Item>>;
export type ItemResponse<Item> = ApiResponse<ItemData<Item>>;

export interface UseItemsHook<Item, CreateOneInput, UpdateOneInput> {
  items: Item[] | null;
  paginationMeta: PaginationMeta | null;
  createOne: (_input: CreateOneInput, options?: FetchApiOptions) => Promise<ItemResponse<Item>>;
  readOne: (id: Id, options?: FetchApiOptions) => Promise<ItemResponse<Item>>;
  readAll: (
    page?: number,
    pageSize?: number | 'all',
    columnsSort?: SortParam,
    filterParam?: FilterParam[],
    options?: FetchApiOptions
  ) => Promise<ItemsResponse<Item>>;
  updateOne: (
    id: Id,
    _input: UpdateOneInput,
    options?: FetchApiOptions
  ) => Promise<ItemResponse<Item>>;
  patchOne: (
    id: Id,
    _input: Partial<UpdateOneInput>,
    options?: FetchApiOptions
  ) => Promise<ItemResponse<Item>>;
  deleteOne: (id: Id, options?: FetchApiOptions) => Promise<ItemResponse<Item>>;
  mutate: () => void;
}

export interface UseItemsOptions {
  fetchItems?: boolean;
  pageSize?: number;
}
export const defaultOptions = {
  fetchItems: false,
  pageSize: 25,
};

export type UseItems<Item, CreateOneInput = Any, UpdateOneInput = Any> = (
  opts?: UseItemsOptions
) => UseItemsHook<Item, CreateOneInput, UpdateOneInput>;

const useItems = <Item, CreateOneInput, UpdateOneInput>(
  apiRoutes: CrudApiRoutes,
  opts: UseItemsOptions = defaultOptions
): UseItemsHook<Item, CreateOneInput, UpdateOneInput> => {
  const fetchApi = useApi();
  const [shouldRefetch, setShouldRefetch] = useState(opts.fetchItems);
  const [savedReadAllParams, setSavedReadAllParams] = useState<SavedReadAllParams | null>();

  const { data, mutate } = useSWRImmutable<Item[] | null>(
    shouldRefetch ? apiRoutes.ReadAll : null,
    async (_url: string) => {
      if (!shouldRefetch) {
        return null;
      }
      const response = await readAll(
        savedReadAllParams?.page,
        savedReadAllParams?.pageSize,
        savedReadAllParams?.columnsSort,
        savedReadAllParams && savedReadAllParams.filter ? [savedReadAllParams?.filter] : []
      );
      return response.data?.items ?? null;
    }
  );

  const mutateAndRefetch: KeyedMutator<Item[] | null> = async () => {
    setShouldRefetch(true);
    mutate();
    return null;
  };

  const [items, setItems] = useState<Item[] | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    setItems(data ?? null);
  }, [data]);

  const createOne = async (input: CreateOneInput, options?: FetchApiOptions) => {
    const response = await fetchApi<ItemData<Item>>(apiRoutes.CreateOne, {
      method: 'POST',
      data: input,
      ...options,
    });

    if (response.success) {
      mutateAndRefetch();
    }

    return response;
  };

  const readOne = async (id: Id, options?: FetchApiOptions) => {
    const response = await fetchApi<ItemData<Item>>(
      apiRoutes.ReadOne.replace('{id}', id.toString()),
      options
    );

    return response;
  };

  const readAll = async (
    page?: number,
    pageSize?: number | 'all',
    columnsSort?: SortParam,
    filters?: FilterParam[],
    options?: FetchApiOptions
  ) => {
    setSavedReadAllParams((value) => ({
      ...value,
      page,
      pageSize,
      columnsSort,
      filters,
    }));

    const paginationOptions = {
      page: page || 1,
      perPage: pageSize || 50,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: ignoring uncorrect params type mismatch
    const queryParams = new URLSearchParams(paginationOptions).toString();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: ignoring uncorrect params type mismatch
    const filterParam = filters
      ?.filter((filter) => filter !== undefined && filter !== null)
      .map((filter) => encodeURIComponent(JSON.stringify(filter)))
      .join('&filters[]=');

    const sortParams = columnsSort
      ? `&order[column]=${columnsSort.column}&order[dir]=${columnsSort.dir}`
      : '';

    const response = await fetchApi<ItemsData<Item>>(
      `${apiRoutes.ReadAll}?${queryParams}${sortParams}${
        filterParam !== undefined && filterParam !== null && filterParam !== ''
          ? '&filters[]=' + filterParam
          : ''
      }`,
      options
    );
    if (response.success) {
      setItems(response.data?.items ?? null);
      setPaginationMeta(response.data?.meta ?? null);
    }

    return response;
  };

  const updateOne = async (id: Id, input: UpdateOneInput, options?: FetchApiOptions) => {
    const response = await fetchApi<ItemData<Item>>(
      apiRoutes.UpdateOne.replace('{id}', id.toString()),
      {
        method: 'PUT',
        data: input,
        ...options,
      }
    );

    if (response.success) {
      mutateAndRefetch();
    }

    return response;
  };

  const patchOne = async (id: Id, input: Partial<UpdateOneInput>, options?: FetchApiOptions) => {
    const response = await fetchApi<ItemData<Item>>(
      apiRoutes.UpdateOne.replace('{id}', id.toString()),
      {
        method: 'PATCH',
        data: input,
        ...options,
      }
    );

    if (response.success) {
      mutateAndRefetch();
    }

    return response;
  };

  const deleteOne = async (id: Id, options?: FetchApiOptions) => {
    const response = await fetchApi<ItemData<Item>>(
      apiRoutes.DeleteOne.replace('{id}', id.toString()),
      {
        method: 'DELETE',
        ...options,
      }
    );

    if (response.success) {
      mutateAndRefetch();
    }

    return response;
  };

  return {
    items,
    paginationMeta,
    createOne,
    readOne,
    readAll,
    updateOne,
    patchOne,
    deleteOne,
    mutate: mutateAndRefetch,
  };
};

export default useItems;
