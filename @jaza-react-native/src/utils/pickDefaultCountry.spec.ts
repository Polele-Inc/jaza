import { describe, expect, it } from 'vitest';
import { pickDefaultCountry } from './pickDefaultCountry.js';
import type { EnrichedCountry } from './helpers.js';

function country(iso2: string): EnrichedCountry {
  return {
    id: iso2,
    name: iso2,
    iso2,
    iso3: `${iso2}X`,
    dialCode: '+1',
    flag: '🏳️',
    currencies: [{ code: 'USD', name: 'USD', decimals: 2 }],
  };
}

describe('pickDefaultCountry', () => {
  const list = [country('KE'), country('CD'), country('NG')];

  it('prefers last-used when in catalog', () => {
    expect(
      pickDefaultCountry(list, { lastUsedIso2: 'NG', suggestedIso2: 'KE' })
        ?.iso2,
    ).toBe('NG');
  });

  it('falls back to geo hint then CD', () => {
    expect(
      pickDefaultCountry(list, { lastUsedIso2: null, suggestedIso2: 'KE' })
        ?.iso2,
    ).toBe('KE');
    expect(
      pickDefaultCountry(list, { lastUsedIso2: 'ZZ', suggestedIso2: null })
        ?.iso2,
    ).toBe('CD');
  });
});
