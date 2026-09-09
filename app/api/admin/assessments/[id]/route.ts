import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Assessment } from '@/models/assessment';
import { z } from 'zod';
import mongoose from 'mongoose';

type Ctx = { params: Promise<{ id: string }> };

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

const assessmentUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().min(5).optional(),
  passingScore: z.number().min(1).max(100).optional(),
  isProOnly: z.boolean().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  companyInstructions: z.array(z.string()).optional(),
  problems: z.array(problemSchema).min(1).optional(),
});

export async function GET(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { id } = await params;

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const assessment = await Assessment.findOne(query).lean();

    if (!assessment) {
      throw { status: 404, message: 'Assessment not found' };
    }

    return { assessment };
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { id } = await params;

    const body = await req.json();
    const validated = assessmentUpdateSchema.parse(body);

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };

    // If slug is changed, ensure uniqueness
    if (validated.slug) {
      const existing = await Assessment.findOne({
        slug: validated.slug,
        _id: { $ne: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : undefined },
      });
      if (existing) {
        throw { status: 400, message: `An assessment with slug "${validated.slug}" already exists.` };
      }
    }

    const updated = await Assessment.findOneAndUpdate(
      query,
      { $set: validated },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw { status: 404, message: 'Assessment not found' };
    }

    return { success: true, assessment: updated };
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { id } = await params;

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const deleted = await Assessment.findOneAndDelete(query);

    if (!deleted) {
      throw { status: 404, message: 'Assessment not found' };
    }

    return { success: true, message: 'Assessment removed successfully' };
  });
}
