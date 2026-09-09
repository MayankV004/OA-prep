import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { PromoCode } from '@/models/promoCode';
import { getDynamicPlans, type CheckoutPlanKey } from '@/lib/payments';
import { z } from 'zod';

const validatePromoSchema = z.object({
  code: z.string().min(1).max(50),
  plan: z.enum(['pro_monthly', 'pro_annual', 'oa_pass']),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { code, plan } = validatePromoSchema.parse(body);

    const cleanCode = code.trim().toUpperCase();
    const promo = await PromoCode.findOne({ code: cleanCode, isActive: true });

    if (!promo) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or inactive promo code.' },
        { status: 400 }
      );
    }

    // Expiry check
    if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { valid: false, message: 'This promo code has expired.' },
        { status: 400 }
      );
    }

    // Usage limit check
    if (
      typeof promo.maxRedemptions === 'number' &&
      promo.maxRedemptions > 0 &&
      promo.redemptionCount >= promo.maxRedemptions
    ) {
      return NextResponse.json(
        { valid: false, message: 'This promo code has reached its maximum redemption limit.' },
        { status: 400 }
      );
    }

    // Applicable plans check
    const isApplicable =
      promo.applicablePlans.includes('all') || promo.applicablePlans.includes(plan);

    if (!isApplicable) {
      return NextResponse.json(
        {
          valid: false,
          message: 'This promo code cannot be applied to the selected plan.',
        },
        { status: 400 }
      );
    }

    const plans = await getDynamicPlans();
    const planConfig = plans[plan as CheckoutPlanKey];
    const basePrice = planConfig?.priceUsd ?? 0;

    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (basePrice * promo.discountValue) / 100;
    } else {
      discountAmount = Math.min(promo.discountValue, basePrice);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalPrice = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      originalPrice: basePrice,
      discountAmount,
      finalPrice,
      description: promo.description || '',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, message: 'Please provide a valid promo code and plan.' },
        { status: 400 }
      );
    }
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to validate promo code.' },
      { status: 500 }
    );
  }
}
