import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getPaymentAdapter, getDynamicPlans, type CheckoutPlanKey } from '@/lib/payments';
import { env } from '@/lib/config';
import dbConnect from '@/lib/db';
import { PromoCode } from '@/models/promoCode';
import mongoose from 'mongoose';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['pro_monthly', 'pro_annual', 'oa_pass']),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw { status: 500, message: 'Database connection failed' };

    const body = await req.json();
    const { plan, promoCode } = checkoutSchema.parse(body);

    // Resolve user email
    const idQueries: any[] = [{ _id: userId }];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      idQueries.push({ _id: new mongoose.Types.ObjectId(userId) });
    }
    idQueries.push({ id: userId });

    const userDoc: any = await db.collection('user').findOne({ $or: idQueries });
    if (!userDoc?.email) {
      throw { status: 404, message: 'User profile with valid email not found' };
    }

    // Resolve dynamic price
    const plans = await getDynamicPlans();
    const planConfig = plans[plan as CheckoutPlanKey];
    let discountedPriceUsd = planConfig.priceUsd;
    let validatedCode: string | undefined = undefined;

    if (promoCode && promoCode.trim()) {
      const cleanCode = promoCode.trim().toUpperCase();
      const promo = await PromoCode.findOne({ code: cleanCode, isActive: true });

      if (!promo) {
        throw { status: 400, message: 'Invalid or inactive promo code.' };
      }

      if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
        throw { status: 400, message: 'This promo code has expired.' };
      }

      if (
        typeof promo.maxRedemptions === 'number' &&
        promo.maxRedemptions > 0 &&
        promo.redemptionCount >= promo.maxRedemptions
      ) {
        throw { status: 400, message: 'This promo code has reached its maximum redemption limit.' };
      }

      const isApplicable =
        promo.applicablePlans.includes('all') || promo.applicablePlans.includes(plan);

      if (!isApplicable) {
        throw { status: 400, message: 'This promo code cannot be applied to the selected plan.' };
      }

      let discountAmount = 0;
      if (promo.discountType === 'percentage') {
        discountAmount = (planConfig.priceUsd * promo.discountValue) / 100;
      } else {
        discountAmount = Math.min(promo.discountValue, planConfig.priceUsd);
      }

      discountedPriceUsd = Math.max(0, Math.round((planConfig.priceUsd - discountAmount) * 100) / 100);
      validatedCode = promo.code;
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/dashboard?payment=success&plan=${plan}`;
    const cancelUrl = `${appUrl}/pricing?canceled=true`;

    const paymentAdapter = getPaymentAdapter();
    const session = await paymentAdapter.createCheckoutSession({
      userId: userDoc._id.toString(),
      userEmail: userDoc.email,
      plan: plan as CheckoutPlanKey,
      successUrl,
      cancelUrl,
      promoCode: validatedCode,
      discountedPriceUsd,
    });

    return {
      success: true,
      url: session.url,
      provider: session.provider,
    };
  });
}
