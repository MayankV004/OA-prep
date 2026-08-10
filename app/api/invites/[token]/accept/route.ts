import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { Invite, User } from '@/models';
import { auth } from '@/lib/auth';
import { acceptInviteSchema } from '@/lib/zod';
import dbConnect from '@/lib/db';

// POST /api/invites/:token/accept — public, creates user account
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  await dbConnect();
  const { token } = await params;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const invite = await Invite.findOne({ tokenHash });

  if (!invite) return Response.json({ error: { code: '404', message: 'Invite not found' } }, { status: 404 });
  if (invite.status !== 'pending') return Response.json({ error: { code: '410', message: 'Invite no longer valid' } }, { status: 410 });
  if (new Date() > invite.expiresAt) {
    await Invite.findByIdAndUpdate(invite._id, { status: 'expired' });
    return Response.json({ error: { code: '410', message: 'Invite expired' } }, { status: 410 });
  }

  const body = await req.json();
  const { password } = acceptInviteSchema.parse(body);

  // Create user via BetterAuth
  const signUpReq = new Request(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: invite.email, password, name: invite.name ?? invite.email }),
  });

  const signUpRes = await auth.handler(signUpReq);
  if (!signUpRes.ok) {
    const err = await signUpRes.json().catch(() => ({}));
    return Response.json({ error: { code: 'AUTH_ERROR', message: (err as any).message ?? 'Failed to create account' } }, { status: 400 });
  }

  // Set role and invitedBy
  await User.findOneAndUpdate(
    { email: invite.email },
    { role: invite.role ?? 'user', invitedBy: invite.invitedBy }
  );

  // Mark invite accepted
  await Invite.findByIdAndUpdate(invite._id, { status: 'accepted', acceptedAt: new Date() });

  return Response.json({ success: true, email: invite.email });
}
