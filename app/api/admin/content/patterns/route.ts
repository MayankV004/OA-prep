import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Pattern } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const patternSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  useCases: z.array(z.string()).optional(),
  concept: z.string().optional(),
  templateCode: z.string().optional(),
  explanation: z.string().optional(),
});

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const patterns = await Pattern.find().sort({ title: 1 }).lean();
    return { data: patterns };
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const body = await req.json();
    const parsed = patternSchema.parse(body);
    const pattern = await Pattern.create({ ...parsed, variations: [] });
    return pattern;
  });
}
