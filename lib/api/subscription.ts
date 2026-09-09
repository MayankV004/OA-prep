import { apiFetch } from './client';
import type { CheckoutPlanKey, PlanPricingDetail } from '@/lib/payments/types';
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
    isAdmin: boolean;
    planDetail: PlanPricingDetail | null;
  };
}

export const subscriptionApi = {
  getSubscription: () => apiFetch<SubscriptionDTO>('/api/subscription'),

  createCheckout: (plan: CheckoutPlanKey, promoCode?: string) =>
    apiFetch<{ success: boolean; url: string; provider: string }>('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, promoCode }),
    }),

  openBillingPortal: () =>
    apiFetch<{ success: boolean; url: string }>('/api/subscription/portal', {
      method: 'POST',
    }),

  verifySession: (sessionId: string) =>
    apiFetch<{ success: boolean; isPro: boolean; plan: string; message: string }>('/api/checkout/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }),
};
