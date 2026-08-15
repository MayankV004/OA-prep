import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole } from '@/lib/auth';
import { Topic } from '@/models';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async () => {
    await dbConnect();
    const { id } = await params;
    const topic = await Topic.findById(id).lean();
    if (!topic) {
      return NextResponse.json({ error: { message: 'Topic not found' } }, { status: 404 });
    }
    return NextResponse.json(topic);
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updated = await Topic.findByIdAndUpdate(
      id,
      {
        $set: {
          title: body.title,
          body: body.body,
          groupId: body.groupId,
          tags: body.tags || [],
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: { message: 'Topic not found' } }, { status: 404 });
    }

    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'topic.updated',
      entity: { type: 'topic', id: updated._id.toString(), title: updated.title },
      metadata: { groupId: updated.groupId },
    });

    return NextResponse.json(updated);
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return PUT(req, ctx);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRole(req, 'admin', async ({ userId }) => {
    await dbConnect();
    const { id } = await params;
    const deleted = await Topic.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: { message: 'Topic not found' } }, { status: 404 });
    }

    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'topic.deleted',
      entity: { type: 'topic', id: id, title: deleted.title },
    });

    return NextResponse.json({ success: true });
  });
}
