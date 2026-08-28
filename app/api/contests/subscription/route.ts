import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/user';
import { ContestSubscription } from '@/models/contestSubscription';
import { Contest } from '@/models/contest';
import { enqueueEmail } from '@/lib/qstash';
import { generateGoogleCalendarUrl } from '@/lib/contests/calendar';
import { env } from '@/lib/config';
import mongoose from 'mongoose';
import { z } from 'zod';

const subscriptionSchema = z.object({
  enabled: z.boolean().optional(),
  platforms: z.array(z.enum(['leetcode', 'codeforces', 'codechef', 'atcoder', 'hackerearth'])).optional(),
  leadTimes: z.array(z.enum(['24h', '2h', '30m'])).optional(),
  weeklyDigest: z.boolean().optional(),
  timezone: z.string().optional(),
  action: z.enum(['save', 'test']).optional(),
});

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await connectDB();
    const uid = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(uid).lean();
    if (!user) throw { status: 404, message: 'User not found' };

    let sub = await ContestSubscription.findOne({ userId: uid }).lean();

    if (!sub) {
      // Default preferences
      sub = {
        userId: uid,
        email: user.email,
        enabled: true,
        platforms: ['leetcode', 'codeforces', 'codechef', 'atcoder'],
        leadTimes: ['2h', '30m'],
        weeklyDigest: true,
        timezone: 'Asia/Kolkata',
      } as any;
    }

    return {
      subscription: {
        enabled: sub.enabled ?? true,
        platforms: sub.platforms || ['leetcode', 'codeforces', 'codechef', 'atcoder'],
        leadTimes: sub.leadTimes || ['2h', '30m'],
        weeklyDigest: sub.weeklyDigest ?? true,
        timezone: sub.timezone || 'Asia/Kolkata',
        email: sub.email || user.email,
        isAdmin: role === 'admin',
      },
    };
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await connectDB();
    const uid = new mongoose.Types.ObjectId(userId);
    const body = await req.json().catch(() => ({}));
    const parsed = subscriptionSchema.parse(body);

    const user = await User.findById(uid).lean();
    if (!user) throw { status: 404, message: 'User not found' };

    let sub = await ContestSubscription.findOne({ userId: uid });
    if (!sub) {
      sub = new ContestSubscription({
        userId: uid,
        email: user.email,
        enabled: true,
        platforms: ['leetcode', 'codeforces', 'codechef', 'atcoder'],
        leadTimes: ['2h', '30m'],
        weeklyDigest: true,
        timezone: 'Asia/Kolkata',
      });
    }

    // Handle "Send Test Alert" action (Admin only)
    if (parsed.action === 'test') {
      if (role !== 'admin') {
        throw { status: 403, message: 'Forbidden: Only administrators can trigger test alert emails' };
      }

      const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const unsubscribeUrl = `${appUrl}/api/contests/unsubscribe?token=${sub.unsubscribeToken}`;

      // Pick an upcoming or sample contest
      let contest = await Contest.findOne({ status: 'UPCOMING' }).sort({ startTime: 1 }).lean();
      if (!contest) {
        const dummyStart = new Date(Date.now() + 2 * 3600 * 1000);
        const dummyEnd = new Date(Date.now() + 3.5 * 3600 * 1000);
        contest = {
          name: 'LeetCode Weekly Contest 438',
          platform: 'leetcode',
          url: 'https://leetcode.com/contest/weekly-contest-438',
          startTime: dummyStart,
          endTime: dummyEnd,
          durationSeconds: 5400,
        } as any;
      }

      const calUrl = generateGoogleCalendarUrl({
        title: contest!.name,
        description: `Contest on ${contest!.platform.toUpperCase()}`,
        url: contest!.url,
        startTime: contest!.startTime,
        endTime: contest!.endTime,
        platform: contest!.platform,
      });

      const userTz = sub.timezone || 'Asia/Kolkata';
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: userTz,
      }).format(new Date(contest!.startTime));

      const formattedUtc = new Intl.DateTimeFormat('en-US', {
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(new Date(contest!.startTime)) + ' UTC';

      await enqueueEmail({
        type: 'contest_alert',
        to: user.email,
        userName: user.name,
        platform: contest!.platform,
        contestName: `[TEST ALERT] ${contest!.name}`,
        contestUrl: contest!.url,
        startTimeFormatted: `${formattedDate} (${userTz})`,
        startTimeUtc: formattedUtc,
        durationFormatted: `${Math.round((contest!.durationSeconds || 5400) / 60)} minutes`,
        startsInLabel: 'Starts in 2 hours',
        googleCalendarUrl: calUrl,
        unsubscribeUrl,
        preferencesUrl: `${appUrl}/cp/contests`,
        practiceUrl: `${appUrl}/cp`,
      });

      return {
        success: true,
        message: `Test alert sent to ${user.email}`,
      };
    }

    // Save preferences
    if (parsed.enabled !== undefined) sub.enabled = parsed.enabled;
    if (parsed.platforms !== undefined) sub.platforms = parsed.platforms;
    if (parsed.leadTimes !== undefined) sub.leadTimes = parsed.leadTimes;
    if (parsed.weeklyDigest !== undefined) sub.weeklyDigest = parsed.weeklyDigest;
    if (parsed.timezone !== undefined) sub.timezone = parsed.timezone;

    await sub.save();

    return {
      success: true,
      subscription: {
        enabled: sub.enabled,
        platforms: sub.platforms,
        leadTimes: sub.leadTimes,
        weeklyDigest: sub.weeklyDigest,
        timezone: sub.timezone,
        email: sub.email,
      },
    };
  });
}
