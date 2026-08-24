import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { recordRateLimitExceeded } from '@/lib/telemetry/metrics';
import { logger } from '@/lib/telemetry/logger';

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return (_redis ??= Redis.fromEnv());
}

export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  return '127.0.0.1';
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in ms (default: 60_000)
  max?: number;      // Max requests per window (default: 60)
  keyPrefix?: string;
}

/**
 * Redis-backed sliding window rate limiter.
 * Falls back to always-allow when Redis is not configured (dev without Upstash).
 */
export async function checkRateLimit(
  req: Request | NextRequest,
  options: RateLimitOptions = {}
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
  response?: Response;
}> {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 60;
  const keyPrefix = options.keyPrefix ?? 'global';

  const ip = getClientIp(req);
  const redis = getRedis();

  // Dev fallback: no Redis configured — allow all requests
  if (!redis) {
    return { success: true, limit: max, remaining: max - 1, resetInMs: windowMs };
  }

  const redisKey = `rl:${keyPrefix}:${ip}`;
  const count = await redis.incr(redisKey);

  // Set TTL only on first increment (avoids resetting on each hit)
  if (count === 1) {
    await redis.pexpire(redisKey, windowMs);
  }

  // Get remaining TTL for Retry-After header
  const ttlMs = count === 1 ? windowMs : (await redis.pttl(redisKey));
  const resetInMs = Math.max(ttlMs, 0);

  if (count > max) {
    const retryAfterSec = Math.ceil(resetInMs / 1000);

    recordRateLimitExceeded(keyPrefix, ip);
    logger.warn('Rate limit exceeded', { ip, keyPrefix, limit: max, retryAfterSec });

    return {
      success: false,
      limit: max,
      remaining: 0,
      resetInMs,
      response: NextResponse.json(
        {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: `Too many requests. Please try again in ${retryAfterSec} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSec.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + resetInMs) / 1000).toString(),
          },
        }
      ),
    };
  }

  return {
    success: true,
    limit: max,
    remaining: max - count,
    resetInMs,
  };
}
