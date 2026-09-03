'use client';

import React from 'react';
import { Check, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlanPricingDetail, CheckoutPlanKey } from '@/lib/payments/types';

interface PricingCardProps {
  plan: PlanPricingDetail;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  onSelect: (planId: CheckoutPlanKey) => void;
}

export function PricingCard({
  plan,
  isPopular = false,
  isCurrentPlan = false,
  isLoading = false,
  onSelect,
}: PricingCardProps) {
  const isOneTime = plan.period === '75_days';

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-6 sm:p-8 transition-all duration-200 ${
        isPopular
          ? 'border-2 border-primary bg-card shadow-lg ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-border/80'
      }`}
    >
      {/* Top badges */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground shadow-xs">
            <Sparkles className="h-3 w-3" />
            {plan.badge}
          </span>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{plan.name}</h3>
        </div>

        <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>

        {/* Pricing tag */}
        <div className="mt-6 flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold tracking-tight text-foreground">${plan.priceUsd}</span>
          <span className="text-sm font-medium text-muted-foreground">
            {isOneTime ? '/ one-time' : plan.period === 'year' ? '/ year' : '/ month'}
          </span>
        </div>

        {plan.period === 'year' && (
          <p className="mt-1 text-xs font-semibold text-primary">
            Equivalent to only ~$7.40/month
          </p>
        )}

        {/* Feature list */}
        <div className="mt-8 space-y-3 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Included features</p>
          <ul className="space-y-2.5 text-sm">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span className="text-foreground/90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-4">
        {isCurrentPlan ? (
          <Button
            variant="outline"
            disabled
            className="w-full border-primary/40 text-primary bg-primary/10 font-bold"
          >
            Current Plan
          </Button>
        ) : (
          <Button
            onClick={() => onSelect(plan.id)}
            disabled={isLoading}
            className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span>{isOneTime ? 'Get Season Pass' : 'Upgrade to Pro'}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
