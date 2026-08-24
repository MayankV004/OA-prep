import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Topic, Group } from '@/models';
import { topicWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const targetUserIdParam = searchParams.get('userId');

    const query: any = {};

    if (groupId) {
      const isObjectId = Boolean(groupId.match(/^[0-9a-fA-F]{24}$/));
      const matchingGroup = await Group.findOne({
        $or: [
          ...(isObjectId ? [{ _id: groupId }] : []),
          { slug: groupId },
        ],
      }).lean();

      const validGroupIds: any[] = [];
      if (matchingGroup) {
        validGroupIds.push(matchingGroup._id);
        validGroupIds.push(matchingGroup._id.toString());
        if (matchingGroup.slug) validGroupIds.push(matchingGroup.slug);
      }
      if (isObjectId && !validGroupIds.includes(groupId)) {
        validGroupIds.push(groupId);
      }

      if (validGroupIds.length > 0) {
        query.groupId = { $in: validGroupIds };
      } else {
        return { data: [], nextCursor: null };
      }
    } else {
      const targetUserId = targetUserIdParam === 'me' || !targetUserIdParam
        ? userId
        : targetUserIdParam;

      if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };
      query.userId = targetUserId;
    }

    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 200);
    const cursor = searchParams.get('cursor');
    if (cursor) query._id = { $gt: cursor };

    const topics = await Topic.find(query).sort({ createdAt: 1 }).limit(limit + 1).lean();
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
    recordActivity({
      actorId: userId,
      targetUserId,
      kind: 'topic.created',
      entity: { type: 'topic', id: created._id.toString(), title: created.title },
      metadata: { groupId: created.groupId },
    });
    return Response.json(created, { status: 201 });
  });
}
