import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { Invite, User } from '@/models';
import { auth } from '@/lib/auth';
import { acceptInviteSchema } from '@/lib/zod';
import dbConnect from '@/lib/db';

import { sendWelcomeEmail, sendInviteAcceptedEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

// POST /api/invites/:token/accept — public, creates user account
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const rateLimit = checkRateLimit(req, {
    windowMs: 60 * 1000,
    max: 5,
    keyPrefix: 'invite-accept',
  });
  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

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

  const userName = invite.name || invite.email.split('@')[0];

  // Create user via BetterAuth
  const signUpReq = new Request(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: invite.email, password, name: userName }),
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

  // Send Welcome Email to newly registered user
  try {
    await sendWelcomeEmail({ to: invite.email, userName });
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }

  // Send Notification Email to Inviter/Admin
  if (invite.invitedBy) {
    try {
      const inviter = await User.findById(invite.invitedBy);
      if (inviter && inviter.email) {
        await sendInviteAcceptedEmail({
          to: inviter.email,
          adminName: inviter.name || 'Admin',
          invitedEmail: invite.email,
          invitedName: userName,
          role: invite.role ?? 'user',
        });
      }
    } catch (err) {
      console.error('Failed to send invite accepted notification to admin:', err);
    }
  }

  return Response.json({ success: true, email: invite.email });
}
