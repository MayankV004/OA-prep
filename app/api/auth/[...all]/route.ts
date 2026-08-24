import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';
import { traceSpan } from '@/lib/telemetry/tracer';
import { recordAuthAttempt, recordHttpRequest } from '@/lib/telemetry/metrics';

const authHandler = toNextJsHandler(auth);

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const startTime = Date.now();

  return traceSpan(`auth:POST ${pathname}`, async (span) => {
    span.setAttribute('http.method', 'POST');
    span.setAttribute('http.target', pathname);

    // Apply strict rate limiting for authentication write endpoints (sign-in, sign-up, password reset)
    if (
      pathname.includes('/sign-in') ||
      pathname.includes('/sign-up') ||
      pathname.includes('/forget-password') ||
      pathname.includes('/reset-password')
    ) {
      const rateLimit = await checkRateLimit(req, {
        windowMs: 60 * 1000, // 1 minute sliding window
        max: 5, // Max 5 authentication attempts per minute per IP
        keyPrefix: 'auth-strict',
      });

      if (!rateLimit.success && rateLimit.response) {
        recordAuthAttempt(
          pathname.includes('/sign-up') ? 'sign_up' : 'sign_in',
          false
        );
        return rateLimit.response;
      }
    }

    const res = await authHandler.POST(req);
    const durationMs = Date.now() - startTime;
    const isSuccess = res.status < 400;

    if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
      recordAuthAttempt(
        pathname.includes('/sign-up') ? 'sign_up' : 'sign_in',
        isSuccess
      );
    }

    recordHttpRequest('POST', pathname, res.status, durationMs);
    return res;
  });
}

export async function GET(req: NextRequest) {
  return authHandler.GET(req);
}
