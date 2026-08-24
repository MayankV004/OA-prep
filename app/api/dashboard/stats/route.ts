import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Activity, UserProgress } from '@/models';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') === 'me' || !searchParams.get('userId')
      ? userId
      : searchParams.get('userId')!;
    if (targetUserId !== userId && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const uid = new mongoose.Types.ObjectId(targetUserId);
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const [patternStats, trend, heatmap, recent] = await Promise.all([
      (async () => {
        const { UserProgress } = await import('@/models');
        const { withCache } = await import('@/lib/cache');

        // Cached for 5 min — this map only changes when admin seeds new patterns
        const problemDifficultyMap = await withCache<Record<string, string>>(
          'global:problemDifficultyMap',
          300,
          async () => {
            const { Pattern } = await import('@/models');
            const flat = await Pattern.aggregate([
              { $unwind: { path: '$variations', preserveNullAndEmptyArrays: false } },
              { $unwind: { path: '$variations.problems', preserveNullAndEmptyArrays: false } },
              {
                $project: {
                  _id: '$variations.problems._id',
                  difficulty: '$variations.problems.difficulty',
                },
              },
            ]);
            return Object.fromEntries(
              flat.map((p: any) => [p._id.toString(), p.difficulty])
            );
          }
        );

        const totalPatternProblems = Object.keys(problemDifficultyMap).length;

        const userProgress = await UserProgress.find({ userId: uid, completed: true }).lean();

        let completedPatternProblems = 0;
        const difficultyMix: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };

        userProgress.forEach((up: any) => {
          const difficulty = problemDifficultyMap[up.problemId];
          if (difficulty !== undefined) {
            completedPatternProblems++;
            difficultyMix[difficulty] = (difficultyMix[difficulty] || 0) + 1;
          }
        });

        return {
          totalsByKind: [
            { kind: 'pattern', total: totalPatternProblems, completed: completedPatternProblems },
          ],
          difficultyMix,
        };
      })(),

      // Trend (last 365 days completed problems)
      (async () => {
        const { UserProgress } = await import('@/models');
        return UserProgress.aggregate([
          { $match: { userId: uid, completed: true, completedAt: { $gte: oneYearAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, completed: { $sum: 1 } } },
          { $project: { date: '$_id', completed: 1, _id: 0 } },
          { $sort: { date: 1 } }
        ]);
      })(),

      // 365-day heatmap (any activity)
      Activity.aggregate([
        { $match: { targetUserId: uid, createdAt: { $gte: oneYearAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $project: { date: '$_id', count: 1, _id: 0 } },
        { $sort: { date: 1 } },
      ]),

      // Last 10 activity entries
      Activity.find({ targetUserId: uid }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return { 
      totalsByKind: patternStats.totalsByKind, 
      difficultyMix: patternStats.difficultyMix, 
      trend, 
      heatmap, 
      recent 
    };
  });
}
