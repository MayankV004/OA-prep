import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserProgress } from '@/models/progress';
import { User } from '@/models/user';
import { Pattern } from '@/models/pattern';
import { Problem } from '@/models/problem';
import { enqueueEmail } from '@/lib/qstash';
import { env } from '@/lib/config';
import { WeeklyRevisionItem } from '@/types/email';

export async function GET(req: NextRequest) {
  return handleRevisionAlerts(req);
}

export async function POST(req: NextRequest) {
  return handleRevisionAlerts(req);
}

async function handleRevisionAlerts(req: NextRequest) {
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
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const now = new Date();

  // 1. Preload problem metadata map from patterns and problems
  const problemMetaMap = new Map<
    string,
    { title: string; patternTitle: string; difficulty: string; practiceUrl: string }
  >();

  try {
    const patterns = await Pattern.find().select('title slug variations').lean();
    for (const pat of patterns as any[]) {
      for (const v of pat.variations || []) {
        const varId = v._id?.toString() || v.id?.toString();
        const practiceUrl = `${appUrl}/dsa/${pat.slug}/${varId}/practice`;
        for (const prob of v.problems || []) {
          const probId = prob._id?.toString() || prob.id?.toString();
          if (probId) {
            problemMetaMap.set(probId, {
              title: prob.name || 'Coding Problem',
              patternTitle: pat.title || 'DSA Pattern',
              difficulty: prob.difficulty || 'Medium',
              practiceUrl,
            });
          }
        }
      }
    }

    const standaloneProblems = await Problem.find().select('title difficulty kind').lean();
    for (const prob of standaloneProblems as any[]) {
      const probId = prob._id.toString();
      if (!problemMetaMap.has(probId)) {
        problemMetaMap.set(probId, {
          title: prob.title || 'Coding Problem',
          patternTitle: prob.kind || 'Practice',
          difficulty: prob.difficulty || 'Medium',
          practiceUrl: `${appUrl}/dsa`,
        });
      }
    }
  } catch (err) {
    console.error('[cron/revision-alerts] Failed to build problem metadata map:', err);
  }

  // 2. Fetch all active revision progress items
  const revisionItems = await UserProgress.find({ revision: true }).lean();

  if (!revisionItems || revisionItems.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No active revision problems found',
      dispatchedCount: 0,
    });
  }

  // Group by userId
  const userProgressMap = new Map<string, any[]>();
  for (const item of revisionItems as any[]) {
    const uid = item.userId.toString();
    if (!userProgressMap.has(uid)) {
      userProgressMap.set(uid, []);
    }
    userProgressMap.get(uid)!.push(item);
  }

  let usersEvaluated = 0;
  let emailsDispatched = 0;

  for (const [userId, items] of userProgressMap.entries()) {
    usersEvaluated++;
    try {
      const user = await User.findById(userId).select('name email disabled').lean();
      if (!user || user.disabled || !user.email) continue;

      // Prioritize items that have passed nextReviewAt or were revised longest ago
      const sortedItems = [...items].sort((a, b) => {
        const aDue = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
        const bDue = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
        return aDue - bDue;
      });

      const emailProblems: WeeklyRevisionItem[] = [];
      for (const item of sortedItems.slice(0, 5)) {
        const meta = problemMetaMap.get(item.problemId) || {
          title: 'Algorithmic Problem',
          patternTitle: 'DSA Practice',
          difficulty: 'Medium',
          practiceUrl: `${appUrl}/dsa`,
        };

        let userNotesExcerpt: string | undefined = undefined;
        if (item.userNotes && typeof item.userNotes === 'string') {
          const cleanNotes = item.userNotes
            .replace(/[#*`_~>[\]]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          if (cleanNotes.length > 0) {
            userNotesExcerpt = cleanNotes.length > 100 ? `${cleanNotes.slice(0, 97)}...` : cleanNotes;
          }
        }

        emailProblems.push({
          problemId: item.problemId,
          title: meta.title,
          patternTitle: meta.patternTitle,
          difficulty: meta.difficulty,
          practiceUrl: meta.practiceUrl,
          userNotesExcerpt,
          timesRevised: item.timesRevised || 0,
        });
      }

      await enqueueEmail({
        type: 'revision_weekly_digest',
        to: user.email,
        userName: user.name || 'Coder',
        weekLabel: 'This Week',
        totalRevisionCount: items.length,
        problems: emailProblems,
        practiceHubUrl: `${appUrl}/dsa`,
      });

      emailsDispatched++;
    } catch (err) {
      console.error(`[cron/revision-alerts] Failed to process user ${userId}:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    usersEvaluated,
    emailsDispatched,
    timestamp: now.toISOString(),
  });
}
