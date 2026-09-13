import { describe, expect, it } from 'vitest';
import { createCache } from './createCache.js';

describe('createCache', () => {
  it('dedupes in-flight fetches', async () => {
    const cache = createCache();
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 20));
      return { n: calls };
    };

    const [a, b] = await Promise.all([
      cache.revalidate('k', fetcher, { dedupingInterval: 0 }),
      cache.revalidate('k', fetcher, { dedupingInterval: 0 }),
    ]);
    expect(a).toEqual({ n: 1 });
    expect(b).toEqual({ n: 1 });
    expect(calls).toBe(1);
  });

  it('mutate updates subscribers', async () => {
    const cache = createCache();
    let heard = 0;
    cache.subscribe('w', () => {
      heard += 1;
    });
    await cache.mutate('w', { balanceCredits: 10 });
    expect(cache.getEntry<{ balanceCredits: number }>('w').data).toEqual({
      balanceCredits: 10,
    });
    expect(heard).toBeGreaterThan(0);
  });

  it('respects dedupingInterval for fresh data', async () => {
    const cache = createCache();
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return calls;
    };
    await cache.revalidate('x', fetcher, { dedupingInterval: 0 });
    await cache.revalidate('x', fetcher, { dedupingInterval: 60_000 });
    expect(calls).toBe(1);
  });
});
