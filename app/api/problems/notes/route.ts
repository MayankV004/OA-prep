import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { UserProgress } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const notesSchema = z.object({
  problemId: z.string().min(1),
  userNotes: z.string().optional(),
  notes: z.string().optional(),
});

/** PUT /api/problems/notes — save markdown notes for a specific problem */
export async function PUT(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = notesSchema.parse(body);
    const problemId = parsed.problemId;
    const userNotes = parsed.userNotes !== undefined ? parsed.userNotes : parsed.notes ?? '';

    const progress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      { userNotes },
      { upsert: true, new: true }
    );

    return { problemId, userNotes: progress.userNotes, notes: progress.userNotes };
  });
}

/** GET /api/problems/notes?problemId=xxx — fetch notes for a specific problem or all problem notes for user */
export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');

    if (problemId) {
      const progress = await UserProgress.findOne({ userId, problemId }).select('userNotes -_id');
      return { userNotes: progress?.userNotes || '', notes: progress?.userNotes || '' };
    }

    // Return map of all problem notes for user
    const allProgress = await UserProgress.find({
      userId,
      userNotes: { $exists: true, $ne: '' }
    }).select('problemId userNotes -_id');

    const notesMap: Record<string, string> = {};
    for (const p of allProgress) {
      notesMap[p.problemId] = p.userNotes;
    }

    return notesMap;
  });
}

