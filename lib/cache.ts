import { Redis } from '@upstash/redis';
import { env } from '@/lib/config';

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL) return null;
  return (_redis ??= Redis.fromEnv());
}

/**
 * Returns fresh data from `fn`, or a cached version stored in Redis.
 * Gracefully falls through to `fn` directly when Redis is not configured (dev).
 *
 * @param key      - Cache key
 * @param ttlSeconds - Time-to-live in seconds
 * @param fn       - Async function that produces the fresh value
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const r = getRedis();

  if (r) {
    const cached = await r.get<T>(key);
    if (cached !== null) return cached;
  }

  const fresh = await fn();

  if (r) {
    await r.set(key, fresh, { ex: ttlSeconds });
  }

  return fresh;
}

/**
 * Removes one or more cache keys. No-op when Redis is not configured.
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  const r = getRedis();
  if (r && keys.length > 0) await r.del(...keys);
}
