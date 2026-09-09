import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { PricingPlan } from '@/models/pricingPlan';
import { seedDefaultPricingPlans, getDynamicPlans } from '@/lib/payments';
import { z } from 'zod';

const updatePlanSchema = z.object({
  planKey: z.enum(['pro_monthly', 'pro_annual', 'oa_pass']),
  name: z.string().min(1).optional(),
  badge: z.string().optional(),
  priceUsd: z.number().min(0),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  aiCredits: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();
    await seedDefaultPricingPlans();

    const plans = await PricingPlan.find().sort({ createdAt: 1 }).lean();
    return { data: plans };
  });
}

export async function PUT(req: NextRequest) {
  return withAuth(req, async ({ role }) => {
    if (role !== 'admin') throw { status: 403, message: 'Forbidden' };
    await dbConnect();

    const body = await req.json();
    const validated = updatePlanSchema.parse(body);

    const updated = await PricingPlan.findOneAndUpdate(
      { planKey: validated.planKey },
      { $set: validated },
      { upsert: true, new: true, runValidators: true }
    );

    return { success: true, plan: updated };
  });
}
