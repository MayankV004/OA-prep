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
    const limitParam = searchParams.get('limit');
    const limit = limitParam === 'all' ? 2000 : Math.min(Number(limitParam || 1000), 2000);
    const q = searchParams.get('q');
    const kind = searchParams.get('kind') || 'all';
    const patternFilter = searchParams.get('pattern');

    let Model: any;
    const query: any = {};

    switch (type) {
      case 'problems': {
        const extracted: any[] = [];

        // 1. Fetch Pattern problems if kind is 'all' or 'pattern'
        if (kind === 'all' || kind === 'pattern') {
          const patternQuery: any = {};
          if (patternFilter && patternFilter !== 'all') {
            patternQuery.$or = [
              { slug: patternFilter },
              { title: { $regex: patternFilter, $options: 'i' } }
            ];
          }
          const patterns = await Pattern.find(patternQuery).lean();

          patterns.forEach((p: any) => {
            p.variations?.forEach((v: any) => {
              v.problems?.forEach((prob: any) => {
                if (!q || prob.name?.toLowerCase().includes(q.toLowerCase())) {
                  extracted.push({
                    _id: prob._id?.toString() || `${p.slug}-${prob.name}`,
                    title: prob.name,
                    url: prob.link,
                    difficulty: prob.difficulty || 'Medium',
                    kind: 'pattern',
                    pattern: p.title,
                    variation: v.variation || v.title,
                    company_tags: prob.company_tags || [],
                    createdAt: p.createdAt || new Date().toISOString()
                  });
                }
              });
            });
          });
        }

        // 2. Fetch Non-Standard and CP problems if kind is 'all', 'nonstandard', or 'cp'
        if (kind === 'all' || kind === 'nonstandard' || kind === 'cp') {
          const problemQuery: any = {};
          if (kind !== 'all') {
            problemQuery.kind = kind;
          }
          if (q) {
            problemQuery.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
          }

          const dbProblems = await Problem.find(problemQuery).sort({ createdAt: -1 }).lean();
          dbProblems.forEach((prob: any) => {
            extracted.push({
              _id: prob._id?.toString(),
              title: prob.title,
              url: prob.url,
              difficulty: prob.difficulty,
              kind: prob.kind || 'nonstandard',
              bucket: prob.bucket,
              platform: prob.platform,
              createdAt: prob.createdAt || new Date().toISOString()
            });
          });
        }

        return { data: extracted.slice(0, limit) };
      }
      case 'topics': {
        Model = Topic;
        if (q) {
          const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.title = { $regex: safeQ, $options: 'i' };
        }
        break;
      }
      case 'cheatsheets': {
        Model = Cheatsheet;
        if (q) {
          const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.title = { $regex: safeQ, $options: 'i' };
        }
        break;
      }
      case 'questions': {
        Model = Question;
        if (q) {
          const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.question = { $regex: safeQ, $options: 'i' };
        }
        break;
      }
      default:
        throw { status: 400, message: 'Invalid content type' };
    }

    const data = await Model.find(query).sort({ createdAt: -1 }).limit(limit).populate('userId', 'name email');
    return { data };
  });
}
