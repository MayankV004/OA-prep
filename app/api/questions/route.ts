import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { withAuth } from '@/lib/auth';
import { Question, Group, UserQuestionProgress } from '@/models';
import { questionWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const subjectParam = searchParams.get('subjectId');
    const scope = searchParams.get('scope') || 'all'; // all | curated | mine | bookmarked | due
    const difficulty = searchParams.get('difficulty');
    const company = searchParams.get('company');
    const tag = searchParams.get('tag');
    const q = searchParams.get('q');

    // Resolve subject if slug was passed
    let subjectId = subjectParam;
    if (subjectParam && !mongoose.Types.ObjectId.isValid(subjectParam)) {
      const grp = await Group.findOne({ slug: subjectParam }).select('_id').lean();
      if (grp) {
        subjectId = (grp as any)._id.toString();
      }
    }

    const query: any = {};
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      query.subjectId = new mongoose.Types.ObjectId(subjectId);
    }

    // Filter by Scope
    if (scope === 'curated') {
      query.isSystem = true;
    } else if (scope === 'mine') {
      query.userId = new mongoose.Types.ObjectId(userId);
    } else {
      // 'all', 'bookmarked', 'due' look across both system curated and user's cards
      query.$or = [
        { isSystem: true },
        { userId: new mongoose.Types.ObjectId(userId) },
      ];
    }

    // Difficulty filter
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    // Company filter
    if (company) {
      query.companyTags = { $regex: new RegExp(`^${company}$`, 'i') };
    }

    // Tag filter
    if (tag) {
      query.tags = { $regex: new RegExp(`^${tag}$`, 'i') };
    }

    // Search query
    if (q && q.trim()) {
      const safeQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { question: { $regex: safeQ, $options: 'i' } },
          { answer: { $regex: safeQ, $options: 'i' } },
          { tags: { $regex: safeQ, $options: 'i' } },
          { companyTags: { $regex: safeQ, $options: 'i' } },
        ],
      });
    }

    const questions = await Question.find(query).sort({ createdAt: -1 }).lean();

    if (questions.length === 0) {
      return Response.json([]);
    }

    // Fetch user progress for these questions
    const questionIds = questions.map((q: any) => q._id);
    const progressDocs = await UserQuestionProgress.find({
      userId: new mongoose.Types.ObjectId(userId),
      questionId: { $in: questionIds },
    }).lean();

    const progressMap = new Map<string, any>();
    progressDocs.forEach((p: any) => {
      progressMap.set(p.questionId.toString(), p);
    });

    const now = new Date();
    let merged = questions.map((item: any) => {
      const p = progressMap.get(item._id.toString());
      return {
        ...item,
        _id: item._id.toString(),
        subjectId: item.subjectId.toString(),
        userId: item.userId ? item.userId.toString() : null,
        status: p?.status || 'unseen',
        confidence: p?.confidence ?? 0,
        bookmarked: Boolean(p?.bookmarked),
        timesReviewed: p?.timesReviewed || 0,
        lastReviewedAt: p?.lastReviewedAt ? p.lastReviewedAt.toISOString() : null,
        nextReviewAt: p?.nextReviewAt ? p.nextReviewAt.toISOString() : null,
        userNotes: p?.userNotes || '',
      };
    });

    // Handle post-filter for bookmarked or due
    if (scope === 'bookmarked') {
      merged = merged.filter((item) => item.bookmarked);
    } else if (scope === 'due') {
      merged = merged.filter((item) => {
        if (item.status === 'unseen') return true;
        if (item.status === 'mastered') return false;
        if (!item.nextReviewAt) return true;
        return new Date(item.nextReviewAt) <= now;
      });
    }

    return Response.json(merged);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const body = await req.json();
    const parsed = questionWriteSchema.parse(body);

    const isSystem = role === 'admin' && parsed.isSystem === true;

    // Validate subject exists
    const group = await Group.findById(parsed.subjectId);
    if (!group) {
      throw { status: 400, message: 'Invalid subject ID' };
    }

    const created = await Question.create({
      ...parsed,
      userId: isSystem ? (parsed.isSystem ? userId : null) : userId,
      isSystem,
    });

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'question.created',
      entity: {
        type: 'question',
        id: created._id.toString(),
        title: created.question.slice(0, 80),
      },
      metadata: { subjectId: created.subjectId, isSystem },
    });

    return Response.json(created, { status: 201 });
  });
}
