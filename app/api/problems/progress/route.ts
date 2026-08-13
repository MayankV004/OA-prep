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
      const progress = await UserProgress.find({ 
        userId: targetUserId,
        completed: true 
      }).select('problemId -_id');
      return progress.map(p => p.problemId);
    }

    if (kind === 'pattern') {
      const { Pattern } = await import('@/models');
      const patterns = await Pattern.find().select('title variations').lean();

      const completedProgress = await UserProgress.find({ 
        userId: targetUserId,
        completed: true 
      }).select('problemId -_id');
      const completedIds = new Set(completedProgress.map(p => p.problemId));

      const stats = patterns.map((p: any) => {
        let completedCount = 0;
        let total = 0;
        
        if (p.variations) {
          p.variations.forEach((v: any) => {
            if (v.problems) {
              total += v.problems.length;
              v.problems.forEach((prob: any) => {
                if (completedIds.has(prob._id.toString())) completedCount++;
              });
            }
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
      { userId, problemId },
      { completed, completedAt: completed ? new Date() : null },
      { upsert: true, new: true }
    );

    return progress;
  });
}
