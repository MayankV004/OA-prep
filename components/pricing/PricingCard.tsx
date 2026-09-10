'use client';

import React from 'react';
import { Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PlanPricingDetail, CheckoutPlanKey } from '@/lib/payments/types';

interface PricingCardProps {
  plan: PlanPricingDetail;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  discountedPrice?: number;
  promoCodeLabel?: string;
  onSelect: (planId: CheckoutPlanKey) => void;
}

export function PricingCard({
  plan,
  isPopular = false,
  isCurrentPlan = false,
  isLoading = false,
  discountedPrice,
  promoCodeLabel,
  onSelect,
}: PricingCardProps) {
  const isOneTime = plan.period === '75_days';
  const hasDiscount = discountedPrice !== undefined && discountedPrice < plan.priceUsd;

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 backdrop-blur-2xl shadow-e2 group',
        isPopular
          ? 'border-2 border-emerald-500/80 dark:border-emerald-500/60 bg-card/90 dark:bg-surface-elevated/80 shadow-[0_0_40px_rgba(16,185,129,0.16)] ring-1 ring-emerald-500/30 hover:shadow-[0_0_50px_rgba(16,185,129,0.25)] hover:-translate-y-1'
          : 'border border-border/80 bg-card/60 dark:bg-card/40 hover:border-emerald-500/40 hover:shadow-e4 hover:-translate-y-1'
      )}
    >
      {/* Specular Edge Top Light */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent rounded-t-3xl',
          isPopular
            ? 'via-emerald-400 opacity-80'
            : 'via-white/20 dark:via-white/10 opacity-60'
        )}
      />

      {/* Top badges */}
      {promoCodeLabel ? (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1 text-2xs font-mono font-black text-black ring-4 ring-background shadow-lg uppercase tracking-wider whitespace-nowrap">
            <Sparkles className="size-3 fill-black text-black" />
            {promoCodeLabel} APPLIED
          </span>
        </div>
      ) : plan.badge ? (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-2xs font-mono font-black ring-4 ring-background shadow-lg uppercase tracking-wider whitespace-nowrap',
              isPopular
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 shadow-emerald-500/25'
                : 'bg-zinc-800 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-700/80 shadow-md'
            )}
          >
            {plan.badge}
          </span>
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-black tracking-tight text-foreground">
            {plan.name}
          </h3>
        </div>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground min-h-[40px] leading-relaxed">
          {plan.description}
        </p>

        {/* Pricing display */}
        <div className="mt-6 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-4xl sm:text-5xl font-display font-black tracking-tight text-emerald-500">
                ${discountedPrice}
              </span>
              <span className="text-lg line-through text-muted-foreground font-semibold">
                ${plan.priceUsd}
              </span>
            </>
          ) : (
            <span className="text-4xl sm:text-5xl font-display font-black tracking-tight text-foreground">
              ${plan.priceUsd}
            </span>
          )}
          <span className="text-xs sm:text-sm font-medium text-muted-foreground font-mono">
            {isOneTime ? '/ 75-day pass' : plan.period === 'year' ? '/ year' : '/ month'}
          </span>
        </div>

        {plan.period === 'year' && !hasDiscount && (
          <p className="mt-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            Equivalent to only ~$7.40 / month
          </p>
        )}

        {/* Feature list */}
        <div className="mt-8 space-y-3.5 border-t border-border/60 pt-6">
          <p className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Included Capabilities
          </p>
          <ul className="space-y-3 text-xs sm:text-sm">
            {plan.features
              .filter((feature) => !/credit/i.test(feature))
              .map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="size-4.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 grid place-items-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span className="text-foreground/90 font-normal leading-snug">{feature}</span>
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
            className="w-full h-11 rounded-xl border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-bold"
          >
            Current Active Plan
          </Button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(plan.id)}
            disabled={isLoading}
            className={cn(
              'w-full h-11 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2',
              isPopular
                ? 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_0_20px_rgba(16,185,129,0.3)] border-t border-white/20'
                : 'bg-surface-elevated hover:bg-muted text-foreground border border-border/80 shadow-2xs'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Redirecting to Checkout...</span>
              </>
            ) : (
              <>
                <span>{isOneTime ? 'Get OA Season Pass' : 'Upgrade to Pro'}</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
