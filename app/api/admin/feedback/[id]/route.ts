import { NextRequest } from 'next/server';
import { withRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Feedback } from '@/models/feedback';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['pending', 'in_review', 'resolved', 'dismissed']).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    const feedback = await Feedback.findById(id);
    if (!feedback) throw { status: 404, message: 'Feedback report not found' };

    if (parsed.status !== undefined) feedback.status = parsed.status;
    if (parsed.adminNotes !== undefined) feedback.adminNotes = parsed.adminNotes;

    await feedback.save();

    return {
      success: true,
      message: 'Feedback updated successfully',
      feedback,
    };
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRole(req, 'admin', async () => {
    await dbConnect();
    const { id } = await params;

    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) throw { status: 404, message: 'Feedback report not found' };

    return {
      success: true,
      message: 'Feedback report deleted',
    };
  });
}
