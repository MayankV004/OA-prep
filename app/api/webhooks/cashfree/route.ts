import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { verifyCashfreeWebhookSignature } from '@/lib/payments/cashfree';
import { activateSubscription } from '@/lib/payments/fulfillment';
import { PLANS, type CheckoutPlanKey, type PaymentCurrency } from '@/lib/payments';
import { ProcessedWebhookEvent, Subscription } from '@/models';
import { recordActivity } from '@/lib/activity';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

function isDuplicateError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000);
}

function subscriptionTags(data: Record<string, any>) {
  return data.subscription_tags || data.subscription_details?.subscription_tags || data.subscription?.subscription_tags || {};
}

async function activateFromTags(params: {
  userId: string;
  plan: CheckoutPlanKey;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: PaymentCurrency;
  promoCode?: string;
}) {
  const subscription = await activateSubscription({ provider: 'cashfree', ...params });
  recordActivity({
    actorId: params.userId,
    targetUserId: params.userId,
    kind: 'subscription_upgraded',
    entity: { type: 'subscription', id: params.userId, title: PLANS[params.plan].name },
    metadata: {
      plan: params.plan,
      provider: 'cashfree',
      subscriptionId: params.subscriptionId,
      amount: params.amount,
      currency: params.currency,
    },
  });
  return subscription;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-webhook-signature');
  const timestamp = req.headers.get('x-webhook-timestamp');
  const rawBody = await req.text();

  if (!signature || !timestamp || !verifyCashfreeWebhookSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ error: 'Invalid Cashfree webhook signature' }, { status: 400 });
  }

  // Prevent replay attacks: Reject webhooks older than 10 minutes
  const rawTs = Number(timestamp);
  const tsMs = rawTs < 1e11 ? rawTs * 1000 : rawTs;
  if (!isNaN(tsMs) && Math.abs(Date.now() - tsMs) > 10 * 60 * 1000) {
    return NextResponse.json({ error: 'Webhook timestamp expired' }, { status: 400 });
  }

  let event: Record<string, any>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook JSON' }, { status: 400 });
  }

  await dbConnect();
  const eventId = crypto.createHash('sha256').update(rawBody).digest('hex');
  try {
    await ProcessedWebhookEvent.create({
      eventId,
      provider: 'cashfree',
      eventType: String(event.type || 'unknown'),
    });
  } catch (error) {
    if (isDuplicateError(error)) return NextResponse.json({ received: true, duplicate: true });
    console.error('Cashfree webhook idempotency record failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  try {
    const type = String(event.type || '');
    const data = (event.data || {}) as Record<string, any>;

    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const order = data.order || {};
      const payment = data.payment || {};
      const tags = order.order_tags || {};
      if (payment.payment_status === 'SUCCESS' && tags.userId && tags.plan) {
        await activateFromTags({
          userId: tags.userId,
          plan: tags.plan as CheckoutPlanKey,
          subscriptionId: String(order.order_id),
          customerId: String(tags.userId),
          amount: Number(tags.amount || order.order_amount || payment.payment_amount || 0),
          currency: (tags.currency || order.order_currency || 'INR') as PaymentCurrency,
          promoCode: tags.promoCode || undefined,
        });
      }
    } else if (type === 'SUBSCRIPTION_AUTH_STATUS' || type === 'SUBSCRIPTION_STATUS_CHANGED') {
      const tags = subscriptionTags(data);
      const status = String(
        data.subscription_status ||
        data.subscription?.subscription_status ||
        data.subscription_details?.subscription_status ||
        data.authorization?.auth_status ||
        ''
      ).toUpperCase();
      const merchantSubscriptionId = String(
        data.subscription_id ||
        data.subscription?.subscription_id ||
        data.subscription_details?.subscription_id ||
        ''
      );
      if (status === 'ACTIVE' && tags.userId && tags.plan) {
        await activateFromTags({
          userId: tags.userId,
          plan: tags.plan as CheckoutPlanKey,
          subscriptionId: merchantSubscriptionId,
          customerId: String(data.cf_subscription_id || data.subscription_details?.cf_subscription_id || ''),
          amount: Number(tags.amount || data.plan_details?.plan_recurring_amount || 0),
          currency: (tags.currency || data.plan_details?.plan_currency || 'INR') as PaymentCurrency,
          promoCode: tags.promoCode || undefined,
        });
      } else if (merchantSubscriptionId && ['CANCELLED', 'CUSTOMER_CANCELLED', 'EXPIRED', 'COMPLETED', 'ON_HOLD'].includes(status)) {
        await Subscription.findOneAndUpdate(
          { subscriptionId: merchantSubscriptionId },
          { $set: { status: status === 'ON_HOLD' ? 'past_due' : 'canceled', cancelAtPeriodEnd: true } }
        );
      }
    } else if (type === 'SUBSCRIPTION_PAYMENT_SUCCESS') {
      const merchantSubscriptionId = String(data.subscription_id || '');
      if (merchantSubscriptionId) {
        await Subscription.findOneAndUpdate(
          { subscriptionId: merchantSubscriptionId },
          { $set: { status: 'active', metadata: { lastPaymentId: data.cf_payment_id || data.payment_id, lastPaymentAt: event.event_time } } }
        );
      }
    } else if (type === 'SUBSCRIPTION_PAYMENT_FAILED') {
      const merchantSubscriptionId = String(data.subscription_id || '');
      if (merchantSubscriptionId) {
        await Subscription.findOneAndUpdate(
          { subscriptionId: merchantSubscriptionId },
          { $set: { status: 'past_due' } }
        );
      }
    } else if (type === 'SUBSCRIPTION_PAYMENT_CANCELLED') {
      const merchantSubscriptionId = String(data.subscription_id || '');
      if (merchantSubscriptionId) {
        await Subscription.findOneAndUpdate(
          { subscriptionId: merchantSubscriptionId },
          { $set: { status: 'canceled', cancelAtPeriodEnd: true } }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Cashfree webhook:', error);
    // Allow Cashfree to retry after a transient processing failure. The event
    // is only permanently deduplicated once its side effects complete.
    await ProcessedWebhookEvent.deleteOne({ eventId }).catch(() => undefined);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
