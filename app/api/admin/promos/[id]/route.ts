import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { PromoCode } from '@/models/promoCode';
import { z } from 'zod';
import mongoose from 'mongoose';

type Ctx = { params: Promise<{ id: string }> };

const updatePromoSchema = z.object({
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0.01).optional(),
  applicablePlans: z.array(z.string()).optional(),
  maxRedemptions: z.number().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { id } = await params;

    const body = await req.json();
    const validated = updatePromoSchema.parse(body);

    const updatePayload: any = { ...validated };
    if (validated.expiresAt !== undefined) {
      updatePayload.expiresAt = validated.expiresAt ? new Date(validated.expiresAt) : null;
    }

    const updated = await PromoCode.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw { status: 404, message: 'Promo code not found' };
    }

    return { success: true, promo: updated };
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    const { id } = await params;

    const deleted = await PromoCode.findByIdAndDelete(id);

    if (!deleted) {
      throw { status: 404, message: 'Promo code not found' };
    }

    return { success: true, message: 'Promo code deleted successfully' };
  });
}
