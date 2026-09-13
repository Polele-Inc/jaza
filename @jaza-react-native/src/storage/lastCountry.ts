const STORAGE_PREFIX = 'jaza:lastCountry:';

type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

const memory = new Map<string, string>();
const memoryStorage: StorageLike = {
  getItem: async (key) => memory.get(key) ?? null,
  setItem: async (key, value) => {
    memory.set(key, value);
  },
};

let resolved: StorageLike | null = null;

async function getStorage(): Promise<StorageLike> {
  if (resolved) return resolved;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    resolved = mod.default as StorageLike;
    return resolved;
  } catch {
    resolved = memoryStorage;
    return memoryStorage;
  }
}

export function lastCountryStorageKey(publishableKey: string): string {
  return `${STORAGE_PREFIX}${publishableKey}`;
}

export async function readLastUsedCountryIso2(
  publishableKey: string,
): Promise<string | null> {
  try {
    const storage = await getStorage();
    const raw = await storage.getItem(lastCountryStorageKey(publishableKey));
    const code = raw?.trim().toUpperCase();
    return code && /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

export async function writeLastUsedCountryIso2(
  publishableKey: string,
  iso2: string,
): Promise<void> {
  try {
    const storage = await getStorage();
    await storage.setItem(
      lastCountryStorageKey(publishableKey),
      iso2.trim().toUpperCase(),
    );
  } catch {
    /* ignore */
  }
}
