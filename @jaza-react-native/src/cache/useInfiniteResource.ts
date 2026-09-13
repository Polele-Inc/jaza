import { useCallback, useEffect, useRef, useState } from 'react';
import { jazaCache } from './createCache.js';

export type UseInfiniteResourceResult<TPage> = {
  pages: TPage[];
  size: number;
  setSize: (size: number | ((n: number) => number)) => void;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  isLoadingMore: boolean;
  /** Reset to page 0 and revalidate (drops older page cache via prefix). */
  mutate: (opts?: { cachePrefix?: string }) => Promise<void>;
};

/**
 * Infinite list helper. `getKey(index, previousPage)` → cache key or null to stop.
 */
export function useInfiniteResource<TPage>(
  getKey: (index: number, previousPage: TPage | null) => string | null,
  fetcher: (pageKey: string) => Promise<TPage>,
  options?: {
    enabled?: boolean;
    dedupingInterval?: number;
    /** Bump to force full revalidate from page 0 */
    revision?: number | string;
    cachePrefix?: string;
  },
): UseInfiniteResourceResult<TPage> {
  const enabled = options?.enabled ?? true;
  const dedupingInterval = options?.dedupingInterval ?? 2000;
  const revision = options?.revision ?? 0;
  const cachePrefix = options?.cachePrefix;

  const getKeyRef = useRef(getKey);
  getKeyRef.current = getKey;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [size, setSize] = useState(1);
  const [pages, setPages] = useState<TPage[]>([]);
  const [error, setError] = useState<Error | undefined>();
  const [validating, setValidating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  const fetchThrough = useCallback(
    async (pageCount: number, mode: 'replace' | 'append') => {
      if (!enabled) return;
      setValidating(true);
      if (mode === 'append') setLoadingMore(true);
      try {
        const next: TPage[] =
          mode === 'replace' ? [] : [...pagesRef.current];
        let prev: TPage | null =
          mode === 'replace'
            ? null
            : next.length > 0
              ? next[next.length - 1]!
              : null;
        const start = mode === 'replace' ? 0 : next.length;
        for (let i = start; i < pageCount; i++) {
          const key = getKeyRef.current(i, prev);
          if (!key) break;
          const page = await jazaCache.revalidate(
            key,
            () => fetcherRef.current(key),
            {
              dedupingInterval:
                mode === 'replace' && i === 0 ? 0 : dedupingInterval,
            },
          );
          next[i] = page;
          prev = page;
        }
        setPages(next.slice(0, pageCount));
        setError(undefined);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setValidating(false);
        setLoadingMore(false);
      }
    },
    [dedupingInterval, enabled],
  );

  // Initial / revision / enabled → reset size and replace from page 0
  useEffect(() => {
    if (!enabled) {
      setPages([]);
      setSize(1);
      return;
    }
    setSize(1);
    void fetchThrough(1, 'replace');
  }, [enabled, revision, fetchThrough]);

  // Growing size → append
  useEffect(() => {
    if (!enabled || size <= 1) return;
    if (pagesRef.current.length >= size) return;
    void fetchThrough(size, 'append');
  }, [enabled, size, fetchThrough]);

  const mutate = useCallback(
    async (opts?: { cachePrefix?: string }) => {
      const prefix = opts?.cachePrefix ?? cachePrefix;
      if (prefix) jazaCache.clearPrefix(prefix);
      setSize(1);
      await fetchThrough(1, 'replace');
    },
    [cachePrefix, fetchThrough],
  );

  return {
    pages,
    size,
    setSize,
    error,
    isLoading: enabled && pages.length === 0 && validating,
    isValidating: validating,
    isLoadingMore: loadingMore,
    mutate,
  };
}
