import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Assessment } from '@/models/assessment';
import { z } from 'zod';

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false),
  explanation: z.string().optional().default(''),
});

const problemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  score: z.number().min(1).default(50),
  patternTag: z.string().min(1),
  starterCode: z.object({
    cpp: z.string().default(''),
    python: z.string().default(''),
    java: z.string().default(''),
  }),
  testCases: z.array(testCaseSchema).default([]),
});

const assessmentCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  description: z.string().default(''),
  durationMinutes: z.number().min(5).default(60),
  passingScore: z.number().min(1).max(100).default(70),
  isProOnly: z.boolean().default(true),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  companyInstructions: z.array(z.string()).default([]),
  problems: z.array(problemSchema).min(1, 'An assessment must include at least one problem.'),
});

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const company = searchParams.get('company') || 'all';
    const difficulty = searchParams.get('difficulty') || 'all';
    const proOnly = searchParams.get('isProOnly');

    const query: any = {};
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { company: { $regex: safeSearch, $options: 'i' } },
        { role: { $regex: safeSearch, $options: 'i' } },
        { slug: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    if (company !== 'all') query.company = company;
    if (difficulty !== 'all') query.difficulty = difficulty;
    if (proOnly === 'true') query.isProOnly = true;
    if (proOnly === 'false') query.isProOnly = false;

    const assessments = await Assessment.find(query)
      .select('title slug company role durationMinutes passingScore isProOnly difficulty problems createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    const data = assessments.map((a: any) => ({
      _id: String(a._id),
      title: a.title,
      slug: a.slug,
      company: a.company,
      role: a.role,
      durationMinutes: a.durationMinutes,
      passingScore: a.passingScore,
      isProOnly: a.isProOnly,
      difficulty: a.difficulty,
      problemCount: a.problems?.length || 0,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return { data };
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const body = await req.json();
    const validated = assessmentCreateSchema.parse(body);

    const existingSlug = await Assessment.findOne({ slug: validated.slug });
    if (existingSlug) {
      throw { status: 400, message: `An assessment with slug "${validated.slug}" already exists.` };
    }

    const created = await Assessment.create(validated);
    return {
      success: true,
      assessment: {
        _id: String(created._id),
        title: created.title,
        slug: created.slug,
      },
    };
  });
}
