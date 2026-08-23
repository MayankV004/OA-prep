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
        const { Pattern, UserProgress } = await import('@/models');
        const patterns = await Pattern.find().lean();
        
        const problemMap = new Map();
        let totalPatternProblems = 0;
        
        patterns.forEach((p: any) => {
          p.variations?.forEach((v: any) => {
            v.problems?.forEach((prob: any) => {
              if (prob._id) {
                problemMap.set(prob._id.toString(), prob);
                totalPatternProblems++;
              }
            });
          });
        });
        
        const userProgress = await UserProgress.find({ userId: uid, completed: true }).lean();
        
        let completedPatternProblems = 0;
        const difficultyMix: any = { Easy: 0, Medium: 0, Hard: 0 };
        
        userProgress.forEach((up: any) => {
          const prob = problemMap.get(up.problemId);
          if (prob) {
            completedPatternProblems++;
            if (prob.difficulty) {
              difficultyMix[prob.difficulty] = (difficultyMix[prob.difficulty] || 0) + 1;
            }
          }
        });

        const totalsByKind = [
          { kind: 'pattern', total: totalPatternProblems, completed: completedPatternProblems }
        ];

        return { totalsByKind, difficultyMix };
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
