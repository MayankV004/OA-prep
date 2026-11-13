import { apiFetch } from './client';
import type { CheckoutPlanKey, PaymentCurrency, PlanPricingDetail } from '@/lib/payments/types';
import type { PlanType, SubscriptionStatus } from '@/models/subscription';

export interface SubscriptionDTO {
  success: boolean;
  entitlement: {
    isPro: boolean;
    plan: PlanType;
    status: SubscriptionStatus;
    expiresAt: string | null;
    cancelAtPeriodEnd: boolean;
    aiCreditsQuota: number;
    aiCreditsUsed: number;
    aiCreditsRemaining: number;
    customerId?: string;
    subscriptionId?: string;
    isAdmin: boolean;
    planDetail: PlanPricingDetail | null;
  };
}

export const subscriptionApi = {
  getSubscription: () => apiFetch<SubscriptionDTO>('/api/subscription'),

  createCheckout: (plan: CheckoutPlanKey, currency: PaymentCurrency, promoCode?: string) =>
    apiFetch<{ success: boolean; url: string; provider: string; sessionId?: string; sessionType?: 'order' | 'subscription' }>('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, currency, promoCode }),
    }),

  cancelSubscription: () =>
    apiFetch<{ success: boolean; message: string }>('/api/subscription/cancel', {
      method: 'POST',
    }),

  verifySession: (params: { orderId?: string; subscriptionId?: string; plan?: CheckoutPlanKey }) =>
    apiFetch<{ success: boolean; isPro: boolean; plan: string; message: string }>('/api/checkout/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),
};
