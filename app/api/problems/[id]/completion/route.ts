import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, UserProgress } from '@/models';
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
    const { completed } = completionSchema.parse(await req.json());

    // 1. Save per-user progress in UserProgress
    const progress = await UserProgress.findOneAndUpdate(
      { userId, problemId: id },
      { completed, completedAt: completed ? new Date() : null },
      { upsert: true, new: true }
    );

    // 2. Keep Problem document in sync if present
    const problem = await Problem.findById(id);
    if (problem && (problem.userId.toString() === userId || role === 'admin')) {
      problem.completed = completed;
      problem.completedAt = completed ? new Date() : undefined;
      await problem.save();
    }

    // 3. Record activity entry for heatmaps & dashboard stats
    await recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: completed ? 'problem.completed' : 'problem.uncompleted',
      entity: { type: 'problem', id, title: problem?.title || problem?.name || 'Problem' },
      metadata: {
        difficulty: problem?.difficulty,
        pattern: (problem as any)?.pattern,
        platform: (problem as any)?.platform,
        bucket: (problem as any)?.bucket,
      },
    });

    return { _id: id, problemId: id, completed: progress.completed };
  });
}

