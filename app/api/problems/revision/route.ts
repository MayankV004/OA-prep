import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { UserProgress } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const revisionSchema = z.object({
  problemId: z.string().min(1),
  revision: z.boolean(),
});

/** POST /api/problems/revision — toggle the revision bookmark on a problem */
export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const { problemId, revision } = revisionSchema.parse(body);

    const progress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      { revision },
      { upsert: true, new: true }
    );

    return { problemId, revision: progress.revision };
  });
}

/** GET /api/problems/revision — fetch all revision-marked problemIds for the user */
export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const marked = await UserProgress.find({ userId, revision: true }).select('problemId -_id');
    return marked.map((p) => p.problemId);
  });
}
