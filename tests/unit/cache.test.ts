import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withCache, invalidateCache } from '@/lib/cache';

describe('Multi-Tier Cache Subsystem (lib/cache.ts)', () => {
  beforeEach(async () => {
    await invalidateCache('test-key-1', 'test-key-2', 'ttl-key');
  });

  it('computes and returns fresh data on cache miss', async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: 'ok', data: [1, 2, 3] });
    const result = await withCache('test-key-1', 60, fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'ok', data: [1, 2, 3] });
  });

  it('serves subsequent calls from L1 memory cache without re-invoking fetcher', async () => {
    const fetcher = vi.fn().mockResolvedValue({ timestamp: 12345 });

    const first = await withCache('test-key-2', 60, fetcher);
    const second = await withCache('test-key-2', 60, fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it('invalidates cached keys explicitly', async () => {
    let count = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      count++;
      return { count };
    });

    const res1 = await withCache<{ count: number }>('test-key-1', 60, fetcher);
    expect(res1.count).toBe(1);

    await invalidateCache('test-key-1');

    const res2 = await withCache<{ count: number }>('test-key-1', 60, fetcher);
    expect(res2.count).toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
