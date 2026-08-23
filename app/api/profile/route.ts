import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { User, UserProgress, Activity, Pattern, Problem } from '@/models';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const uid = new mongoose.Types.ObjectId(userId);

    // 1. Fetch User document
    const userDoc = await User.findById(userId).lean();
    if (!userDoc) throw { status: 404, message: 'User not found' };

    // 2. Dates for 365 days (1 year) query
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // 3. Compute stats in parallel
    const [patterns, userProgress, nonStandardProblems, cpProblems, heatmap, recentActivity, revisionCount, notesCount] = await Promise.all([
      Pattern.find().lean(),
      UserProgress.find({ userId: uid }).lean(),
      Problem.find({ kind: 'nonstandard' }).lean(),
      Problem.find({ kind: 'cp' }).lean(),
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
      Activity.find({ targetUserId: uid }).sort({ createdAt: -1 }).limit(15).lean(),
      UserProgress.countDocuments({ userId: uid, revision: true }),
      UserProgress.countDocuments({ userId: uid, userNotes: { $exists: true, $ne: '' } }),
    ]);

    // Build completed problem maps
    const completedSet = new Set<string>();
    userProgress.forEach((up: any) => {
      if (up.completed) completedSet.add(up.problemId);
    });

    // Pattern stats breakdown
    let totalPatternProblems = 0;
    let completedPatternProblems = 0;
    const difficultyMix: Record<'Easy' | 'Medium' | 'Hard', { total: number; completed: number }> = {
      Easy: { total: 0, completed: 0 },
      Medium: { total: 0, completed: 0 },
      Hard: { total: 0, completed: 0 },
    };

    const patternBreakdown = patterns.map((p: any) => {
      let patternTotal = 0;
      let patternCompleted = 0;

      p.variations?.forEach((v: any) => {
        v.problems?.forEach((prob: any) => {
          if (prob._id) {
            const pid = prob._id.toString();
            patternTotal++;
            totalPatternProblems++;

            const diff = (prob.difficulty || 'Easy') as 'Easy' | 'Medium' | 'Hard';
            if (difficultyMix[diff]) difficultyMix[diff].total++;

            if (completedSet.has(pid)) {
              patternCompleted++;
              completedPatternProblems++;
              if (difficultyMix[diff]) difficultyMix[diff].completed++;
            }
          }
        });
      });

      return {
        title: p.title,
        slug: p.slug,
        total: patternTotal,
        completed: patternCompleted,
        pct: patternTotal > 0 ? Math.round((patternCompleted / patternTotal) * 100) : 0,
      };
    });

    // Non-standard & CP stats
    const nonStandardCompleted = nonStandardProblems.filter((p: any) => completedSet.has(p._id.toString()) || p.completed).length;
    const cpCompleted = cpProblems.filter((p: any) => completedSet.has(p._id.toString()) || p.completed).length;

    const grandTotalProblems = totalPatternProblems + nonStandardProblems.length + cpProblems.length;
    const grandTotalCompleted = completedPatternProblems + nonStandardCompleted + cpCompleted;
    const grandPct = grandTotalProblems > 0 ? Math.round((grandTotalCompleted / grandTotalProblems) * 100) : 0;

    return {
      user: {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        image: userDoc.image || null,
        role: userDoc.role || 'user',
        createdAt: userDoc.createdAt,
        lastSeenAt: userDoc.lastSeenAt,
      },
      stats: {
        grandTotalProblems,
        grandTotalCompleted,
        grandPct,
        totalPatternProblems,
        completedPatternProblems,
        difficultyMix,
        patternBreakdown,
        nonStandard: { total: nonStandardProblems.length, completed: nonStandardCompleted },
        cp: { total: cpProblems.length, completed: cpCompleted },
        revisionCount,
        notesCount,
      },
      heatmap,
      recentActivity,
    };
  });
}

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  image: z.string().url('Invalid image URL').or(z.literal('')).optional(),
});

export async function PATCH(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = updateProfileSchema.parse(body);

    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };

    if (parsed.name !== undefined) user.name = parsed.name;
    if (parsed.image !== undefined) user.image = parsed.image || undefined;

    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || null,
      role: user.role,
    };
  });
}
