import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, PatternProblem, NonStandardProblem, CpProblem, UserProgress } from '@/models';
import { problemWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';
import { z } from 'zod';

import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const rawUserId = searchParams.get('userId');

    if (rawUserId && rawUserId !== 'me' && !mongoose.Types.ObjectId.isValid(rawUserId)) {
      throw { status: 400, message: 'Invalid userId parameter' };
    }

    const targetUserId = rawUserId && rawUserId !== 'me' ? rawUserId : userId;
    
    if (targetUserId !== userId && role !== 'admin') {
      throw { status: 403, message: 'Forbidden' };
    }
    
    if (!kind || !['pattern', 'nonstandard', 'cp'].includes(kind)) {
      throw { status: 400, message: 'Valid kind parameter is required' };
    }

    if (kind === 'nonstandard') {
      const existingCount = await Problem.countDocuments({ userId: targetUserId, kind: 'nonstandard' });
      if (existingCount === 0) {
        const { seedNonStandardForUser } = await import('@/lib/seed-non-standard');
        await seedNonStandardForUser(targetUserId);
      }
    }

    const query: any = { userId: targetUserId, kind };

    if (searchParams.has('pattern')) {
      query.pattern = searchParams.get('pattern');
    }
    if (searchParams.has('bucket')) {
      query.bucket = searchParams.get('bucket');
    }
    if (searchParams.has('platform')) {
      query.platform = searchParams.get('platform');
    }

    if (searchParams.has('completed')) {
      query.completed = searchParams.get('completed') === 'true';
    }
    if (searchParams.has('difficulty')) {
      query.difficulty = searchParams.get('difficulty');
    }
    
    const problems = await Problem.find(query).sort({ updatedAt: -1 }).lean();
    const problemIds = problems.map((p: any) => p._id.toString());
    const userProgressList = await UserProgress.find({ userId: targetUserId, problemId: { $in: problemIds } }).lean();
    const progressMap = new Map(userProgressList.map((up: any) => [up.problemId, up]));

    const enriched = problems.map((p: any) => {
      const up = progressMap.get(p._id.toString());
      const userNotes = up?.userNotes !== undefined ? up.userNotes : (p.userNotes || p.notes || '');
      return {
        ...p,
        completed: up?.completed ?? p.completed ?? false,
        notes: userNotes,
        userNotes: userNotes,
        revision: up?.revision ?? false,
      };
    });

    return enriched;
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    
    const body = await req.json();
    const targetUserId = searchParamsUserId(req) || userId;
    
    if (targetUserId !== userId && role !== 'admin') {
      throw { status: 403, message: 'Forbidden' };
    }

    const parsed = problemWriteSchema.parse(body);

    let created;
    if (parsed.kind === 'pattern') {
      created = await PatternProblem.create({ ...parsed, userId: targetUserId });
    } else if (parsed.kind === 'nonstandard') {
      created = await NonStandardProblem.create({ ...parsed, userId: targetUserId });
    } else if (parsed.kind === 'cp') {
      created = await CpProblem.create({ ...parsed, userId: targetUserId });
    }

    recordActivity({
      actorId: userId,
      targetUserId,
      kind: 'problem.created',
      entity: { type: 'problem', id: created._id.toString(), title: created.title },
      metadata: { kind: created.kind, difficulty: created.difficulty }
    });

    return created;
  });
}

function searchParamsUserId(req: NextRequest) {
  return new URL(req.url).searchParams.get('userId');
}
