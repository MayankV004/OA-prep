import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import { Activity } from '@/models';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500);
    const cursor = searchParams.get('cursor');

    const query: any = {};
    if (searchParams.get('actorId')) query.actorId = new mongoose.Types.ObjectId(searchParams.get('actorId')!);
    if (searchParams.get('targetUserId')) query.targetUserId = new mongoose.Types.ObjectId(searchParams.get('targetUserId')!);
    if (searchParams.get('kind')) query.kind = searchParams.get('kind');
    if (searchParams.get('from')) query.createdAt = { $gte: new Date(searchParams.get('from')!) };
    if (searchParams.get('to')) query.createdAt = { ...query.createdAt, $lte: new Date(searchParams.get('to')!) };
    if (cursor) query._id = { $lt: cursor };

    const activities = await Activity.find(query).sort({ createdAt: -1 }).limit(limit + 1);
    const hasMore = activities.length > limit;
    const results = hasMore ? activities.slice(0, limit) : activities;
    return { data: results, nextCursor: hasMore ? results[results.length - 1]._id : null };
  });
}
