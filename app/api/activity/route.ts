import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Activity } from '@/models';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') ?? 'me';
    const limit = Math.min(Number(searchParams.get('limit') ?? 30), 100);
    const cursor = searchParams.get('cursor');

    if (scope === 'all' && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const query: any = scope === 'all' ? {} : { targetUserId: new mongoose.Types.ObjectId(userId) };
    if (cursor) query._id = { $lt: cursor };

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = activities.length > limit;
    const results = hasMore ? activities.slice(0, limit) : activities;
    return { data: results, nextCursor: hasMore ? results[results.length - 1]._id : null };
  });
}
