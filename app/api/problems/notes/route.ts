import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { UserProgress } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const notesSchema = z.object({
  problemId: z.string().min(1),
  userNotes: z.string(),
});

/** PUT /api/problems/notes — save markdown notes for a specific problem */
export async function PUT(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const { problemId, userNotes } = notesSchema.parse(body);

    const progress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      { userNotes },
      { upsert: true, new: true }
    );

    return { problemId, userNotes: progress.userNotes };
  });
}

/** GET /api/problems/notes?problemId=xxx — fetch notes for a specific problem */
export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    if (!problemId) throw { status: 400, message: 'problemId is required' };

    const progress = await UserProgress.findOne({ userId, problemId }).select('userNotes -_id');
    return { userNotes: progress?.userNotes || '' };
  });
}
