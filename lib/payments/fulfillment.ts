import mongoose from 'mongoose';
import { Subscription, type PaymentProvider, type PlanType } from '@/models/subscription';
import { PromoCode } from '@/models/promoCode';
import { PLANS, type CheckoutPlanKey, type PaymentCurrency } from './types';

export function resolveUserObjectId(userId: string) {
  return mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
}

export function getPlanPeriodEnd(plan: CheckoutPlanKey, now = new Date()) {
  const days = plan === 'pro_annual' ? 365 : plan === 'oa_pass' ? 75 : 30;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function activateSubscription(params: {
  userId: string;
  plan: CheckoutPlanKey;
  provider: PaymentProvider;
  customerId: string;
  subscriptionId: string;
  amount: number;
  currency: PaymentCurrency;
  promoCode?: string;
}) {
  const now = new Date();
  const targetId = resolveUserObjectId(params.userId);
  const planConfig = PLANS[params.plan];
  const existing = await Subscription.findOne({
    userId: targetId,
    provider: params.provider,
    subscriptionId: params.subscriptionId,
  }).lean();

  const setFields: Record<string, unknown> = {
    userId: targetId,
    plan: params.plan as PlanType,
    status: 'active',
    provider: params.provider,
    customerId: params.customerId,
    subscriptionId: params.subscriptionId,
    aiCreditsQuota: planConfig.aiCredits,
    metadata: {
      paidAmount: params.amount,
      currency: params.currency,
      promoCode: params.promoCode || null,
    },
  };

  // Multiple Cashfree lifecycle events can confirm the same mandate. Do not
  // extend the entitlement period or reset usage on a repeated confirmation.
  if (!existing) {
    setFields.currentPeriodStart = now;
    setFields.currentPeriodEnd = getPlanPeriodEnd(params.plan, now);
    setFields.cancelAtPeriodEnd = false;

    if (params.promoCode && params.promoCode.trim()) {
      await PromoCode.updateOne(
        { code: params.promoCode.trim().toUpperCase() },
        { $inc: { redemptionCount: 1 } }
      ).catch(() => undefined);
    }
  }

  return Subscription.findOneAndUpdate(
    { userId: targetId },
    {
      $set: setFields,
      $setOnInsert: {
        aiCreditsUsed: 0,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
}
