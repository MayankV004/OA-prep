'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription';
import type { CheckoutPlanKey } from '@/lib/payments/types';

import { toast } from 'sonner';

export function useSubscription() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getSubscription,
    staleTime: 60 * 1000, // 1 minute
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ plan, promoCode }: { plan: CheckoutPlanKey; promoCode?: string }) =>
      subscriptionApi.createCheckout(plan, promoCode),
    onSuccess: (res) => {
      if (res.url) {
        toast.loading('Redirecting to secure Stripe checkout...', { duration: 2500 });
        window.location.href = res.url;
      }
    },
    onError: (err: any) => {
      toast.error('Checkout failed', {
        description: err.message || 'Unable to start checkout. Please try again.',
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => subscriptionApi.openBillingPortal(),
    onSuccess: (res) => {
      if (res.url) {
        toast.loading('Opening customer billing portal...', { duration: 2500 });
        window.location.href = res.url;
      }
    },
    onError: (err: any) => {
      toast.error('Unable to open billing portal', {
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
    checkout: (plan: CheckoutPlanKey, promoCode?: string) =>
      checkoutMutation.mutate({ plan, promoCode }),
    isCheckingOut: checkoutMutation.isPending,
    openPortal: portalMutation.mutate,
    isOpeningPortal: portalMutation.isPending,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  };
}
