import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { UserProgress } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const revisionSchema = z.object({
  problemId: z.string().min(1),
  revision: z.boolean().optional(),
  action: z.enum(['toggle', 'mark_revised', 'set']).optional(),
  confidence: z.enum(['struggled', 'good', 'mastered']).optional(),
  clearBookmark: z.boolean().optional(),
});

/** POST /api/problems/revision — toggle or mark problem as revised */
export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = revisionSchema.parse(body);
    const { problemId, action, confidence, clearBookmark } = parsed;

    if (action === 'mark_revised') {
      const now = new Date();
      const intervalDays = confidence === 'struggled' ? 2 : confidence === 'mastered' ? 30 : 7;
      const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

      const updateOps: any = {
        $inc: { timesRevised: 1 },
        $set: {
          lastRevisedAt: now,
          nextReviewAt: nextReview,
          ...(confidence ? { revisionConfidence: confidence } : {}),
        },
      };

      if (clearBookmark || parsed.revision === false) {
        updateOps.$set.revision = false;
      }

      const progress = await UserProgress.findOneAndUpdate(
        { userId, problemId },
        updateOps,
        { upsert: true, new: true }
      );

      return {
        problemId,
        revision: progress.revision,
        timesRevised: progress.timesRevised,
        lastRevisedAt: progress.lastRevisedAt,
        nextReviewAt: progress.nextReview = progress.nextReviewAt,
      };
    }

    const isRevision = parsed.revision ?? true;
    const updateOps: any = {
      $set: {
        revision: isRevision,
        ...(isRevision ? { nextReviewAt: new Date() } : {}),
      },
    };

    const progress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      updateOps,
      { upsert: true, new: true }
    );

    return {
      problemId,
      revision: progress.revision,
      timesRevised: progress.timesRevised ?? 0,
      lastRevisedAt: progress.lastRevisedAt,
    };
  });
}

/** GET /api/problems/revision — fetch all revision items for the user */
export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const detailed = searchParams.get('detailed') === 'true';

    if (detailed) {
      const items = await UserProgress.find({ userId, revision: true }).select(
        'problemId revision timesRevised lastRevisedAt nextReviewAt revisionConfidence -_id'
      );
      return items;
    }

    const marked = await UserProgress.find({ userId, revision: true }).select('problemId -_id');
    return marked.map((p) => p.problemId);
  });
}
