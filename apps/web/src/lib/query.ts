import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (typeof window === "undefined" || query.state.data === undefined) {
          return;
        }

        toast.error(getErrorMessage(error));
      },
    }),
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  return (browserQueryClient ??= createQueryClient());
};

type PreviousData<T> = Array<[QueryKey, T | undefined]>;

type OptimisticContext<T> = {
  previousData: PreviousData<T>;
};

type OptimisticArrayUpdateOptions<T> = {
  client: QueryClient;
  queryKey: QueryKey;
  exact?: boolean;
  updater: (items: T[]) => T[];
};

export const createOptimisticArrayUpdate = <T>({
  client,
  queryKey,
  exact = false,
  updater,
}: OptimisticArrayUpdateOptions<T>) => ({
  async onMutate(): Promise<OptimisticContext<T[]>> {
    await client.cancelQueries({ queryKey, exact });

    const previousData = client.getQueriesData<T[]>({
      queryKey,
      exact,
    });

    client.setQueriesData<T[]>({ queryKey, exact }, (data) =>
      Array.isArray(data) ? updater(data) : data
    );

    return { previousData };
  },

  onError(
    _error: unknown,
    _variables: unknown,
    context?: OptimisticContext<T[]>
  ) {
    context?.previousData.forEach(([key, data]) => {
      client.setQueryData(key, data);
    });
  },

  onSettled() {
    return client.invalidateQueries({ queryKey, exact });
  },
});

type OptimisticInfiniteUpdateOptions<TPage, TItem> = {
  client: QueryClient;
  queryKey: QueryKey;
  exact?: boolean;
  getItems: (page: TPage) => TItem[];
  setItems: (page: TPage, items: TItem[]) => TPage;
  updater: (items: TItem[]) => TItem[];
};

export const createOptimisticInfiniteUpdate = <TPage, TItem>({
  client,
  queryKey,
  exact = false,
  getItems,
  setItems,
  updater,
}: OptimisticInfiniteUpdateOptions<TPage, TItem>) => ({
  async onMutate(): Promise<OptimisticContext<InfiniteData<TPage>>> {
    await client.cancelQueries({ queryKey, exact });

    const previousData = client.getQueriesData<InfiniteData<TPage>>({
      queryKey,
      exact,
    });

    client.setQueriesData<InfiniteData<TPage>>({ queryKey, exact }, (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) =>
              setItems(page, updater(getItems(page)))
            ),
          }
        : data
    );

    return { previousData };
  },

  onError(
    _error: unknown,
    _variables: unknown,
    context?: OptimisticContext<InfiniteData<TPage>>
  ) {
    context?.previousData.forEach(([key, data]) => {
      client.setQueryData(key, data);
    });
  },

  onSettled() {
    return client.invalidateQueries({ queryKey, exact });
  },
});
