import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, PatternProblem, NonStandardProblem, CpProblem } from '@/models';
import { problemWriteSchema } from '@/lib/zod';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');
    const targetUserId = searchParams.get('userId') || userId;
    
    if (targetUserId !== userId && role !== 'admin') {
      throw { status: 403, message: 'Forbidden' };
    }
    
    if (!kind || !['pattern', 'nonstandard', 'cp'].includes(kind)) {
      throw { status: 400, message: 'Valid kind parameter is required' };
    }

    const query: any = { userId: targetUserId, kind };

    if (searchParams.has('completed')) {
      query.completed = searchParams.get('completed') === 'true';
    }
    if (searchParams.has('difficulty')) {
      query.difficulty = searchParams.get('difficulty');
    }
    
    const problems = await Problem.find(query).sort({ updatedAt: -1 });
    return problems;
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

    await recordActivity({
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
