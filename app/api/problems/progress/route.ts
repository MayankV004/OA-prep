import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, UserProgress } from '@/models';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const targetUserId = searchParams.get('userId') === 'me' || !searchParams.get('userId')
      ? userId
      : searchParams.get('userId')!;

    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };
    if (!kind) throw { status: 400, message: 'kind parameter is required' };

    const returnType = searchParams.get('returnType'); // 'ids' or 'stats'

    if (kind === 'pattern' && returnType === 'ids') {
      // For PatternContentClient: return only the completed problems from UserProgress
      const progress = await UserProgress.find({ 
        userId: targetUserId,
        completed: true 
      }).select('sanityProblemId -_id');
      return progress.map(p => p.sanityProblemId);
    }

    // For DSAPageClient: return pattern stats
    if (kind === 'pattern') {
      const { client } = await import('@/sanity/lib/client');
      
      // Fetch all problems from Sanity grouped by pattern title
      // We can fetch patterns and their problem counts
      const sanityPatterns = await client.fetch(`*[_type == "pattern"]{
        title,
        "problems": variations[].problems[]._ref
      }`);

      // Fetch user's completed problems
      const completedProgress = await UserProgress.find({ 
        userId: targetUserId,
        completed: true 
      }).select('sanityProblemId -_id');
      const completedIds = new Set(completedProgress.map(p => p.sanityProblemId));

      const stats = sanityPatterns.map((p: any) => {
        let completedCount = 0;
        const total = p.problems ? p.problems.length : 0;
        if (p.problems) {
          p.problems.forEach((id: string) => {
            if (completedIds.has(id)) completedCount++;
          });
        }
        return {
          group: p.title,
          total,
          completed: completedCount
        };
      });

      return stats;
    }

    let groupField: string;
    if (kind === 'nonstandard') groupField = 'bucket';
    else if (kind === 'cp') groupField = 'platform';
    else throw { status: 400, message: 'Invalid kind' };

    const result = await Problem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), kind } },
      {
        $group: {
          _id: `$${groupField}`,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
        },
      },
      { $project: { group: '$_id', total: 1, completed: 1, _id: 0 } },
      { $sort: { group: 1 } },
    ]);

    return result;
  });
}

const toggleSchema = z.object({
  problemId: z.string(),
  completed: z.boolean(),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const { problemId, completed } = toggleSchema.parse(body);

    const progress = await UserProgress.findOneAndUpdate(
      { userId, sanityProblemId: problemId },
      { completed, completedAt: completed ? new Date() : null },
      { upsert: true, new: true }
    );

    return progress;
  });
}
