import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { PromoCode } from '@/models/promoCode';
import { z } from 'zod';

const createPromoSchema = z.object({
  code: z.string().min(2).max(40),
  description: z.string().optional().default(''),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0.01),
  applicablePlans: z.array(z.string()).default(['all']),
  maxRedemptions: z.number().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const status = searchParams.get('status') || 'all';

    const query: any = {};
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { code: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const promos = await PromoCode.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    return { data: promos };
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const body = await req.json();
    const validated = createPromoSchema.parse(body);

    const cleanCode = validated.code.trim().toUpperCase();

    const existing = await PromoCode.findOne({ code: cleanCode });
    if (existing) {
      throw { status: 400, message: `Promo code "${cleanCode}" already exists.` };
    }

    const promo = await PromoCode.create({
      ...validated,
      code: cleanCode,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      maxRedemptions: validated.maxRedemptions || null,
      createdBy: userId,
    });

    return { success: true, promo };
  });
}
