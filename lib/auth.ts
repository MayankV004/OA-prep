import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { env } from '@/lib/config';

const client = new MongoClient(env.MONGODB_URI);

export const auth = betterAuth({
  database: mongodbAdapter(client.db(env.MONGODB_DB)),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'database',
    customRules: {
      '/sign-in/email': {
        window: 60,
        max: 5,
      },
      '/sign-up/email': {
        window: 60,
        max: 5,
      },
    },
  },
  emailAndPassword: { 
    enabled: true, 
    autoSignIn: true 
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', input: false },
      disabled: { type: 'boolean', defaultValue: false, input: false },
      lastSeenAt: { type: 'date', required: false, input: false },
      invitedBy: { type: 'string', required: false, input: false },
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    'http://localhost:3000',
    ...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
    ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : []),
  ],
});

import { traceSpan } from '@/lib/telemetry/tracer';
import { recordHttpRequest } from '@/lib/telemetry/metrics';
import { logger } from '@/lib/telemetry/logger';
import crypto from 'crypto';

function hashUserRef(id: string): string {
  return crypto.createHash('sha256').update(id).digest('hex').substring(0, 12);
}

export async function withAuth<T>(
  req: Request,
  fn: (ctx: { userId: string; role: 'admin' | 'user' }) => Promise<T>
): Promise<Response> {
  const url = new URL(req.url);
  const startTime = Date.now();

  return traceSpan(`api:${req.method} ${url.pathname}`, async (span) => {
    span.setAttribute('http.method', req.method);
    span.setAttribute('http.target', url.pathname);

    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      recordHttpRequest(req.method, url.pathname, 401, Date.now() - startTime);
      return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    }
    
    if ((session.user as any).disabled) {
      recordHttpRequest(req.method, url.pathname, 403, Date.now() - startTime);
      return Response.json({ error: { code: 'FORBIDDEN', message: 'Account disabled' } }, { status: 403 });
    }

    if (!(session.user as any).emailVerified) {
      recordHttpRequest(req.method, url.pathname, 403, Date.now() - startTime);
      return Response.json({ error: { code: 'EMAIL_NOT_VERIFIED', message: 'Email address not verified. Please verify your email address to continue.' } }, { status: 403 });
    }

    const hashedUser = hashUserRef(session.user.id);
    span.setAttribute('user.id_hash', hashedUser);
    
    try {
      const result = await fn({ userId: session.user.id, role: (session.user as any).role });
      const durationMs = Date.now() - startTime;
      recordHttpRequest(req.method, url.pathname, 200, durationMs);

      if (result instanceof Response || (result && typeof result === 'object' && 'headers' in result && 'status' in result)) {
        return result as Response;
      }
      return Response.json(result);
    } catch (err: any) {
      const status = err.status || 500;
      const message = err.message || 'Internal server error';
      const durationMs = Date.now() - startTime;

      recordHttpRequest(req.method, url.pathname, status, durationMs);
      logger.error('API request failed', {
        method: req.method,
        path: url.pathname,
        status,
        error: message,
        userHash: hashedUser,
      });

      return Response.json({ error: { code: status.toString(), message } }, { status });
    }
  });
}

export function withRole<T>(
  req: Request,
  role: 'admin',
  fn: (ctx: { userId: string; role: 'admin' }) => Promise<T>
) {
  return withAuth(req, async (ctx) => {
    if (ctx.role !== role) {
      throw { status: 403, message: 'Forbidden: Insufficient permissions' };
    }
    return fn(ctx as any);
  });
}
