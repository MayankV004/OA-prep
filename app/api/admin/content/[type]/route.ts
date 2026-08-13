import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Topic, Cheatsheet, Question, Problem, Pattern } from '@/models';
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
    const query: any = {};

    switch (type) {
      case 'problems': {
        const patterns = await Pattern.find().lean();
        const extracted: any[] = [];
        patterns.forEach((p: any) => {
          p.variations?.forEach((v: any) => {
            v.problems?.forEach((prob: any) => {
              if (!q || prob.name.toLowerCase().includes(q.toLowerCase())) {
                extracted.push({
                  _id: prob._id,
                  title: prob.name,
                  url: prob.link,
                  difficulty: prob.difficulty,
                  kind: 'pattern',
                  pattern: p.title,
                  createdAt: p.createdAt
                });
              }
            });
          });
        });
        
        // If there's a kind filter, apply it
        let filtered = extracted;
        if (searchParams.get('kind')) {
          const k = searchParams.get('kind');
          if (k !== 'all') {
            filtered = extracted.filter(prob => prob.kind === k);
          }
        }
        
        return { data: filtered.slice(0, limit) };
      }
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
