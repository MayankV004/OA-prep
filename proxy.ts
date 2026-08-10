import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: In a serverless environment (like Vercel), this in-memory map will reset 
// per lambda instance. For production, consider using Redis (e.g., @upstash/redis).
const rateLimit = new Map<string, { count: number; expires: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export function proxy(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
    
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
