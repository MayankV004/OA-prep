import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getUserEntitlement } from '@/lib/entitlements';
import { getPaymentAdapter } from '@/lib/payments';
import { env } from '@/lib/config';

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const entitlement = await getUserEntitlement(userId);

    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/profile`;

    if (!entitlement.customerId) {
      return {
        success: false,
        message: 'No active billing customer found. Upgrade to Pro first.',
        url: `${appUrl}/pricing`,
      };
    }

    const adapter = getPaymentAdapter();
    const result = await adapter.createPortalSession({
      customerId: entitlement.customerId,
      returnUrl,
    });

    return {
      success: true,
      url: result.url,
    };
  });
}
