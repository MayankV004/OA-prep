import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Question } from '@/models';
import { questionUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const q = await Question.findById(id);
    if (!q) throw { status: 404, message: 'Question not found' };

    // System questions are viewable by all; custom questions only by author or admin
    const isAuthor = q.userId?.toString() === userId;
    if (!q.isSystem && !isAuthor && role !== 'admin') {
      throw { status: 403, message: 'Forbidden' };
    }
    return q;
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const q = await Question.findById(id);
    if (!q) throw { status: 404, message: 'Question not found' };

    const isAuthor = q.userId?.toString() === userId;
    if (!isAuthor && role !== 'admin') {
      throw { status: 403, message: 'Forbidden' };
    }

    const parsed = questionUpdateSchema.parse(await req.json());
    Object.assign(q, parsed);
    await q.save();

    recordActivity({
      actorId: userId,
      targetUserId: q.userId ? q.userId.toString() : userId,
      kind: 'question.updated',
      entity: { type: 'question', id: q._id.toString() },
      metadata: { changedFields: Object.keys(parsed) },
    });
    return q;
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const q = await Question.findById(id);
    if (!q) throw { status: 404, message: 'Question not found' };

    const isAuthor = q.userId?.toString() === userId;
    if (!isAuthor && role !== 'admin') {
      throw { status: 403, message: 'Forbidden' };
    }

    await q.deleteOne();
    recordActivity({
      actorId: userId,
      targetUserId: q.userId ? q.userId.toString() : userId,
      kind: 'question.deleted',
      entity: { type: 'question', id: q._id.toString() },
    });
    return new Response(null, { status: 204 });
  });
}
