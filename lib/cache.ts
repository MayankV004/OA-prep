import { Redis } from '@upstash/redis';
import { env } from '@/lib/config';

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL) return null;
  return (_redis ??= Redis.fromEnv());
}

interface MemoryCacheEntry {
  val: any;
  exp: number;
}

const memoryCache = new Map<string, MemoryCacheEntry>();

/**
 * Returns fresh data from `fn`, or a cached version stored in memory (L1) / Redis (L2).
 *
 * @param key        - Cache key
 * @param ttlSeconds - Time-to-live in seconds
 * @param fn         - Async function that produces the fresh value
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  // L1: In-process memory cache (sub-millisecond)
  const mem = memoryCache.get(key);
  if (mem && mem.exp > now) {
    return mem.val as T;
  }

  // L2: Upstash Redis (shared across Lambdas)
  const r = getRedis();
  if (r) {
    try {
      const cached = await r.get<T>(key);
      if (cached !== null) {
        memoryCache.set(key, { val: cached, exp: now + ttlSeconds * 1000 });
        return cached;
      }
    } catch {
      // Redis error fallback — continue to fn()
    }
  }

  const fresh = await fn();

  // Update L1 and L2
  memoryCache.set(key, { val: fresh, exp: now + ttlSeconds * 1000 });
  if (r) {
    try {
      await r.set(key, fresh, { ex: ttlSeconds });
    } catch {
      // Non-blocking cache set error
    }
  }

  return fresh;
}

/**
 * Removes one or more cache keys from L1 memory and L2 Redis.
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  for (const k of keys) {
    memoryCache.delete(k);
  }
  const r = getRedis();
  if (r && keys.length > 0) {
    try {
      await r.del(...keys);
    } catch {
      // Non-blocking
    }
  }
}
