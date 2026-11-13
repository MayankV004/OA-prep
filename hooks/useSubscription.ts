'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription';
import type { CheckoutPlanKey } from '@/lib/payments/types';

import { toast } from 'sonner';
import type { PaymentCurrency } from '@/lib/payments/types';

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget: '_self' | '_blank' }) => Promise<{ error?: { message?: string } } | void>;
      subscriptionsCheckout: (options: { subsSessionId: string; redirectTarget: '_self' | '_blank' }) => Promise<{ error?: { message?: string } } | void>;
    };
  }
}

async function loadCashfreeSdk() {
  if (window.Cashfree) return window.Cashfree;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-cashfree-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Cashfree checkout')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.dataset.cashfreeSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Cashfree checkout'));
    document.head.appendChild(script);
  });
  return window.Cashfree;
}

export function useSubscription() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    staleTime: 60 * 1000, // 1 minute
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ plan, currency, promoCode }: { plan: CheckoutPlanKey; currency: PaymentCurrency; promoCode?: string }) => {
      const res = await subscriptionApi.createCheckout(plan, currency, promoCode);
      if (res.provider === 'mock' && res.url) {
        return res;
      }
      if (!res.sessionId || !res.sessionType) throw new Error('Cashfree checkout session was not returned');
      toast.loading('Redirecting to secure Cashfree checkout...', { duration: 2500 });
      const Cashfree = await loadCashfreeSdk();
      if (!Cashfree) throw new Error('Cashfree checkout is unavailable');
      const cashfree = Cashfree({
        mode: (process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
      });
      const result = res.sessionType === 'subscription'
        ? await cashfree.subscriptionsCheckout({ subsSessionId: res.sessionId, redirectTarget: '_self' })
        : await cashfree.checkout({ paymentSessionId: res.sessionId, redirectTarget: '_self' });
      if (result?.error?.message) throw new Error(result.error.message);
      return res;
    },
    onSuccess: (res) => {
      if (res.provider === 'mock' && res.url) {
        window.location.href = res.url;
      }
    },
    onError: (err: any) => {
      toast.error('Checkout failed', {
        description: err.message || 'Unable to start checkout. Please try again.',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionApi.cancelSubscription(),
    onSuccess: (res) => {
      toast.success(res.message || 'Subscription cancellation requested');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (err: any) => {
      toast.error('Unable to cancel subscription', {
        description: err.message || 'Please try again later.',
      });
    },
  });

  const entitlement = data?.entitlement;

  return {
    isLoading,
    error,
    subscription: entitlement,
    isPro: Boolean(entitlement?.isPro),
    plan: entitlement?.plan || 'free',
    status: entitlement?.status || 'active',
    expiresAt: entitlement?.expiresAt ? new Date(entitlement.expiresAt) : null,
    aiCreditsRemaining: entitlement?.aiCreditsRemaining ?? 10,
    checkout: (plan: CheckoutPlanKey, currency: PaymentCurrency, promoCode?: string) =>
      checkoutMutation.mutate({ plan, currency, promoCode }),
    isCheckingOut: checkoutMutation.isPending,
    cancelSubscription: cancelMutation.mutate,
    isCancelingSubscription: cancelMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  };
}
