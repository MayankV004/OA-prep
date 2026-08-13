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
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [totalsByKind, difficultyMix, trend, heatmap, recent] = await Promise.all([
      // TODO: When fully migrated to Sanity, these stats should be calculated
      // by combining UserProgress data with Sanity problem metadata.
      Promise.resolve([]),
      Promise.resolve({}),
      Promise.resolve([]),

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
