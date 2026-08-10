import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Question } from '@/models';
import { questionWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const targetUserId = searchParams.get('userId') === 'me' || !searchParams.get('userId')
      ? userId
      : searchParams.get('userId')!;

    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const query: any = { userId: targetUserId };
    if (subjectId) query.subjectId = subjectId;
    if (searchParams.get('tag')) query.tags = searchParams.get('tag');

    const questions = await Question.find(query).sort({ createdAt: -1 });
    return questions;
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = questionWriteSchema.parse(body);
    const targetUserId = new URL(req.url).searchParams.get('userId') || userId;
    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const created = await Question.create({ ...parsed, userId: targetUserId });
    await recordActivity({
      actorId: userId,
      targetUserId,
      kind: 'question.created',
      entity: { type: 'question', id: created._id.toString(), title: created.question.slice(0, 80) },
      metadata: { subjectId: created.subjectId },
    });
    return Response.json(created, { status: 201 });
  });
}
