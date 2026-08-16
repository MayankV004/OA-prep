import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

const authHandler = toNextJsHandler(auth);

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Apply strict rate limiting for authentication write endpoints (sign-in, sign-up, password reset)
  if (
    pathname.includes('/sign-in') ||
    pathname.includes('/sign-up') ||
    pathname.includes('/forget-password') ||
    pathname.includes('/reset-password')
  ) {
    const rateLimit = checkRateLimit(req, {
      windowMs: 60 * 1000, // 1 minute sliding window
      max: 5, // Max 5 authentication attempts per minute per IP
      keyPrefix: 'auth-strict',
    });

    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }
  }

  return authHandler.POST(req);
}

export async function GET(req: NextRequest) {
  return authHandler.GET(req);
}
