import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, Activity } from '@/models';
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
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [totalsByKind, difficultyMix, trend, heatmap, recent] = await Promise.all([
      // Totals per kind
      Problem.aggregate([
        { $match: { userId: uid } },
        {
          $group: {
            _id: '$kind',
            total: { $sum: 1 },
            completed: { $sum: { $cond: ['$completed', 1, 0] } },
          },
        },
        { $project: { kind: '$_id', total: 1, completed: 1, _id: 0 } },
      ]),

      // Difficulty mix (completed only)
      Problem.aggregate([
        { $match: { userId: uid, completed: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $project: { difficulty: '$_id', count: 1, _id: 0 } },
      ]).then(r => Object.fromEntries(r.map(x => [x.difficulty, x.count]))),

      // 90-day completion trend
      Problem.aggregate([
        { $match: { userId: uid, completedAt: { $gte: ninetyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
            completed: { $sum: 1 },
          },
        },
        { $project: { date: '$_id', completed: 1, _id: 0 } },
        { $sort: { date: 1 } },
      ]),

      // 90-day heatmap (any activity)
      Activity.aggregate([
        { $match: { targetUserId: uid, createdAt: { $gte: ninetyDaysAgo } } },
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

    return { totalsByKind, difficultyMix, trend, heatmap, recent };
  });
}
