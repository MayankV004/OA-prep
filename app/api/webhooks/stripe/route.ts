import { NextRequest, NextResponse } from 'next/server';
import { stripeAdapter } from '@/lib/payments/stripe';
import { PLANS, type CheckoutPlanKey } from '@/lib/payments';
import dbConnect from '@/lib/db';
import { Subscription } from '@/models/subscription';
import { recordActivity } from '@/lib/activity';
import mongoose from 'mongoose';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripeAdapter.constructWebhookEvent(rawBody, signature);
  } catch (err: any) {
    console.error('Stripe webhook verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await dbConnect();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = (session.metadata?.plan as CheckoutPlanKey) || 'pro_monthly';

        if (userId) {
          const targetObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
          const planConfig = PLANS[plan] || PLANS.pro_monthly;

          const now = new Date();
          let periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (plan === 'pro_annual') {
            periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          } else if (plan === 'oa_pass') {
            periodEnd = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000);
          }

          await Subscription.findOneAndUpdate(
            { userId: targetObjectId },
            {
              $set: {
                userId: targetObjectId,
                plan,
                status: 'active',
                provider: 'stripe',
                customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || '',
                subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.id,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
                aiCreditsQuota: planConfig.aiCredits,
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
              title: planConfig.name,
            },
            metadata: {
              plan,
              provider: 'stripe',
              amountTotal: session.amount_total ? session.amount_total / 100 : planConfig.priceUsd,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

        // Sync subscription status & dates
        const currentPeriodEnd = (sub as any).current_period_end
          ? new Date((sub as any).current_period_end * 1000)
          : new Date();

        await Subscription.findOneAndUpdate(
          { customerId },
          {
            $set: {
              status: sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : 'canceled',
              subscriptionId: sub.id,
              currentPeriodEnd,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

        await Subscription.findOneAndUpdate(
          { customerId },
          {
            $set: {
              status: 'canceled',
              cancelAtPeriodEnd: true,
            },
          }
        );
        break;
      }

      default:
        // Ignore unhandled event types cleanly
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing Stripe webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
