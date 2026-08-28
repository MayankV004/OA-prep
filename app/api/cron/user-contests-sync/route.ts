import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserCpProfile } from '@/models/userCpProfile';
import { UserContestHistory } from '@/models/userContestHistory';
import {
  fetchCodeforcesProfile,
  fetchLeetCodeProfile,
  fetchCodeChefProfile,
  fetchAtCoderProfile,
  calculateCompositeScore,
} from '@/lib/contests/user-fetchers';
import { env } from '@/lib/config';

export async function GET(req: NextRequest) {
  return handleUserSync(req);
}

export async function POST(req: NextRequest) {
  return handleUserSync(req);
}

async function handleUserSync(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  await connectDB();
  const profiles = await UserCpProfile.find().limit(100);

  let updatedUsersCount = 0;
  const now = new Date();

  for (const userCp of profiles) {
    let hasChanges = false;

    // 1. Sync Codeforces
    if (userCp.codeforces?.handle) {
      const cf = await fetchCodeforcesProfile(userCp.codeforces.handle);
      if (cf.valid) {
        userCp.codeforces.rating = cf.rating;
        userCp.codeforces.maxRating = cf.maxRating || cf.rating;
        userCp.codeforces.rank = cf.rank;
        userCp.codeforces.lastSyncedAt = now;
        hasChanges = true;

        if (cf.history.length > 0) {
          const ops = cf.history.map((item) => ({
            updateOne: {
              filter: { userId: userCp.userId, platform: 'codeforces', contestId: item.contestId },
              update: { $set: { ...item, userId: userCp.userId, platform: 'codeforces' } },
              upsert: true,
            },
          }));
          await UserContestHistory.bulkWrite(ops).catch(console.warn);
        }
      }
    }

    // 2. Sync LeetCode
    if (userCp.leetcode?.username) {
      const lc = await fetchLeetCodeProfile(userCp.leetcode.username);
      if (lc.valid) {
        userCp.leetcode.rating = lc.rating;
        userCp.leetcode.globalRanking = lc.globalRanking || 0;
        userCp.leetcode.topPercentage = lc.topPercentage || 0;
        userCp.leetcode.attendedContestsCount = lc.attendedContestsCount;
        userCp.leetcode.lastSyncedAt = now;
        hasChanges = true;

        if (lc.history.length > 0) {
          const ops = lc.history.map((item) => ({
            updateOne: {
              filter: { userId: userCp.userId, platform: 'leetcode', contestId: item.contestId },
              update: { $set: { ...item, userId: userCp.userId, platform: 'leetcode' } },
              upsert: true,
            },
          }));
          await UserContestHistory.bulkWrite(ops).catch(console.warn);
        }
      }
    }

    // 3. Sync CodeChef
    if (userCp.codechef?.handle) {
      const cc = await fetchCodeChefProfile(userCp.codechef.handle);
      if (cc.valid) {
        userCp.codechef.rating = cc.rating;
        userCp.codechef.stars = cc.stars;
        userCp.codechef.division = cc.division;
        userCp.codechef.lastSyncedAt = now;
        hasChanges = true;
      }
    }

    // 4. Sync AtCoder
    if (userCp.atcoder?.handle) {
      const ac = await fetchAtCoderProfile(userCp.atcoder.handle);
      if (ac.valid) {
        userCp.atcoder.rating = ac.rating;
        userCp.atcoder.highestRating = ac.maxRating || ac.rating;
        userCp.atcoder.color = ac.color;
        userCp.atcoder.lastSyncedAt = now;
        hasChanges = true;

        if (ac.history.length > 0) {
          const ops = ac.history.map((item) => ({
            updateOne: {
              filter: { userId: userCp.userId, platform: 'atcoder', contestId: item.contestId },
              update: { $set: { ...item, userId: userCp.userId, platform: 'atcoder' } },
              upsert: true,
            },
          }));
          await UserContestHistory.bulkWrite(ops).catch(console.warn);
        }
      }
    }

    if (hasChanges) {
      userCp.compositeScore = calculateCompositeScore({
        codeforcesRating: userCp.codeforces?.rating,
        leetcodeRating: userCp.leetcode?.rating,
        codechefRating: userCp.codechef?.rating,
        atcoderRating: userCp.atcoder?.rating,
      });

      await userCp.save();
      updatedUsersCount++;
    }
  }

  return NextResponse.json({
    success: true,
    message: 'User contest profiles synced',
    totalProcessed: profiles.length,
    updatedUsersCount,
  });
}
