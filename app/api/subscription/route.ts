import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getUserEntitlement } from '@/lib/entitlements';
import { PLANS, type CheckoutPlanKey } from '@/lib/payments';

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const entitlement = await getUserEntitlement(userId);
    const planDetail = PLANS[entitlement.plan as CheckoutPlanKey] || null;

    return {
      success: true,
      entitlement: {
        ...entitlement,
        planDetail,
      },
    };
  });
}
