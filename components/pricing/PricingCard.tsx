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
      className={`relative flex flex-col justify-between rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-xl ${
        isPopular
          ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/[0.07] via-background to-background shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
          : 'border-border/60 bg-card/50 backdrop-blur-xs hover:border-border'
      }`}
    >
      {/* Top badges */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
            <Sparkles className="h-3 w-3 fill-white/20" />
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
          <p className="mt-1 text-xs font-medium text-emerald-500">
            Equivalent to only ~$7.40/month
          </p>
        )}

        <hr className="my-6 border-border/50" />

        {/* Feature List */}
        <ul className="space-y-3 text-sm text-muted-foreground">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span className="text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action CTA */}
      <div className="mt-8 pt-4">
        {isCurrentPlan ? (
          <Button
            variant="outline"
            disabled
            className="w-full border-emerald-500/30 text-emerald-500 font-semibold"
          >
            Current Plan
          </Button>
        ) : (
          <Button
            onClick={() => onSelect(plan.id)}
            disabled={isLoading}
            className={`w-full font-semibold transition-all duration-200 ${
              isPopular
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
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
