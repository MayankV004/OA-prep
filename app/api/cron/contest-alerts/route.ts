import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contest } from '@/models/contest';
import { ContestSubscription } from '@/models/contestSubscription';
import { ContestAlertLog } from '@/models/contestAlertLog';
import { User } from '@/models/user';
import { enqueueEmail } from '@/lib/qstash';
import { generateGoogleCalendarUrl } from '@/lib/contests/calendar';
import { env } from '@/lib/config';

interface LeadTimeConfig {
  key: '24h' | '2h' | '30m';
  label: string;
  minOffsetMs: number;
  maxOffsetMs: number;
}

const LEAD_TIME_WINDOWS: LeadTimeConfig[] = [
  {
    key: '24h',
    label: 'Starts tomorrow (in 24 hours)',
    minOffsetMs: 20 * 3600 * 1000, // 20h
    maxOffsetMs: 26 * 3600 * 1000, // 26h
  },
  {
    key: '2h',
    label: 'Starts in 2 hours',
    minOffsetMs: 90 * 60 * 1000, // 1h 30m
    maxOffsetMs: 150 * 60 * 1000, // 2h 30m
  },
  {
    key: '30m',
    label: 'Starts in 30 minutes',
    minOffsetMs: 10 * 60 * 1000, // 10m
    maxOffsetMs: 50 * 60 * 1000, // 50m
  },
];

export async function GET(req: NextRequest) {
  return handleAlerts(req);
}

export async function POST(req: NextRequest) {
  return handleAlerts(req);
}

async function handleAlerts(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isDev) {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const now = Date.now();
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let totalEvaluated = 0;
  let totalDispatched = 0;
  let totalSkippedIdempotent = 0;
  const dispatchSummary: Array<{ contest: string; leadTime: string; recipientCount: number }> = [];

  for (const window of LEAD_TIME_WINDOWS) {
    const windowStart = new Date(now + window.minOffsetMs);
    const windowEnd = new Date(now + window.maxOffsetMs);

    const upcomingContests = await Contest.find({
      status: 'UPCOMING',
      startTime: { $gte: windowStart, $lte: windowEnd },
    }).lean();

    for (const contest of upcomingContests) {
      totalEvaluated++;

      // Find all subscribers interested in this platform and lead time
      const subscribers = await ContestSubscription.find({
        enabled: true,
        platforms: contest.platform,
        leadTimes: window.key,
      }).lean();

      let windowRecipientCount = 0;

      for (const sub of subscribers) {
        // Attempt atomic insert into ContestAlertLog to prevent race conditions and duplicate emails
        try {
          await ContestAlertLog.create({
            userId: sub.userId,
            contestId: contest._id,
            leadTime: window.key,
            sentAt: new Date(),
            status: 'SENT',
          });
        } catch (err: any) {
          // E11000 duplicate key error means alert was already sent for this contest window
          if (err.code === 11000) {
            totalSkippedIdempotent++;
            continue;
          }
          console.error('Error recording contest alert log:', err);
          continue;
        }

        // Fetch user's display name
        const user = await User.findById(sub.userId).select('name').lean();
        const userName = user?.name || 'Coder';
        const userTz = sub.timezone || 'Asia/Kolkata';

        const formattedDate = new Intl.DateTimeFormat('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: userTz,
        }).format(new Date(contest.startTime));

        const formattedUtc =
          new Intl.DateTimeFormat('en-US', {
            timeStyle: 'short',
            timeZone: 'UTC',
          }).format(new Date(contest.startTime)) + ' UTC';

        const calUrl = generateGoogleCalendarUrl({
          title: contest.name,
          description: `Coding contest on ${contest.platform.toUpperCase()}`,
          url: contest.url,
          startTime: contest.startTime,
          endTime: contest.endTime,
          platform: contest.platform,
        });

        const unsubscribeUrl = `${appUrl}/api/contests/unsubscribe?token=${sub.unsubscribeToken}`;

        await enqueueEmail({
          type: 'contest_alert',
          to: sub.email,
          userName,
          platform: contest.platform,
          contestName: contest.name,
          contestUrl: contest.url,
          startTimeFormatted: `${formattedDate} (${userTz})`,
          startTimeUtc: formattedUtc,
          durationFormatted: `${Math.round(contest.durationSeconds / 60)} minutes`,
          startsInLabel: window.label,
          googleCalendarUrl: calUrl,
          unsubscribeUrl,
          preferencesUrl: `${appUrl}/cp/contests`,
          practiceUrl: `${appUrl}/cp`,
        });

        totalDispatched++;
        windowRecipientCount++;
      }

      if (windowRecipientCount > 0) {
        dispatchSummary.push({
          contest: contest.name,
          leadTime: window.key,
          recipientCount: windowRecipientCount,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    totalEvaluated,
    totalDispatched,
    totalSkippedIdempotent,
    summary: dispatchSummary,
  });
}
