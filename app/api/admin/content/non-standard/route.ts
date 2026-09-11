import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withRole } from '@/lib/auth';
import { NonStandardProblem, Problem } from '@/models/problem';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const bucket = searchParams.get('bucket')?.trim();
    const difficulty = searchParams.get('difficulty')?.trim();

    const query: Record<string, any> = { kind: 'nonstandard' };
    if (q) {
      const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: safeQ, $options: 'i' } },
        { notes: { $regex: safeQ, $options: 'i' } },
        { tags: { $regex: safeQ, $options: 'i' } },
      ];
    }
    if (bucket && bucket !== 'all') {
      query.bucket = bucket;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    const problems = await Problem.find(query).sort({ createdAt: -1 }).lean();

    // Aggregations
    const allNonStandard = await Problem.find({ kind: 'nonstandard' }).select('bucket difficulty').lean();
    const bucketCounts: Record<string, number> = {};
    const difficultyCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };

    allNonStandard.forEach((p: any) => {
      if (p.bucket) {
        bucketCounts[p.bucket] = (bucketCounts[p.bucket] || 0) + 1;
      }
      if (p.difficulty && difficultyCounts[p.difficulty] !== undefined) {
        difficultyCounts[p.difficulty]++;
      }
    });

    return NextResponse.json({
      problems,
      metrics: {
        total: allNonStandard.length,
        bucketCounts,
        difficultyCounts,
      },
    });
  });
}

export async function POST(req: NextRequest) {
  return withRole(req, 'admin', async (session) => {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { title, url, difficulty = 'Medium', bucket, notes = '', tags = [] } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Problem title is required' }, { status: 400 });
    }
    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'Problem URL or reference link is required' }, { status: 400 });
    }
    if (!bucket || typeof bucket !== 'string' || !bucket.trim()) {
      return NextResponse.json({ error: 'Category bucket is required' }, { status: 400 });
    }

    const created = await NonStandardProblem.create({
      userId: session.userId,
      title: title.trim(),
      url: url.trim(),
      difficulty,
      bucket: bucket.trim(),
      notes: notes.trim(),
      tags: Array.isArray(tags) ? tags : [],
      completed: false,
    });

    return NextResponse.json({ problem: created }, { status: 201 });
  });
}

export async function PATCH(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { id, title, url, difficulty, bucket, notes, tags } = body;

    if (!id) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (title) updates.title = title.trim();
    if (url) updates.url = url.trim();
    if (difficulty) updates.difficulty = difficulty;
    if (bucket) updates.bucket = bucket.trim();
    if (notes !== undefined) updates.notes = notes.trim();
    if (Array.isArray(tags)) updates.tags = tags;

    const updated = await Problem.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    return NextResponse.json({ problem: updated });
  });
}

export async function DELETE(req: NextRequest) {
  return withRole(req, 'admin', async () => {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    await Problem.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Non-standard problem deleted' });
  });
}
