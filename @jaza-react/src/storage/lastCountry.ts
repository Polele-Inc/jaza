const STORAGE_PREFIX = 'jaza:lastCountry:v2:';

export function lastCountryStorageKey(publishableKey: string): string {
  return `${STORAGE_PREFIX}${publishableKey}`;
}

export async function readLastUsedCountryIso2(
  publishableKey: string,
): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(
      lastCountryStorageKey(publishableKey),
    );
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
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      lastCountryStorageKey(publishableKey),
      iso2.trim().toUpperCase(),
    );
  } catch {
    /* private mode / quota */
  }
}
