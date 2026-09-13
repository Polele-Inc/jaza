export type CacheEntry<T = unknown> = {
  data: T | undefined;
  error: Error | undefined;
  updatedAt: number;
  /** In-flight fetch for dedupe */
  promise?: Promise<T>;
  subscribers: Set<() => void>;
};

export type MutateUpdater<T> = T | ((current: T | undefined) => T);

export type RevalidateOptions = {
  /** Skip network if data is fresher than this (ms). Default 2000. */
  dedupingInterval?: number;
};

export type CacheStore = {
  subscribe: (key: string, listener: () => void) => () => void;
  getEntry: <T>(key: string) => CacheEntry<T>;
  revalidate: <T>(
    key: string,
    fetcher: () => Promise<T>,
    opts?: RevalidateOptions,
  ) => Promise<T>;
  mutate: <T>(
    key: string,
    data?: MutateUpdater<T>,
    opts?: { revalidate?: boolean; fetcher?: () => Promise<T> },
  ) => Promise<T | undefined>;
  /** Drop a key (and notify subscribers). */
  clear: (key: string) => void;
  /** Drop all keys matching prefix. */
  clearPrefix: (prefix: string) => void;
};

function ensureEntry<T>(
  map: Map<string, CacheEntry<unknown>>,
  key: string,
): CacheEntry<T> {
  let entry = map.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    entry = {
      data: undefined,
      error: undefined,
      updatedAt: 0,
      subscribers: new Set(),
    };
    map.set(key, entry as CacheEntry<unknown>);
  }
  return entry;
}

function notify(entry: CacheEntry<unknown>) {
  for (const listener of entry.subscribers) {
    listener();
  }
}

export function createCache(): CacheStore {
  const map = new Map<string, CacheEntry<unknown>>();

  const store: CacheStore = {
    subscribe(key: string, listener: () => void) {
      const entry = ensureEntry(map, key);
      entry.subscribers.add(listener);
      return () => {
        entry.subscribers.delete(listener);
      };
    },

    getEntry<T>(key: string) {
      return ensureEntry<T>(map, key);
    },

    async revalidate<T>(
      key: string,
      fetcher: () => Promise<T>,
      opts?: RevalidateOptions,
    ) {
      const dedupingInterval = opts?.dedupingInterval ?? 2000;
      const entry = ensureEntry<T>(map, key);

      if (entry.promise) {
        return entry.promise;
      }

      const age = Date.now() - entry.updatedAt;
      if (entry.data !== undefined && age < dedupingInterval) {
        return entry.data;
      }

      const promise = fetcher()
        .then((data: T) => {
          entry.data = data;
          entry.error = undefined;
          entry.updatedAt = Date.now();
          entry.promise = undefined;
          notify(entry as CacheEntry<unknown>);
          return data;
        })
        .catch((err: unknown) => {
          entry.error =
            err instanceof Error ? err : new Error(String(err));
          entry.promise = undefined;
          notify(entry as CacheEntry<unknown>);
          throw err;
        });

      entry.promise = promise;
      notify(entry as CacheEntry<unknown>);
      return promise;
    },

    async mutate<T>(
      key: string,
      data?: MutateUpdater<T>,
      opts?: { revalidate?: boolean; fetcher?: () => Promise<T> },
    ) {
      const entry = ensureEntry<T>(map, key);
      if (data !== undefined) {
        const next =
          typeof data === 'function'
            ? (data as (c: T | undefined) => T)(entry.data)
            : data;
        entry.data = next;
        entry.error = undefined;
        entry.updatedAt = Date.now();
        notify(entry as CacheEntry<unknown>);
      }
      if (opts?.revalidate && opts.fetcher) {
        return store.revalidate(key, opts.fetcher, { dedupingInterval: 0 });
      }
      return entry.data;
    },

    clear(key: string) {
      const entry = map.get(key);
      if (!entry) return;
      map.delete(key);
      notify(entry);
    },

    clearPrefix(prefix: string) {
      for (const key of [...map.keys()]) {
        if (key.startsWith(prefix)) {
          store.clear(key);
        }
      }
    },
  };

  return store;
}

/** Process-wide cache shared by provider + widgets within one JS realm. */
export const jazaCache = createCache();
