import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem } from '@/models';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const completionSchema = z.object({ completed: z.boolean() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { id } = await params;
    const problem = await Problem.findById(id);
    if (!problem) throw { status: 404, message: 'Problem not found' };
    if (problem.userId.toString() !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const { completed } = completionSchema.parse(await req.json());
    problem.completed = completed;
    problem.completedAt = completed ? new Date() : undefined;
    await problem.save();

    await recordActivity({
      actorId: userId,
      targetUserId: problem.userId.toString(),
      kind: completed ? 'problem.completed' : 'problem.uncompleted',
      entity: { type: 'problem', id: problem._id.toString(), title: problem.title },
      metadata: {
        difficulty: problem.difficulty,
        pattern: (problem as any).pattern,
        platform: (problem as any).platform,
        bucket: (problem as any).bucket,
      },
    });
    return problem;
  });
}
