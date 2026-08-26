import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { withRole } from '@/lib/auth';
import { Invite, User } from '@/models';
import { inviteWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import { enqueueEmail } from '@/lib/qstash';
import dbConnect from '@/lib/db';
import { env } from '@/lib/config';

const TTL_HOURS = env.INVITE_TOKEN_TTL_HOURS;

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query: any = {};
    if (status) query.status = status;
    const invites = await Invite.find(query).sort({ createdAt: -1 }).limit(100);
    return invites;
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = inviteWriteSchema.parse(body);

    // Reject duplicate pending invites
    const existing = await Invite.findOne({ email: parsed.email, status: 'pending' });
    if (existing) {
      // Resend the existing one
      existing.sentAt = new Date();
      existing.expiresAt = new Date(Date.now() + TTL_HOURS * 3600 * 1000);
      await existing.save();
      const inviter = await User.findById(userId);
      // Re-derive token (we can't, it's hashed — so we generate a new token for this resend)
      const token = crypto.randomBytes(32).toString('base64url');
      existing.tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await existing.save();
      await enqueueEmail({
        type: 'invite',
        to: parsed.email,
        inviterName: inviter?.name ?? 'Admin',
        role: existing.role ?? 'User',
        token,
        expiresInHours: TTL_HOURS,
      });
      return existing;
    }

    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + TTL_HOURS * 3600 * 1000);

    const invite = await Invite.create({
      ...parsed,
      tokenHash,
      invitedBy: userId,
      status: 'pending',
      sentAt: new Date(),
      expiresAt,
    });

    const inviter = await User.findById(userId);
    await enqueueEmail({
      type: 'invite',
      to: parsed.email,
      inviterName: inviter?.name ?? 'Admin',
      role: parsed.role ?? 'User',
      token,
      expiresInHours: TTL_HOURS,
    });

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'admin.user.invited',
      metadata: { email: parsed.email, role: parsed.role ?? 'user' },
    });

    return Response.json(invite, { status: 201 });
  });
}
