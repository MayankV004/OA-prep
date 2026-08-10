import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export const auth = betterAuth({
  database: mongodbAdapter(client.db(process.env.MONGODB_DB!)),
  emailAndPassword: { 
    enabled: true, 
    autoSignIn: true 
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', input: false },
      disabled: { type: 'boolean', defaultValue: false, input: false },
      lastSeenAt: { type: 'date', required: false, input: false },
      invitedBy: { type: 'string', required: false, input: false },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

export async function withAuth<T>(
  req: Request,
  fn: (ctx: { userId: string; role: 'admin' | 'user' }) => Promise<T>
): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session?.user?.id) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
  }
  
  if ((session.user as any).disabled) {
    return Response.json({ error: { code: 'FORBIDDEN', message: 'Account disabled' } }, { status: 403 });
  }
  
  try {
    const result = await fn({ userId: session.user.id, role: (session.user as any).role });
    return Response.json(result);
  } catch (err: any) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return Response.json({ error: { code: status.toString(), message } }, { status });
  }
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
