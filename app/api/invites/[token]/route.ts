import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { Invite } from '@/models';
import { auth } from '@/lib/auth';
import { acceptInviteSchema } from '@/lib/zod';
import dbConnect from '@/lib/db';
import { User } from '@/models';

type Ctx = { params: Promise<{ token: string }> };

// GET /api/invites/:token — public, returns invite info for the accept page
export async function GET(req: NextRequest, { params }: Ctx) {
  await dbConnect();
  const { token } = await params;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const invite = await Invite.findOne({ tokenHash });

  if (!invite) return Response.json({ error: { code: '404', message: 'Invite not found' } }, { status: 404 });
  if (invite.status === 'accepted') return Response.json({ error: { code: '410', message: 'Invite already used' } }, { status: 410 });
  if (invite.status === 'revoked') return Response.json({ error: { code: '410', message: 'Invite revoked' } }, { status: 410 });
  if (new Date() > invite.expiresAt) {
    await Invite.findByIdAndUpdate(invite._id, { status: 'expired' });
    return Response.json({ error: { code: '410', message: 'Invite expired' } }, { status: 410 });
  }

  return Response.json({ email: invite.email, name: invite.name, expiresAt: invite.expiresAt });
}
