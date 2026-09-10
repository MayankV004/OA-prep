import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Subscription } from '@/models/subscription';
import { recordActivity } from '@/lib/activity';
import { PLANS, type CheckoutPlanKey } from '@/lib/payments';
import { auth } from '@/lib/auth';
import { env } from '@/lib/config';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  // SEC-01 Fix: Disallow mock confirmation in production unless explicitly opted into mock provider
  if (process.env.NODE_ENV === 'production' && env.PAYMENT_PROVIDER !== 'mock') {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Mock payment confirmation is disabled in production.' } },
      { status: 404 }
    );
  }

  // Verify authentication: Ensure caller is logged in and can only confirm for themselves
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/sign-in?redirectTo=/pricing', req.url));
  }

  const { searchParams } = new URL(req.url);
  const plan = searchParams.get('plan') as CheckoutPlanKey | null;
  const targetUserId = searchParams.get('userId');
  const returnTo = searchParams.get('returnTo') || '/dashboard?payment=success';

  if (!plan || !targetUserId || !PLANS[plan]) {
    return NextResponse.redirect(new URL('/pricing?error=invalid_mock_request', req.url));
  }

  // Prevent IDOR: targetUserId must match session user
  if (session.user.id !== targetUserId) {
    return NextResponse.redirect(new URL('/pricing?error=unauthorized_checkout_user', req.url));
  }

  const userId = session.user.id;

  await dbConnect();

  // Determine period duration
  const now = new Date();
  let periodEnd: Date;
  let credits = 100;

  if (plan === 'pro_annual') {
    periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    credits = 1500;
  } else if (plan === 'oa_pass') {
    periodEnd = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000);
    credits = 250;
  } else {
    // pro_monthly
    periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    credits = 100;
  }

  const promoCode = searchParams.get('promoCode');
  const discountedPriceParam = searchParams.get('discountedPriceUsd');
  const paidPriceUsd = discountedPriceParam !== null ? Number(discountedPriceParam) : PLANS[plan].priceUsd;

  if (promoCode) {
    const { PromoCode } = await import('@/models/promoCode');
    await PromoCode.findOneAndUpdate(
      { code: promoCode.trim().toUpperCase() },
      { $inc: { redemptionCount: 1 } }
    );
  }

  const targetObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

  await Subscription.findOneAndUpdate(
    { userId: targetObjectId },
    {
      $set: {
        userId: targetObjectId,
        plan,
        status: 'active',
        provider: 'mock',
        customerId: `mock_cus_${userId}`,
        subscriptionId: `mock_sub_${Date.now()}`,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        aiCreditsQuota: credits,
        aiCreditsUsed: 0,
        metadata: {
          promoCode: promoCode || null,
          paidPriceUsd,
          originalPriceUsd: PLANS[plan].priceUsd,
        },
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  recordActivity({
    actorId: userId,
    targetUserId: userId,
    kind: 'subscription_upgraded',
    entity: {
      type: 'subscription',
      id: userId,
      title: PLANS[plan].name,
    },
    metadata: {
      plan,
      provider: 'mock',
      priceUsd: paidPriceUsd,
      promoCode: promoCode || null,
    },
  });

  return NextResponse.redirect(new URL(returnTo, req.url));
}
