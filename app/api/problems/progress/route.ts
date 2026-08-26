import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, UserProgress } from '@/models';
import { recordActivity } from '@/lib/activity';
import { withCache, invalidateCache } from '@/lib/cache';
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
      const cacheKey = `user:progress:${targetUserId}:pattern:ids`;
      return withCache(cacheKey, 60, async () => {
        const progress = await UserProgress.find({ 
          userId: targetUserId,
          completed: true 
        }).select('problemId -_id');
        return progress.map(p => p.problemId);
      });
    }

    if (kind === 'pattern') {
      const cacheKey = `user:progress:${targetUserId}:pattern:stats`;
      return withCache(cacheKey, 60, async () => {
        const { Pattern } = await import('@/models');
        const patterns = await Pattern.find().select('title slug variations').lean();

        const completedProgress = await UserProgress.find({ 
          userId: targetUserId,
          completed: true 
        }).select('problemId updatedAt').sort({ updatedAt: -1 }).lean();

        const completedIds = new Set(completedProgress.map(p => p.problemId));

        let lastPracticedPattern: {
          title: string;
          slug: string;
          completed: number;
          total: number;
          updatedAt: string;
        } | null = null;

        const latestProgressItem = completedProgress[0];

        const stats = patterns.map((p: any) => {
          let completedCount = 0;
          let total = 0;
          let isMatchingLatest = false;
          
          if (p.variations) {
            p.variations.forEach((v: any) => {
              if (v.problems) {
                total += v.problems.length;
                v.problems.forEach((prob: any) => {
                  const probIdStr = prob._id ? prob._id.toString() : prob.id;
                  if (completedIds.has(probIdStr)) {
                    completedCount++;
                  }
                  if (latestProgressItem && probIdStr === latestProgressItem.problemId) {
                    isMatchingLatest = true;
                  }
                });
              }
            });
          }

          const patternStat = {
            group: p.title,
            slug: p.slug,
            total,
            completed: completedCount,
          };

          if (isMatchingLatest && !lastPracticedPattern) {
            lastPracticedPattern = {
              title: p.title,
              slug: p.slug,
              completed: completedCount,
              total,
              updatedAt: latestProgressItem.updatedAt ? new Date(latestProgressItem.updatedAt).toISOString() : new Date().toISOString(),
            };
          }

          return patternStat;
        });

        return {
          stats,
          lastPracticed: lastPracticedPattern,
        };
      });
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
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const body = await req.json();
    const { problemId, completed } = toggleSchema.parse(body);

    const progress = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      { completed, completedAt: completed ? new Date() : null },
      { upsert: true, new: true }
    );

    const problem = await Problem.findById(problemId);
    if (problem && (problem.userId.toString() === userId || role === 'admin')) {
      problem.completed = completed;
      problem.completedAt = completed ? new Date() : undefined;
      await problem.save();
    }

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: completed ? 'problem.completed' : 'problem.uncompleted',
      entity: { type: 'problem', id: problemId, title: problem?.title || problem?.name || 'Problem' },
      metadata: {
        difficulty: problem?.difficulty,
        pattern: (problem as any)?.pattern,
      },
    });

    // Invalidate user progress caches on completion state change
    await invalidateCache(
      `user:progress:${userId}:pattern:stats`,
      `user:progress:${userId}:pattern:ids`
    );

    return progress;
  });
}
