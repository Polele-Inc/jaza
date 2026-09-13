'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  EMPTY_SNAPSHOT,
  jazaCache,
  type RevalidateOptions,
  type ResourceSnapshot,
} from './createCache.js';

export type UseResourceOptions = RevalidateOptions & {
  /** Web: revalidate on window focus / visibility. Default false. */
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

  const getSnapshot = useCallback((): ResourceSnapshot<T> => {
    if (!key) return EMPTY_SNAPSHOT as ResourceSnapshot<T>;
    return jazaCache.getSnapshot<T>(key);
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
    if (typeof window === 'undefined') return;

    const onFocus = () => {
      void jazaCache.revalidate(key, () => fetcherRef.current(), {
        dedupingInterval: 0,
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocus();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
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
