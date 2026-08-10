import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Topic } from '@/models';
import { topicUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const topic = await Topic.findById(id);
    if (!topic) throw { status: 404, message: 'Topic not found' };
    if (topic.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };
    return topic;
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const topic = await Topic.findById(id);
    if (!topic) throw { status: 404, message: 'Topic not found' };
    if (topic.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const body = await req.json();
    const parsed = topicUpdateSchema.parse(body);
    const changedFields = Object.keys(parsed);

    Object.assign(topic, parsed);
    await topic.save();

    await recordActivity({
      actorId: userId,
      targetUserId: topic.userId.toString(),
      kind: 'topic.updated',
      entity: { type: 'topic', id: topic._id.toString(), title: topic.title },
      metadata: { changedFields },
    });
    return topic;
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const topic = await Topic.findById(id);
    if (!topic) throw { status: 404, message: 'Topic not found' };
    if (topic.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    await topic.deleteOne();
    await recordActivity({
      actorId: userId,
      targetUserId: topic.userId.toString(),
      kind: 'topic.deleted',
      entity: { type: 'topic', id: topic._id.toString(), title: topic.title },
      metadata: { title: topic.title },
    });
    return Response.json(null, { status: 204 });
  });
}
