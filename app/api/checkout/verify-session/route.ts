import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { stripeAdapter } from '@/lib/payments/stripe';
import { PLANS, type CheckoutPlanKey } from '@/lib/payments';
import dbConnect from '@/lib/db';
import { Subscription } from '@/models/subscription';
import { recordActivity } from '@/lib/activity';
import mongoose from 'mongoose';
import { z } from 'zod';

const verifySchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const body = await req.json();
    const { sessionId } = verifySchema.parse(body);

    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) throw { status: 500, message: 'Database connection failed' };

    // Retrieve session directly from Stripe
    const session = await stripeAdapter.retrieveCheckoutSession(sessionId);

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return {
        success: false,
        isPro: false,
        message: 'Payment has not been completed yet.',
      };
    }

    const sessionUserId = session.client_reference_id || session.metadata?.userId || userId;
    const plan = ((session.metadata?.plan as CheckoutPlanKey) || 'pro_monthly') as CheckoutPlanKey;
    const planConfig = PLANS[plan] || PLANS.pro_monthly;

    const idQueries: any[] = [{ _id: sessionUserId }];
    if (mongoose.Types.ObjectId.isValid(sessionUserId)) {
      idQueries.push({ _id: new mongoose.Types.ObjectId(sessionUserId) });
    }
    idQueries.push({ id: sessionUserId });

    const userDoc: any = await db.collection('user').findOne({ $or: idQueries });
    const targetId = userDoc?._id || (mongoose.Types.ObjectId.isValid(sessionUserId) ? new mongoose.Types.ObjectId(sessionUserId) : sessionUserId);

    const now = new Date();
    let periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (plan === 'pro_annual') {
      periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else if (plan === 'oa_pass') {
      periodEnd = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000);
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || '';
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.id;

    const sub = await Subscription.findOneAndUpdate(
      { userId: targetId },
      {
        $set: {
          userId: targetId,
          plan,
          status: 'active',
          provider: 'stripe',
          customerId,
          subscriptionId,
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
      actorId: targetId.toString(),
      targetUserId: targetId.toString(),
      kind: 'subscription_upgraded',
      entity: {
        type: 'subscription',
        id: targetId.toString(),
        title: planConfig.name,
      },
      metadata: {
        plan,
        provider: 'stripe',
        amountTotal: session.amount_total ? session.amount_total / 100 : planConfig.priceUsd,
      },
    });

    return {
      success: true,
      isPro: true,
      plan: sub.plan,
      status: sub.status,
      message: 'Subscription successfully activated!',
    };
  });
}
