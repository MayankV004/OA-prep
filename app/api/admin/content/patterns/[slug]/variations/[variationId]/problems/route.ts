import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Pattern } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';
import mongoose from 'mongoose';

const problemSchema = z.object({
  name: z.string().min(1, 'Problem name is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  platform: z.string().min(1, 'Platform is required'),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  priority: z.string().optional().default(''),
  company_tags: z.array(z.string()).optional().default([]),
});

const updateProblemSchema = problemSchema.extend({
  problemId: z.string().min(1),
});

/** GET /api/admin/content/patterns/[slug]/variations/[variationId]/problems
 *  Returns the problems array for a variation */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; variationId: string }> }
) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug, variationId } = await params;

    const pattern = await Pattern.findOne({ slug }).select('variations').lean();
    if (!pattern) throw { status: 404, message: 'Pattern not found' };

    const variation = (pattern as any).variations?.find(
      (v: any) => v._id?.toString() === variationId
    );
    if (!variation) throw { status: 404, message: 'Variation not found' };

    return { data: variation.problems || [] };
  });
}

/** POST /api/admin/content/patterns/[slug]/variations/[variationId]/problems
 *  Add a new problem to a variation */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; variationId: string }> }
) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug, variationId } = await params;
    const body = await req.json();
    const parsed = problemSchema.parse(body);

    const newProblem = { ...parsed, _id: new mongoose.Types.ObjectId() };

    const pattern = await Pattern.findOneAndUpdate(
      { slug, 'variations._id': variationId },
      { $push: { 'variations.$.problems': newProblem } },
      { new: true }
    );

    if (!pattern) throw { status: 404, message: 'Variation not found' };
    return { data: newProblem };
  });
}

/** PUT /api/admin/content/patterns/[slug]/variations/[variationId]/problems
 *  Update an existing problem */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; variationId: string }> }
) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug, variationId } = await params;
    const body = await req.json();
    const { problemId, ...fields } = updateProblemSchema.parse(body);

    // Update nested array element — requires ArrayFilters
    const setObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) setObj[`variations.$[v].problems.$[p].${key}`] = val;
    }

    const pattern = await Pattern.findOneAndUpdate(
      { slug },
      { $set: setObj },
      {
        arrayFilters: [
          { 'v._id': new mongoose.Types.ObjectId(variationId) },
          { 'p._id': new mongoose.Types.ObjectId(problemId) },
        ],
        new: true,
      }
    );

    if (!pattern) throw { status: 404, message: 'Problem not found' };
    return { success: true };
  });
}

/** DELETE /api/admin/content/patterns/[slug]/variations/[variationId]/problems?problemId=xxx */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; variationId: string }> }
) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug, variationId } = await params;
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    if (!problemId) throw { status: 400, message: 'problemId query param required' };

    const pattern = await Pattern.findOneAndUpdate(
      { slug, 'variations._id': variationId },
      { $pull: { 'variations.$.problems': { _id: new mongoose.Types.ObjectId(problemId) } } },
      { new: true }
    );

    if (!pattern) throw { status: 404, message: 'Variation not found' };
    return { success: true };
  });
}
