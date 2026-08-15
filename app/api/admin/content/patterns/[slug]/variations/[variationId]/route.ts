import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { Pattern } from '@/models';
import dbConnect from '@/lib/db';
import { z } from 'zod';

const variationUpdateSchema = z.object({
  variation: z.string().min(1).optional(),
  description: z.string().optional(),
  important_details: z.array(z.string()).optional(),
  template_code: z.string().optional(),
  other_relevant_details: z.string().optional(),
});

/** PUT /api/admin/content/patterns/[slug]/variations/[variationId] — update a variation */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; variationId: string }> }
) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug, variationId } = await params;
    const body = await req.json();
    const parsed = variationUpdateSchema.parse(body);

    // Build $set object for nested subdocument fields
    const setObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (val !== undefined) setObj[`variations.$.${key}`] = val;
    }

    const pattern = await Pattern.findOneAndUpdate(
      { slug, 'variations._id': variationId },
      { $set: setObj },
      { new: true }
    );

    if (!pattern) throw { status: 404, message: 'Variation not found' };
    const updated = pattern.variations.find(
      (v: any) => v._id.toString() === variationId
    );
    return { data: updated };
  });
}

/** DELETE /api/admin/content/patterns/[slug]/variations/[variationId] — remove a variation */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; variationId: string }> }
) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { slug, variationId } = await params;

    const pattern = await Pattern.findOneAndUpdate(
      { slug },
      { $pull: { variations: { _id: variationId } } },
      { new: true }
    );

    if (!pattern) throw { status: 404, message: 'Pattern not found' };
    return { success: true };
  });
}
