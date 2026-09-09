import { env } from '@/lib/config';
import {
  PLANS,
  type CreateCheckoutParams,
  type CheckoutResult,
  type CustomerPortalParams,
  type PaymentProviderAdapter,
} from './types';

export class MockPaymentAdapter implements PaymentProviderAdapter {
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const planConfig = PLANS[params.plan];
    if (!planConfig) {
      throw new Error(`Invalid plan: ${params.plan}`);
    }

    // Direct user to our internal mock confirmation endpoint to simulate instant gateway payment
    const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let mockConfirmUrl = `${appUrl}/api/checkout/mock-confirm?plan=${params.plan}&userId=${params.userId}&returnTo=${encodeURIComponent(
      params.successUrl
    )}`;

    if (params.promoCode) {
      mockConfirmUrl += `&promoCode=${encodeURIComponent(params.promoCode)}`;
    }
    if (params.discountedPriceUsd !== undefined) {
      mockConfirmUrl += `&discountedPriceUsd=${params.discountedPriceUsd}`;
    }

    return {
      url: mockConfirmUrl,
      provider: 'mock',
      sessionId: `mock_sess_${Date.now()}`,
    };
  }

  async createPortalSession(params: CustomerPortalParams): Promise<{ url: string }> {
    // Redirect to subscription or pricing page in mock mode
    return {
      url: `${params.returnUrl}?status=portal_mock`,
    };
  }
}

export const mockPaymentAdapter = new MockPaymentAdapter();
