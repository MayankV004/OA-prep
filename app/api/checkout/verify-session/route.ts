import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { cashfreeAdapter } from '@/lib/payments/cashfree';
import { PLANS, type CheckoutPlanKey, type PaymentCurrency } from '@/lib/payments';
import { activateSubscription } from '@/lib/payments/fulfillment';
import { recordActivity } from '@/lib/activity';
import { z } from 'zod';

const verifySchema = z.object({
  orderId: z.string().min(1).optional(),
  subscriptionId: z.string().min(1).optional(),
  plan: z.enum(['pro_monthly', 'pro_annual', 'oa_pass']).optional(),
}).refine((value) => Boolean(value.orderId || value.subscriptionId), {
  message: 'Cashfree orderId or subscriptionId is required',
});

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const body = verifySchema.parse(await req.json());

    if (body.orderId) {
      const order = await cashfreeAdapter.getOrder(body.orderId);
      const tags = order.order_tags || {};
      if (tags.userId !== userId || order.order_status !== 'PAID') {
        return { success: false, isPro: false, message: 'Cashfree order has not been paid.' };
      }

      const plan = (tags.plan || body.plan || 'oa_pass') as CheckoutPlanKey;
      const currency = (tags.currency || order.order_currency || 'INR') as PaymentCurrency;
      const subscription = await activateSubscription({
        userId,
        plan,
        provider: 'cashfree',
        customerId: tags.userId,
        subscriptionId: order.order_id,
        amount: Number(tags.amount || order.order_amount),
        currency,
        promoCode: tags.promoCode || undefined,
      });

      recordActivity({
        actorId: userId,
        targetUserId: userId,
        kind: 'subscription_upgraded',
        entity: { type: 'subscription', id: userId, title: PLANS[plan].name },
        metadata: { plan, provider: 'cashfree', orderId: order.order_id, amount: order.order_amount, currency },
      });

      return { success: true, isPro: true, plan: subscription?.plan, status: subscription?.status, message: 'Payment successfully verified!' };
    }

    const subscriptionId = body.subscriptionId as string;
    const cashfreeSubscription = await cashfreeAdapter.getSubscription(subscriptionId);
    const tags = cashfreeSubscription.subscription_tags || {};
    if (tags.userId !== userId || cashfreeSubscription.subscription_status !== 'ACTIVE') {
      return { success: false, isPro: false, message: 'Cashfree subscription is not active yet.' };
    }

    const plan = (tags.plan || body.plan || 'pro_monthly') as CheckoutPlanKey;
    const currency = (tags.currency || cashfreeSubscription.plan_details?.plan_currency || 'INR') as PaymentCurrency;
    const subscription = await activateSubscription({
      userId,
      plan,
      provider: 'cashfree',
      customerId: String(cashfreeSubscription.cf_subscription_id),
      subscriptionId: cashfreeSubscription.subscription_id,
      amount: Number(tags.amount || cashfreeSubscription.plan_details?.plan_recurring_amount || 0),
      currency,
      promoCode: tags.promoCode || undefined,
    });

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'subscription_upgraded',
      entity: { type: 'subscription', id: userId, title: PLANS[plan].name },
      metadata: { plan, provider: 'cashfree', subscriptionId, currency },
    });

    return { success: true, isPro: true, plan: subscription?.plan, status: subscription?.status, message: 'Subscription successfully verified!' };
  });
}
