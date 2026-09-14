import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { withAuth } from '@/lib/auth';
import { Question, UserQuestionProgress } from '@/models';
import { questionProgressUpdateSchema } from '@/lib/zod';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: 'Invalid question ID' };
    }

    const question = await Question.findById(id).select('_id subjectId').lean();
    if (!question) {
      throw { status: 404, message: 'Question not found' };
    }

    const body = await req.json();
    const parsed = questionProgressUpdateSchema.parse(body);

    const updateDoc: any = {};
    const incDoc: any = {};

    if (parsed.bookmarked !== undefined) {
      updateDoc.bookmarked = parsed.bookmarked;
    }

    if (parsed.userNotes !== undefined) {
      updateDoc.userNotes = parsed.userNotes;
    }

    if (parsed.confidence !== undefined && parsed.confidence > 0) {
      updateDoc.confidence = parsed.confidence;
      updateDoc.lastReviewedAt = new Date();
      incDoc.timesReviewed = 1;

      // Spaced Repetition Interval calculation
      let days = 1;
      let calculatedStatus: 'learning' | 'reviewing' | 'mastered' = 'learning';

      if (parsed.confidence === 1) {
        // Again / Forgot
        days = 1;
        calculatedStatus = 'learning';
      } else if (parsed.confidence === 2) {
        // Hard
        days = 3;
        calculatedStatus = 'learning';
      } else if (parsed.confidence === 3) {
        // Good
        days = 7;
        calculatedStatus = 'reviewing';
      } else if (parsed.confidence === 4) {
        // Easy / Mastered
        days = 21;
        calculatedStatus = 'mastered';
      }

      updateDoc.nextReviewAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      updateDoc.status = parsed.status || calculatedStatus;
    } else if (parsed.status !== undefined) {
      updateDoc.status = parsed.status;
      if (parsed.status === 'mastered') {
        updateDoc.nextReviewAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    const updateQuery: any = { $set: updateDoc };
    if (Object.keys(incDoc).length > 0) {
      updateQuery.$inc = incDoc;
    }

    const progress = await UserQuestionProgress.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        questionId: new mongoose.Types.ObjectId(id),
      },
      {
        ...updateQuery,
        $setOnInsert: {
          userId: new mongoose.Types.ObjectId(userId),
          questionId: new mongoose.Types.ObjectId(id),
          subjectId: (question as any).subjectId,
        },
      },
      { new: true, upsert: true }
    );

    return Response.json(progress);
  });
}
