import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: In a serverless environment (like Vercel), this in-memory map will reset 
// per lambda instance. For production, consider using Redis (e.g., @upstash/redis).
const rateLimit = new Map<string, { count: number; expires: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

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

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    let ip = '127.0.0.1';
    if (cfConnectingIp) {
      ip = cfConnectingIp.trim();
    } else if (xRealIp) {
      ip = xRealIp.trim();
    } else if (xForwardedFor) {
      const ips = xForwardedFor.split(',').map(s => s.trim());
      ip = ips[ips.length - 1] || ips[0] || '127.0.0.1';
    }

    const now = Date.now();
    const record = rateLimit.get(ip);

    if (!record || now > record.expires) {
      rateLimit.set(ip, { count: 1, expires: now + WINDOW_MS });
    } else {
      record.count++;
      if (record.count > MAX_REQUESTS) {
        return NextResponse.json(
          { error: { message: 'Too many requests' } },
          { status: 429, headers: { 'Retry-After': Math.ceil((record.expires - now) / 1000).toString() } }
        );
      }
    }
  }

  // Server-side auth check for protected application routes
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
