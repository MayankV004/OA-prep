import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/auth';
import { Topic } from '@/models';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const groupId = searchParams.get('groupId');
    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 200);

    const query: any = {};
    if (groupId) query.groupId = groupId;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } },
      ];
    }

    const topics = await Topic.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ data: topics });
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.groupId) {
      return NextResponse.json(
        { error: { message: 'Title and Target Subject are required' } },
        { status: 400 }
      );
    }

    const created = await Topic.create({
      userId,
      groupId: body.groupId,
      title: body.title,
      body: body.body || '',
      tags: body.tags || [],
    });

    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'topic.created',
      entity: { type: 'topic', id: created._id.toString(), title: created.title },
      metadata: { groupId: created.groupId },
    });

    return NextResponse.json(created, { status: 201 });
  });
}
