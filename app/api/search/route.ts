import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, Topic, Cheatsheet, Question } from '@/models';
import { searchQuerySchema } from '@/lib/zod';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    await dbConnect();
    const parsed = searchQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
    const { q, kind, scope, limit } = parsed;

    if (scope === 'all' && role !== 'admin') throw { status: 403, message: 'Forbidden' };

    const userFilter = scope === 'all' ? {} : { userId: new mongoose.Types.ObjectId(userId) };
    const textFilter = { $text: { $search: q } };
    const scoreSort = { score: { $meta: 'textScore' } };

    const searches: Promise<any[]>[] = [];

    if (kind === 'all' || kind === 'problems') {
      searches.push(
        Problem.find({ ...userFilter, ...textFilter }, { score: scoreSort })
          .sort(scoreSort)
          .limit(limit)
          .lean()
          .then(r => r.map(d => ({ ...d, _type: 'problem' })))
      );
    }
    if (kind === 'all' || kind === 'topics') {
      searches.push(
        Topic.find({ ...userFilter, ...textFilter }, { score: scoreSort })
          .sort(scoreSort)
          .limit(limit)
          .lean()
          .then(r => r.map(d => ({ ...d, _type: 'topic' })))
      );
    }
    if (kind === 'all' || kind === 'cheatsheets') {
      searches.push(
        Cheatsheet.find({ ...userFilter, ...textFilter }, { score: scoreSort })
          .sort(scoreSort)
          .limit(limit)
          .lean()
          .then(r => r.map(d => ({ ...d, _type: 'cheatsheet' })))
      );
    }
    if (kind === 'all' || kind === 'questions') {
      searches.push(
        Question.find({ ...userFilter, ...textFilter }, { score: scoreSort })
          .sort(scoreSort)
          .limit(limit)
          .lean()
          .then(r => r.map(d => ({ ...d, _type: 'question' })))
      );
    }

    const results = (await Promise.all(searches)).flat();
    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return results.slice(0, limit);
  });
}
