import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Edge-compatible Redis client (HTTP-based, no TCP — works in Edge runtime)
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return Redis.fromEnv();
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;    // 100 requests per minute per IP

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/subjects',
  '/dsa',
  '/interview',
  '/cheatsheets',
  '/non-standard',
  '/cp',
  '/advanced',
  '/search',
  '/admin',
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Rate limiting for API routes ────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const xRealIp = request.headers.get('x-real-ip');
    const xForwardedFor = request.headers.get('x-forwarded-for');

    let ip = '127.0.0.1';
    if (cfConnectingIp) ip = cfConnectingIp.trim();
    else if (xRealIp) ip = xRealIp.trim();
    else if (xForwardedFor) ip = xForwardedFor.split(',').map((s) => s.trim()).at(-1) ?? '127.0.0.1';

    const redis = getRedis();

    if (redis) {
      // Redis-backed rate limit — shared across all Lambda invocations
      const redisKey = `proxy:rl:${ip}`;
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.pexpire(redisKey, WINDOW_MS);

      if (count > MAX_REQUESTS) {
        const ttlMs = await redis.pttl(redisKey);
        const retryAfter = Math.ceil(Math.max(ttlMs, 0) / 1000);
        return NextResponse.json(
          { error: { message: 'Too many requests' } },
          { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
        );
      }
    }
    // No Redis in dev — skip rate limiting (per-route checks in lib/rate-limit.ts still run)
  }

  // ── Server-side auth check for protected application routes ─────────────────
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const sessionToken =
      request.cookies.get('better-auth.session_token')?.value ||
      request.cookies.get('__Secure-better-auth.session_token')?.value;

    if (!sessionToken) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/subjects/:path*',
    '/dsa/:path*',
    '/interview/:path*',
    '/cheatsheets/:path*',
    '/non-standard/:path*',
    '/cp/:path*',
    '/advanced/:path*',
    '/search/:path*',
    '/admin/:path*',
  ],
};
