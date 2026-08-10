import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Problem, Topic, Cheatsheet, Question } from '@/models';
import dbConnect from '@/lib/db';

type Ctx = { params: Promise<{ type: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const { type } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
    const q = searchParams.get('q');

    let Model: any;
    let query: any = {};

    switch (type) {
      case 'problems':
        Model = Problem;
        const kind = searchParams.get('kind');
        if (kind && kind !== 'all') query.kind = kind;
        if (q) query.title = { $regex: q, $options: 'i' };
        break;
      case 'topics':
        Model = Topic;
        if (q) query.title = { $regex: q, $options: 'i' };
        break;
      case 'cheatsheets':
        Model = Cheatsheet;
        if (q) query.title = { $regex: q, $options: 'i' };
        break;
      case 'questions':
        Model = Question;
        if (q) query.question = { $regex: q, $options: 'i' };
        break;
      default:
        throw { status: 400, message: 'Invalid content type' };
    }

    const data = await Model.find(query).sort({ createdAt: -1 }).limit(limit).populate('userId', 'name email');
    return { data };
  });
}
