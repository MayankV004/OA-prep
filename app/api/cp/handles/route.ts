import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
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
import mongoose from 'mongoose';
import { z } from 'zod';

const linkHandleSchema = z.object({
  platform: z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder']),
  handle: z.string().min(1, 'Handle is required').max(80),
});

const unlinkHandleSchema = z.object({
  platform: z.enum(['codeforces', 'leetcode', 'codechef', 'atcoder']),
});

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await connectDB();
    const uid = new mongoose.Types.ObjectId(userId);

    const profile = await UserCpProfile.findOne({ userId: uid }).lean();

    return {
      success: true,
      profile: profile || {
        userId: uid,
        compositeScore: 0,
      },
    };
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await connectDB();
    const uid = new mongoose.Types.ObjectId(userId);
    const body = await req.json().catch(() => ({}));
    const { platform, handle } = linkHandleSchema.parse(body);

    let profileResult;
    if (platform === 'codeforces') profileResult = await fetchCodeforcesProfile(handle);
    else if (platform === 'leetcode') profileResult = await fetchLeetCodeProfile(handle);
    else if (platform === 'codechef') profileResult = await fetchCodeChefProfile(handle);
    else if (platform === 'atcoder') profileResult = await fetchAtCoderProfile(handle);

    if (!profileResult || !profileResult.valid) {
      return NextResponse.json(
        { success: false, error: profileResult?.error || `User "${handle}" not found on ${platform}` },
        { status: 400 }
      );
    }

    let userCp = await UserCpProfile.findOne({ userId: uid });
    if (!userCp) {
      userCp = new UserCpProfile({ userId: uid });
    }

    const now = new Date();

    // Update platform data
    if (platform === 'codeforces') {
      userCp.codeforces = {
        handle: profileResult.handle,
        rating: profileResult.rating,
        maxRating: profileResult.maxRating || profileResult.rating,
        rank: profileResult.rank,
        avatar: profileResult.avatar,
        lastSyncedAt: now,
      };
    } else if (platform === 'leetcode') {
      userCp.leetcode = {
        username: profileResult.handle,
        rating: profileResult.rating,
        globalRanking: profileResult.globalRanking || 0,
        topPercentage: profileResult.topPercentage || 0,
        attendedContestsCount: profileResult.attendedContestsCount,
        badge: profileResult.badge,
        lastSyncedAt: now,
      };
    } else if (platform === 'codechef') {
      userCp.codechef = {
        handle: profileResult.handle,
        rating: profileResult.rating,
        stars: profileResult.stars,
        globalRank: profileResult.globalRank || 0,
        division: profileResult.division,
        lastSyncedAt: now,
      };
    } else if (platform === 'atcoder') {
      userCp.atcoder = {
        handle: profileResult.handle,
        rating: profileResult.rating,
        highestRating: profileResult.maxRating || profileResult.rating,
        color: profileResult.color,
        lastSyncedAt: now,
      };
    }

    // Recalculate composite score
    userCp.compositeScore = calculateCompositeScore({
      codeforcesRating: userCp.codeforces?.rating,
      leetcodeRating: userCp.leetcode?.rating,
      codechefRating: userCp.codechef?.rating,
      atcoderRating: userCp.atcoder?.rating,
    });

    await userCp.save();

    // Batch upsert historical contests into UserContestHistory
    if (Array.isArray(profileResult.history) && profileResult.history.length > 0) {
      const operations = profileResult.history.map((item) => ({
        updateOne: {
          filter: { userId: uid, platform, contestId: item.contestId },
          update: {
            $set: {
              userId: uid,
              platform,
              contestId: item.contestId,
              contestName: item.contestName,
              contestUrl: item.contestUrl,
              contestDate: item.contestDate,
              rank: item.rank,
              totalParticipants: item.totalParticipants,
              problemsSolved: item.problemsSolved,
              totalProblems: item.totalProblems,
              oldRating: item.oldRating,
              newRating: item.newRating,
              ratingDelta: item.ratingDelta,
            },
          },
          upsert: true,
        },
      }));

      await UserContestHistory.bulkWrite(operations).catch((err) =>
        console.warn('Error saving contest history:', err)
      );
    }

    return {
      success: true,
      message: `Successfully connected ${platform} handle "${profileResult.handle}"`,
      profile: userCp,
      importedContestsCount: profileResult.history?.length || 0,
    };
  });
}

export async function DELETE(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await connectDB();
    const uid = new mongoose.Types.ObjectId(userId);
    const body = await req.json().catch(() => ({}));
    const { platform } = unlinkHandleSchema.parse(body);

    const userCp = await UserCpProfile.findOne({ userId: uid });
    if (!userCp) return { success: true };

    if (platform === 'codeforces') userCp.codeforces = undefined;
    else if (platform === 'leetcode') userCp.leetcode = undefined;
    else if (platform === 'codechef') userCp.codechef = undefined;
    else if (platform === 'atcoder') userCp.atcoder = undefined;

    userCp.compositeScore = calculateCompositeScore({
      codeforcesRating: userCp.codeforces?.rating,
      leetcodeRating: userCp.leetcode?.rating,
      codechefRating: userCp.codechef?.rating,
      atcoderRating: userCp.atcoder?.rating,
    });

    await userCp.save();

    // Remove contest history for unlinked platform
    await UserContestHistory.deleteMany({ userId: uid, platform });

    return {
      success: true,
      message: `Unlinked ${platform} profile`,
      profile: userCp,
    };
  });
}
