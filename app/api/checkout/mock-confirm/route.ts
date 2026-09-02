import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Subscription } from '@/models/subscription';
import { recordActivity } from '@/lib/activity';
import { PLANS, type CheckoutPlanKey } from '@/lib/payments';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get('plan') as CheckoutPlanKey | null;
  const userId = searchParams.get('userId');
  const returnTo = searchParams.get('returnTo') || '/dashboard?payment=success';

  if (!plan || !userId || !PLANS[plan]) {
    return NextResponse.redirect(new URL('/pricing?error=invalid_mock_request', req.url));
  }

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
      priceUsd: PLANS[plan].priceUsd,
    },
  });

  return NextResponse.redirect(new URL(returnTo, req.url));
}
