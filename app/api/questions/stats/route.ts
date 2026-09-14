import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { withAuth } from '@/lib/auth';
import { Question, Group, UserQuestionProgress } from '@/models';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch all subject groups
    const subjectGroups = await Group.find({ kind: 'subject' }).sort({ order: 1 }).lean();

    // 2. Count accessible questions per subject (isSystem: true OR userId)
    const questionCounts = await Question.aggregate([
      {
        $match: {
          $or: [{ isSystem: true }, { userId: userObjectId }],
        },
      },
      {
        $group: {
          _id: '$subjectId',
          total: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    questionCounts.forEach((qc) => {
      countMap.set(qc._id.toString(), qc.total);
    });

    // 3. Aggregate user progress per subject
    const now = new Date();
    const progressStats = await UserQuestionProgress.aggregate([
      {
        $match: {
          userId: userObjectId,
        },
      },
      {
        $group: {
          _id: '$subjectId',
          mastered: {
            $sum: { $cond: [{ $eq: ['$status', 'mastered'] }, 1, 0] },
          },
          learning: {
            $sum: { $cond: [{ $eq: ['$status', 'learning'] }, 1, 0] },
          },
          reviewing: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewing'] }, 1, 0] },
          },
          bookmarked: {
            $sum: { $cond: [{ $eq: ['$bookmarked', true] }, 1, 0] },
          },
          due: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'mastered'] },
                    { $lte: ['$nextReviewAt', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const progressMap = new Map<string, any>();
    progressStats.forEach((ps) => {
      progressMap.set(ps._id.toString(), ps);
    });

    // 4. Combine into subject-level and overall stats
    let totalQuestionsAll = 0;
    let totalMasteredAll = 0;
    let totalDueAll = 0;
    let totalBookmarkedAll = 0;

    const subjects = subjectGroups.map((g: any) => {
      const gId = g._id.toString();
      const total = countMap.get(gId) || 0;
      const prog = progressMap.get(gId) || {
        mastered: 0,
        learning: 0,
        reviewing: 0,
        bookmarked: 0,
        due: 0,
      };

      const mastered = prog.mastered || 0;
      const learning = prog.learning || 0;
      const reviewing = prog.reviewing || 0;
      const bookmarked = prog.bookmarked || 0;
      const due = prog.due || 0;
      const unseen = Math.max(0, total - (mastered + learning + reviewing));
      const masteryPercentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

      totalQuestionsAll += total;
      totalMasteredAll += mastered;
      totalDueAll += due;
      totalBookmarkedAll += bookmarked;

      return {
        subjectId: gId,
        slug: g.slug,
        name: g.name,
        description: g.description,
        totalQuestions: total,
        masteredCount: mastered,
        learningCount: learning,
        reviewingCount: reviewing,
        unseenCount: unseen,
        bookmarkedCount: bookmarked,
        dueCount: due,
        masteryPercentage,
      };
    });

    const overallMasteryPercentage =
      totalQuestionsAll > 0 ? Math.round((totalMasteredAll / totalQuestionsAll) * 100) : 0;

    return Response.json({
      overall: {
        totalQuestions: totalQuestionsAll,
        totalMastered: totalMasteredAll,
        totalDue: totalDueAll,
        totalBookmarked: totalBookmarkedAll,
        masteryPercentage: overallMasteryPercentage,
      },
      subjects,
    });
  });
}
