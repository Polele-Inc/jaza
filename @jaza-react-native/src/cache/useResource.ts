import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { jazaCache, type RevalidateOptions } from './createCache.js';

export type UseResourceOptions = RevalidateOptions & {
  /** Revalidate when app returns to foreground. Default false. */
  revalidateOnFocus?: boolean;
};

export type UseResourceResult<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (
    data?: T | ((current: T | undefined) => T),
    opts?: { revalidate?: boolean },
  ) => Promise<T | undefined>;
  revalidate: () => Promise<T | undefined>;
};

export function useResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options?: UseResourceOptions,
): UseResourceResult<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const dedupingInterval = options?.dedupingInterval ?? 2000;
  const revalidateOnFocus = options?.revalidateOnFocus ?? false;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!key) return () => {};
      return jazaCache.subscribe(key, onStoreChange);
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    if (!key) {
      return {
        data: undefined as T | undefined,
        error: undefined as Error | undefined,
        validating: false,
        version: 0,
      };
    }
    const entry = jazaCache.getEntry<T>(key);
    return {
      data: entry.data,
      error: entry.error,
      validating: Boolean(entry.promise),
      version: entry.updatedAt,
    };
  }, [key]);

  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!key) return;
    void jazaCache.revalidate(key, () => fetcherRef.current(), {
      dedupingInterval,
    });
  }, [key, dedupingInterval]);

  useEffect(() => {
    if (!key || !revalidateOnFocus) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void jazaCache.revalidate(key, () => fetcherRef.current(), {
          dedupingInterval: 0,
        });
      }
    });
    return () => sub.remove();
  }, [key, revalidateOnFocus]);

  const revalidate = useCallback(async () => {
    if (!key) return undefined;
    return jazaCache.revalidate(key, () => fetcherRef.current(), {
      dedupingInterval: 0,
    });
  }, [key]);

  const mutate = useCallback(
    async (
      data?: T | ((current: T | undefined) => T),
      opts?: { revalidate?: boolean },
    ) => {
      if (!key) return undefined;
      return jazaCache.mutate(key, data, {
        revalidate: opts?.revalidate,
        fetcher: () => fetcherRef.current(),
      });
    },
    [key],
  );

  const isLoading = key != null && snap.data === undefined && snap.validating;
  const isValidating = Boolean(snap.validating);

  return {
    data: snap.data,
    error: snap.error,
    isLoading,
    isValidating,
    mutate,
    revalidate,
  };
}
