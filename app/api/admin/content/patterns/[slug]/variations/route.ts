import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Pattern } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';
import mongoose from 'mongoose';

const variationSchema = z.object({
  variation: z.string().min(1, 'Variation name is required'),
  description: z.string().optional().default(''),
  important_details: z.array(z.string()).optional().default([]),
  template_code: z.string().optional().default(''),
  other_relevant_details: z.string().optional().default(''),
});

/** POST /api/admin/content/patterns/[slug]/variations — add a new variation */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug } = await params;
    const body = await req.json();
    const parsed = variationSchema.parse(body);

    const pattern = await Pattern.findOneAndUpdate(
      { slug },
      { $push: { variations: { ...parsed, _id: new mongoose.Types.ObjectId() } } },
      { new: true }
    );

    if (!pattern) throw { status: 404, message: 'Pattern not found' };
    return { data: pattern };
  });
}
