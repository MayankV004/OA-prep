import { NextRequest, NextResponse } from 'next/server';
import { recordRateLimitExceeded } from '@/lib/telemetry/metrics';
import { logger } from '@/lib/telemetry/logger';

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// In-memory sliding window store keyed by client IP + route identifier
const store = new Map<string, RateLimitStore>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 60000 = 1 min)
  max?: number; // Max requests per window (default: 5)
  keyPrefix?: string; // Prefix for rate limit key
}

export function checkRateLimit(
  req: Request | NextRequest,
  options: RateLimitOptions = {}
): {
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
  response?: Response;
} {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 5;
  const keyPrefix = options.keyPrefix || 'global';

  const ip = getClientIp(req);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  const record = store.get(key);

  if (!record || now > record.resetAt) {
    // Window expired or new client
    const newRecord: RateLimitStore = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, newRecord);
    return {
      success: true,
      limit: max,
      remaining: max - 1,
      resetInMs: windowMs,
    };
  }

  if (record.count >= max) {
    // Rate limit exceeded
    const resetInMs = record.resetAt - now;
    const retryAfterSec = Math.ceil(resetInMs / 1000);

    // Record Telemetry Metric & Structured Log
    recordRateLimitExceeded(keyPrefix, ip);
    logger.warn('Authentication rate limit exceeded', {
      ip,
      keyPrefix,
      limit: max,
      retryAfterSec,
    });

    return {
      success: false,
      limit: max,
      remaining: 0,
      resetInMs,
      response: NextResponse.json(
        {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: `Too many authentication attempts. Please try again in ${retryAfterSec} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSec.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(record.resetAt / 1000).toString(),
          },
        }
      ),
    };
  }

  // Increment request count
  record.count += 1;
  store.set(key, record);

  return {
    success: true,
    limit: max,
    remaining: max - record.count,
    resetInMs: record.resetAt - now,
  };
}
