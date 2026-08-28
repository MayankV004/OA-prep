import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { UserProgress, Activity, Pattern, Problem } from '@/models';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw { status: 500, message: 'Database connection failed' };

    // 1. Fetch User document using multi-format identifier resolution
    const idQueries: any[] = [{ _id: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      idQueries.push({ _id: new mongoose.Types.ObjectId(userId) });
    }
    idQueries.push({ id: userId });

    const userDoc: any = await db.collection('user').findOne({ $or: idQueries });
    if (!userDoc) throw { status: 404, message: 'User not found' };

    const uid = userDoc._id;

    // 2. Dates for 365 days (1 year) query
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // 3. Compute stats in parallel
    const [patterns, userProgress, nonStandardProblems, cpProblems, heatmap, recentActivity, revisionCount, notesCount] = await Promise.all([
      Pattern.find().lean(),
      UserProgress.find({ $or: [{ userId: uid }, { userId: userId }] }).lean(),
      Problem.find({ kind: 'nonstandard' }).lean(),
      Problem.find({ kind: 'cp' }).lean(),
      Activity.aggregate([
        { $match: { $or: [{ targetUserId: uid }, { targetUserId: userId }], createdAt: { $gte: oneYearAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $project: { date: '$_id', count: 1, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
      Activity.find({ $or: [{ targetUserId: uid }, { targetUserId: userId }] }).sort({ createdAt: -1 }).limit(15).lean(),
      UserProgress.countDocuments({ $or: [{ userId: uid }, { userId: userId }], revision: true }),
      UserProgress.countDocuments({ $or: [{ userId: uid }, { userId: userId }], userNotes: { $exists: true, $ne: '' } }),
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
        name: userDoc.name || '',
        email: userDoc.email || '',
        image: userDoc.image || null,
        role: userDoc.role || 'user',
        bio: userDoc.bio || '',
        college: userDoc.college || '',
        github: userDoc.github || '',
        linkedin: userDoc.linkedin || '',
        portfolio: userDoc.portfolio || '',
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
  image: z.string().optional().nullable(),
  bio: z.string().max(300).optional().nullable(),
  college: z.string().max(120).optional().nullable(),
  github: z.string().max(120).optional().nullable(),
  linkedin: z.string().max(120).optional().nullable(),
  portfolio: z.string().max(120).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw { status: 500, message: 'Database connection failed' };

    const body = await req.json();
    const parsed = updateProfileSchema.parse(body);

    const updateFields: Record<string, any> = {};
    if (parsed.name !== undefined) updateFields.name = parsed.name?.trim();
    if (parsed.image !== undefined) updateFields.image = parsed.image || '';
    if (parsed.bio !== undefined) updateFields.bio = parsed.bio || '';
    if (parsed.college !== undefined) updateFields.college = parsed.college || '';
    if (parsed.github !== undefined) updateFields.github = parsed.github || '';
    if (parsed.linkedin !== undefined) updateFields.linkedin = parsed.linkedin || '';
    if (parsed.portfolio !== undefined) updateFields.portfolio = parsed.portfolio || '';

    const idQueries: any[] = [{ _id: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      idQueries.push({ _id: new mongoose.Types.ObjectId(userId) });
    }
    idQueries.push({ id: userId });

    const updatedUser: any = await db.collection('user').findOneAndUpdate(
      { $or: idQueries },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      throw { status: 404, message: 'User not found to update' };
    }

    return {
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image || null,
        role: updatedUser.role || 'user',
        bio: updatedUser.bio || '',
        college: updatedUser.college || '',
        github: updatedUser.github || '',
        linkedin: updatedUser.linkedin || '',
        portfolio: updatedUser.portfolio || '',
      },
    };
  });
}
