import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { UserCpProfile } from '@/models/userCpProfile';
import { UserContestHistory } from '@/models/userContestHistory';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const targetUserIdParam = searchParams.get('userId');

    // Only admins can query other users' performances
    const targetUserId =
      role === 'admin' && targetUserIdParam ? targetUserIdParam : userId;

    const uid = new mongoose.Types.ObjectId(targetUserId);

    const [profile, contestHistories] = await Promise.all([
      UserCpProfile.findOne({ userId: uid }).lean(),
      UserContestHistory.find({ userId: uid })
        .sort({ contestDate: -1 })
        .limit(100)
        .lean(),
    ]);

    // Build chronological timeseries for the rating chart
    const chartMap = new Map<string, { date: string; codeforces?: number; leetcode?: number; atcoder?: number; codechef?: number }>();

    // Sort ascending for chart progression
    const sortedContests = [...contestHistories].reverse();

    sortedContests.forEach((c) => {
      const dateKey = new Date(c.contestDate).toISOString().split('T')[0];
      if (!chartMap.has(dateKey)) {
        chartMap.set(dateKey, { date: dateKey });
      }
      const entry = chartMap.get(dateKey)!;
      if (c.platform === 'codeforces') entry.codeforces = c.newRating;
      if (c.platform === 'leetcode') entry.leetcode = c.newRating;
      if (c.platform === 'atcoder') entry.atcoder = c.newRating;
      if (c.platform === 'codechef') entry.codechef = c.newRating;
    });

    const chartData = Array.from(chartMap.values());

    return {
      success: true,
      profile: profile || {
        userId: uid,
        compositeScore: 0,
      },
      contests: contestHistories,
      chartData,
      totalContestsAttended: contestHistories.length,
    };
  });
}
