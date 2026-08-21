import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { User, Activity } from '@/models';
import { userUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const role = searchParams.get('role');
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200);
    const cursor = searchParams.get('cursor');

    const query: any = {};
    if (q) {
      const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [{ name: { $regex: safeQ, $options: 'i' } }, { email: { $regex: safeQ, $options: 'i' } }];
    }
    if (role) query.role = role;
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $gt: new mongoose.Types.ObjectId(cursor) };
    }

    const users = await User.find(query)
      .select('name email role disabled createdAt lastSeenAt invitedBy emailVerified image')
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = users.length > limit;
    const results = hasMore ? users.slice(0, limit) : users;
    return { data: results, nextCursor: hasMore ? results[results.length - 1]._id : null };
  });
}

export async function POST(req: NextRequest) {
  // Alias for POST /api/admin/invites — handled there; this can 307 redirect
  return Response.redirect(new URL('/api/admin/invites', req.url), 307);
}
