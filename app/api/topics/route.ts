import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Topic } from '@/models';
import { topicWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const targetUserId = searchParams.get('userId') === 'me' || !searchParams.get('userId')
      ? userId
      : searchParams.get('userId')!;

    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const query: any = { userId: targetUserId };
    if (groupId) query.groupId = groupId;

    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
    const cursor = searchParams.get('cursor');
    if (cursor) query._id = { $gt: cursor };

    const topics = await Topic.find(query).sort({ updatedAt: -1 }).limit(limit + 1);
    const hasMore = topics.length > limit;
    const results = hasMore ? topics.slice(0, limit) : topics;
    return { data: results, nextCursor: hasMore ? results[results.length - 1]._id : null };
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = topicWriteSchema.parse(body);
    const targetUserId = new URL(req.url).searchParams.get('userId') || userId;
    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const created = await Topic.create({ ...parsed, userId: targetUserId });
    await recordActivity({
      actorId: userId,
      targetUserId,
      kind: 'topic.created',
      entity: { type: 'topic', id: created._id.toString(), title: created.title },
      metadata: { groupId: created.groupId },
    });
    return Response.json(created, { status: 201 });
  });
}
