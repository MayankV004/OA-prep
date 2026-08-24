import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem } from '@/models';
import { problemUpdateSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const problem = await Problem.findById(id);
    if (!problem) throw { status: 404, message: 'Problem not found' };
    if (problem.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };
    return problem;
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const problem = await Problem.findById(id);
    if (!problem) throw { status: 404, message: 'Problem not found' };
    if (problem.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const body = await req.json();
    const parsed = problemUpdateSchema.parse(body);
    const changedFields = Object.keys(parsed);

    Object.assign(problem, parsed);
    await problem.save();

    // Check if body/notes field changed — emit note.updated
    if (changedFields.includes('notes')) {
      recordActivity({
        actorId: userId,
        targetUserId: problem.userId.toString(),
        kind: 'note.updated',
        entity: { type: 'problem', id: problem._id.toString(), title: problem.title },
        metadata: { len: problem.notes?.length ?? 0 },
      });
    } else {
      recordActivity({
        actorId: userId,
        targetUserId: problem.userId.toString(),
        kind: 'problem.updated',
        entity: { type: 'problem', id: problem._id.toString(), title: problem.title },
        metadata: { changedFields },
      });
    }
    return problem;
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const problem = await Problem.findById(id);
    if (!problem) throw { status: 404, message: 'Problem not found' };
    if (problem.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    await problem.deleteOne();
    recordActivity({
      actorId: userId,
      targetUserId: problem.userId.toString(),
      kind: 'problem.deleted',
      entity: { type: 'problem', id: problem._id.toString(), title: problem.title },
      metadata: { title: problem.title },
    });
    return new Response(null, { status: 204 });
  });
}
