'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Check,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Percent,
  Tag,
  X,
  Loader2,
  Sparkles,
  Zap,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PricingCard } from '@/components/pricing/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS, type CheckoutPlanKey, type PlanPricingDetail } from '@/lib/payments/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ValidatedPromo {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  description?: string;
}

function PricingContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const canceled = searchParams.get('canceled');

  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const { plan: currentPlan, isPro, checkout, isCheckingOut, openPortal, isOpeningPortal } = useSubscription();

  // Dynamic pricing fetch
  const { data: pricingData } = useQuery<{ success: boolean; plans: Record<CheckoutPlanKey, PlanPricingDetail> }>({
    queryKey: ['pricing'],
    queryFn: async () => {
      const res = await fetch('/api/pricing');
      if (!res.ok) return { success: false, plans: PLANS };
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const currentPlans = pricingData?.plans || PLANS;

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromo | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isPromoInputOpen, setIsPromoInputOpen] = useState(false);

  const activeProPlan = billingInterval === 'annual' ? currentPlans.pro_annual : currentPlans.pro_monthly;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoInput.trim().toUpperCase(),
          plan: activeProPlan.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.message || 'Invalid promo code');
        return;
      }

      setAppliedPromo(data);
      toast.success(`Promo code ${data.code} applied! Saved $${data.discountAmount}`);
    } catch (err: any) {
      toast.error('Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    toast.info('Promo code removed');
  };

  const handleSelectPlan = (planKey: CheckoutPlanKey) => {
    checkout(planKey, appliedPromo?.code);
  };

  // Compute promo discounts per plan
  const getPlanDiscountedPrice = (plan: PlanPricingDetail) => {
    if (!appliedPromo) return undefined;
    if (appliedPromo.discountType === 'percentage') {
      const discount = (plan.priceUsd * appliedPromo.discountValue) / 100;
      return Math.max(0, Math.round((plan.priceUsd - discount) * 100) / 100);
    }
    return Math.max(0, Math.round((plan.priceUsd - appliedPromo.discountValue) * 100) / 100);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative selection:bg-primary/20 selection:text-primary">
      {/* Specular Emerald Top Beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Ambient Aurora Glow */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-amber-500/5 to-transparent blur-3xl opacity-60 dark:opacity-40" />

      {/* Alert banners */}
      {paymentStatus === 'success' && (
        <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-6 text-center backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-2">
            <Check className="h-5 w-5 stroke-[3]" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Welcome to BigO Pro! ⚡</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your subscription is active. All premium company mock OAs, AI edge-case diagnostics, and full curricula are unlocked.
          </p>
        </div>
      )}

      {canceled && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-muted-foreground">
          Checkout was canceled. No charges were made. You can upgrade whenever you are ready.
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground">
          Invest in Your Next{' '}
          <span className="text-primary">
            Tech Offer
          </span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Simulate real-world company OAs under proctoring, diagnose failing hidden testcases with AI, and master high-frequency placement patterns.
        </p>

        {/* Billing Interval Switcher */}
        <div className="pt-4 flex flex-col items-center justify-center gap-4">
          <div className="relative inline-flex items-center p-1 rounded-full border border-border/80 bg-surface-sunken/80 dark:bg-surface-sunken/40 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={cn(
                'relative z-10 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer',
                billingInterval === 'monthly'
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {billingInterval === 'monthly' && (
                <motion.span
                  layoutId="billing-interval-pill"
                  className="absolute inset-0 rounded-full bg-card shadow-xs border border-border/60"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">Monthly Billing</span>
            </button>

            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={cn(
                'relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer',
                billingInterval === 'annual'
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {billingInterval === 'annual' && (
                <motion.span
                  layoutId="billing-interval-pill"
                  className="absolute inset-0 rounded-full bg-card shadow-xs border border-border/60"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">Annual Billing</span>
              <span className="relative z-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Save 47%
              </span>
            </button>
          </div>

          {/* Promo Code Drawer */}
          <div className="flex flex-col items-center justify-center">
            {appliedPromo ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                <Percent className="size-3.5 text-emerald-500" />
                <span>
                  Coupon <strong className="font-mono">{appliedPromo.code}</strong> applied ({appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% OFF` : `$${appliedPromo.discountValue} OFF`})
                </span>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="ml-1 rounded-full p-0.5 hover:bg-emerald-500/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Remove promo code"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : isPromoInputOpen ? (
              <form onSubmit={handleApplyPromo} className="flex items-center gap-2 max-w-xs w-full animate-in fade-in">
                <Input
                  placeholder="ENTER PROMO CODE"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="font-mono text-xs uppercase h-9 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border-border/70"
                  required
                />
                <button
                  type="submit"
                  disabled={isValidatingPromo || !promoInput.trim()}
                  className="h-9 px-4 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  {isValidatingPromo ? <Loader2 className="size-3 animate-spin" /> : 'Apply'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPromoInputOpen(false)}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsPromoInputOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-500 font-medium transition-colors cursor-pointer"
              >
                <Tag className="size-3 text-amber-500" />
                <span>Have a college campus or promotional code?</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-12 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Card 1: Free Plan */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/60 dark:bg-card/30 p-6 sm:p-8 backdrop-blur-2xl shadow-e2 overflow-hidden hover:border-border transition-all">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          
          <div>
            <h3 className="text-xl font-display font-black tracking-tight text-foreground">
              Free Starter
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground min-h-[40px] leading-relaxed">
              Foundational problem patterns and conceptual roadmaps for self-paced study.
            </p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-display font-black tracking-tight text-foreground">
                $0
              </span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground font-mono">
                / forever free
              </span>
            </div>

            <div className="mt-8 space-y-3.5 border-t border-border/60 pt-6">
              <p className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Included Capabilities
              </p>
              <ul className="space-y-3 text-xs sm:text-sm">
                {[
                  '14+ Core DSA pattern trackers',
                  'LeetCode-style activity heatmap',
                  'Interview revision flashcard decks',
                  'Competitive programming radar',
                  'In-browser code runner & testbench',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="size-4.5 rounded-full bg-muted text-muted-foreground border border-border/60 grid place-items-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span className="text-foreground/80 font-normal leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <Button
              variant="outline"
              disabled
              className="w-full h-11 rounded-xl border-border/80 text-muted-foreground font-semibold"
            >
              {currentPlan === 'free' ? 'Your Current Active Tier' : 'Free Tier'}
            </Button>
          </div>
        </div>

        {/* Card 2: Pro Plan (Monthly or Annual) */}
        <PricingCard
          plan={activeProPlan}
          isPopular={true}
          isCurrentPlan={isPro && (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual')}
          isLoading={isCheckingOut}
          discountedPrice={getPlanDiscountedPrice(activeProPlan)}
          promoCodeLabel={appliedPromo?.code}
          onSelect={handleSelectPlan}
        />

        {/* Card 3: OA Season Pass */}
        <PricingCard
          plan={currentPlans.oa_pass}
          isPopular={false}
          isCurrentPlan={currentPlan === 'oa_pass'}
          isLoading={isCheckingOut}
          discountedPrice={getPlanDiscountedPrice(currentPlans.oa_pass)}
          promoCodeLabel={appliedPromo?.code}
          onSelect={handleSelectPlan}
        />
      </div>

      {/* Customer Portal Link for existing subscribers */}
      {isPro && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => openPortal()}
            disabled={isOpeningPortal}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer"
          >
            Manage subscription, update payment method, or cancel anytime
          </button>
        </div>
      )}

      {/* Trust & Guarantee Badges */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-3xl border border-border/80 bg-card/60 dark:bg-card/30 backdrop-blur-xl p-7 text-center shadow-e2">
        <div className="flex flex-col items-center space-y-2">
          <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 grid place-items-center shadow-2xs">
            <ShieldCheck className="size-5" />
          </div>
          <h4 className="text-sm font-display font-bold text-foreground">Secure Stripe Checkout</h4>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Bank-level 256-bit encryption. Card credentials never touch our servers.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 grid place-items-center shadow-2xs">
            <Zap className="size-5" />
          </div>
          <h4 className="text-sm font-display font-bold text-foreground">Instant Activation</h4>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Assessments, simulator environments, and AI debugging unlock immediately upon checkout.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 grid place-items-center shadow-2xs">
            <HeartHandshake className="size-5" />
          </div>
          <h4 className="text-sm font-display font-bold text-foreground">Cancel Anytime</h4>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            One-click self-service cancellation from your settings with zero friction.
          </p>
        </div>
      </div>

      {/* Detailed Feature Comparison Table */}
      <div className="mt-20 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Compare Tier Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Detailed breakdown of what is unlocked across every level.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card/70 dark:bg-card/40 backdrop-blur-2xl shadow-e2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-surface-sunken/60 dark:bg-surface-sunken/40 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-4 sm:p-5">Feature / Capability</th>
                <th className="p-4 sm:p-5 text-center">Free Starter</th>
                <th className="p-4 sm:p-5 text-center text-emerald-500 font-bold bg-emerald-500/5">
                  BigO Pro
                </th>
                <th className="p-4 sm:p-5 text-center">OA Season Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground/90 text-xs sm:text-sm">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Core DSA Pattern Variations</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground font-mono">14 Patterns</td>
                <td className="p-4 sm:p-5 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-mono">
                  All 90+ Variations
                </td>
                <td className="p-4 sm:p-5 text-center text-emerald-600 dark:text-emerald-400 font-mono">
                  All 90+ Variations
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Timed Company OA Mock Simulator</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground font-mono">1 Free Diagnostic</td>
                <td className="p-4 sm:p-5 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-mono">
                  Unlimited Tests
                </td>
                <td className="p-4 sm:p-5 text-center text-emerald-600 dark:text-emerald-400 font-mono">
                  Unlimited Tests
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">60-Day Recent Verified Company Questions</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-2xs font-mono text-muted-foreground/80">
                    <Lock className="size-3" /> Locked
                  </span>
                </td>
                <td className="p-4 sm:p-5 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-mono">
                  Full Catalog Access
                </td>
                <td className="p-4 sm:p-5 text-center text-emerald-600 dark:text-emerald-400 font-mono">
                  Full Catalog Access
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">AI Edge-Case & Failing Input Diagnostics</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground font-mono">3 / day</td>
                <td className="p-4 sm:p-5 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-mono">
                  100 / month
                </td>
                <td className="p-4 sm:p-5 text-center text-emerald-600 dark:text-emerald-400 font-mono">
                  250 Total
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">CS Core Interview Curricula (OS, DBMS, CN)</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground font-mono">Basic Summaries</td>
                <td className="p-4 sm:p-5 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-mono">
                  Full Deep Dives
                </td>
                <td className="p-4 sm:p-5 text-center text-emerald-600 dark:text-emerald-400 font-mono">
                  Full Deep Dives
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-foreground">Billing Renewal Model</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground font-mono">No Payment</td>
                <td className="p-4 sm:p-5 text-center font-bold text-foreground bg-emerald-500/5 font-mono">
                  Cancel Anytime
                </td>
                <td className="p-4 sm:p-5 text-center text-primary font-bold font-mono">
                  One-time (75 Days)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-20 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Everything you need to know about our tiers and college placement support.
          </p>
        </div>

        <Accordion className="w-full space-y-3">
          <AccordionItem value="faq-1" className="rounded-2xl border border-border/80 px-5 bg-card/60 dark:bg-card/30 backdrop-blur-md shadow-2xs">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              How does the OA Season Pass work?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
              The OA Season Pass is a single, one-time payment of $39 that grants complete Pro tier access for 75 consecutive days. It never auto-renews and has zero recurring charges. It is specifically tailored for final-year and pre-final students navigating 2–3 month college placement drives.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="rounded-2xl border border-border/80 px-5 bg-card/60 dark:bg-card/30 backdrop-blur-md shadow-2xs">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              Can I cancel my Pro subscription at any time?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
              Yes! You can cancel anytime with a single click from the Billing Portal in your settings. You retain complete Pro access until the conclusion of your prepaid billing cycle.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="rounded-2xl border border-border/80 px-5 bg-card/60 dark:bg-card/30 backdrop-blur-md shadow-2xs">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              What payment methods and currencies are supported?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
              We process payments via Stripe, supporting credit/debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and localized bank rails in 135+ currencies with zero international transaction markup.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4" className="rounded-2xl border border-border/80 px-5 bg-card/60 dark:bg-card/30 backdrop-blur-md shadow-2xs">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
              How does the AI Edge-Case Debugger work?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
              During problem practice or OA simulations, our debugger analyzes your solution against hidden boundary conditions. It identifies the exact minimal input that caused Time Limit Exceeded (TLE) or logic faults without spoiling the answer, simulating real SDE mentor guidance.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading pricing plans...</span>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}

