import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getUserEntitlement } from '@/lib/entitlements';
import { cashfreeAdapter } from '@/lib/payments/cashfree';
import { Subscription } from '@/models/subscription';
import { recordActivity } from '@/lib/activity';

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const entitlement = await getUserEntitlement(userId);
    if (!entitlement.subscriptionId || entitlement.plan === 'oa_pass') {
      return { success: false, message: 'This plan does not have a recurring Cashfree subscription.' };
    }

    await cashfreeAdapter.cancelSubscription({ subscriptionId: entitlement.subscriptionId });
    await Subscription.findOneAndUpdate(
      { subscriptionId: entitlement.subscriptionId },
      { $set: { cancelAtPeriodEnd: true } }
    );

    recordActivity({
      actorId: userId,
      targetUserId: userId,
      kind: 'subscription_canceled',
      entity: { type: 'subscription', id: userId, title: entitlement.plan },
      metadata: { provider: 'cashfree', subscriptionId: entitlement.subscriptionId },
    });

    return { success: true, message: 'Subscription cancellation requested. Access remains active until the current period ends.' };
  });
}
