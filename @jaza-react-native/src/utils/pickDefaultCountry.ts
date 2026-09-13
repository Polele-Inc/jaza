import type { EnrichedCountry } from '../utils/helpers.js';

/**
 * Resolve default top-up country:
 * last-used → geo hint → CD → first catalog country.
 */
export function pickDefaultCountry(
  enriched: EnrichedCountry[],
  opts: {
    lastUsedIso2?: string | null;
    suggestedIso2?: string | null;
  },
): EnrichedCountry | null {
  if (enriched.length === 0) return null;
  const find = (iso2: string | null | undefined) => {
    if (!iso2) return undefined;
    const code = iso2.trim().toUpperCase();
    return enriched.find((c) => c.iso2 === code);
  };
  return (
    find(opts.lastUsedIso2) ??
    find(opts.suggestedIso2) ??
    find('CD') ??
    enriched[0]!
  );
}
