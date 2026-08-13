import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Pattern } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const problemSchema = z.object({
  name: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  platform: z.string().min(1),
  link: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  company_tags: z.array(z.string()).optional(),
});

const variationSchema = z.object({
  variation: z.string().min(1),
  description: z.string().optional(),
  important_details: z.array(z.string()).optional(),
  template_code: z.string().optional(),
  other_relevant_details: z.string().optional(),
  problems: z.array(problemSchema).optional(),
});

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
  variations: z.array(variationSchema).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug } = await params;
    const pattern = await Pattern.findOne({ slug }).lean();
    if (!pattern) throw { status: 404, message: 'Pattern not found' };
    return pattern;
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug } = await params;
    const body = await req.json();
    const parsed = patternSchema.parse(body);
    const pattern = await Pattern.findOneAndUpdate({ slug }, parsed, { new: true });
    if (!pattern) throw { status: 404, message: 'Pattern not found' };
    return pattern;
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug } = await params;
    await Pattern.findOneAndDelete({ slug });
    return { success: true };
  });
}
