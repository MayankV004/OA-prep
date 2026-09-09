'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ShieldCheck, CheckCircle2, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PricingCard } from '@/components/pricing/PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { PLANS, type CheckoutPlanKey } from '@/lib/payments/types';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const canceled = searchParams.get('canceled');

  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const { plan: currentPlan, isPro, checkout, isCheckingOut, openPortal, isOpeningPortal } = useSubscription();

  const handleSelectPlan = (planKey: CheckoutPlanKey) => {
    checkout(planKey);
  };

  const activeProPlan = billingInterval === 'annual' ? PLANS.pro_annual : PLANS.pro_monthly;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Alert banners */}
      {paymentStatus === 'success' && (
        <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-6 text-center backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-2">
            <Check className="h-5 w-5 stroke-[3]" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Welcome to BigO Pro! ⚡</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your subscription is active. All premium features, mock OA simulators, and AI debugging tools are unlocked.
          </p>
        </div>
      )}

      {canceled && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-muted-foreground">
          Checkout was canceled. No charges were made. You can upgrade whenever you are ready.
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 mb-4">
          Placement Season Special
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Invest in Your Next Tech Offer
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Simulate real-world company OAs, diagnose failing test cases with AI, and master high-frequency placement questions.
        </p>

        {/* Billing Interval Switcher */}
        <div className="mt-8 inline-flex items-center rounded-xl border border-border/70 bg-muted/40 p-1 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setBillingInterval('monthly')}
            className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              billingInterval === 'monthly'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval('annual')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              billingInterval === 'annual'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Save 47%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Free Plan */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8 backdrop-blur-xs">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Free Starter</h3>
            <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
              Core foundational prep tools for self-directed study.
            </p>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-foreground">$0</span>
              <span className="text-sm font-medium text-muted-foreground">/ forever</span>
            </div>

            <hr className="my-6 border-border/50" />

            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                '12+ Core DSA pattern trackers',
                'LeetCode-style activity heatmap',
                'Interview flashcards & revision bookmarks',
                'Competitive Programming contest radar',
                '10 starter AI debugging credits',
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="text-foreground/80">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <Button
              variant="outline"
              disabled={currentPlan === 'free'}
              className="w-full font-medium"
            >
              {currentPlan === 'free' ? 'Your Current Plan' : 'Free Tier'}
            </Button>
          </div>
        </div>

        {/* Pro Plan (Monthly or Annual) */}
        <PricingCard
          plan={activeProPlan}
          isPopular={true}
          isCurrentPlan={isPro && (currentPlan === 'pro_monthly' || currentPlan === 'pro_annual')}
          isLoading={isCheckingOut}
          onSelect={handleSelectPlan}
        />

        {/* OA Season Pass */}
        <PricingCard
          plan={PLANS.oa_pass}
          isPopular={false}
          isCurrentPlan={currentPlan === 'oa_pass'}
          isLoading={isCheckingOut}
          onSelect={handleSelectPlan}
        />
      </div>

      {/* Customer Portal Link for existing subscribers */}
      {isPro && (
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => openPortal()}
            disabled={isOpeningPortal}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Manage existing subscription, update card, or cancel
          </Button>
        </div>
      )}

      {/* Trust & Guarantee Badges */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-2xl border border-border/60 bg-muted/20 p-6 text-center">
        <div className="flex flex-col items-center">
          <ShieldCheck className="h-6 w-6 text-emerald-500 mb-2" />
          <h4 className="text-sm font-semibold text-foreground">Secure Stripe Checkout</h4>
          <p className="mt-1 text-xs text-muted-foreground">Bank-level 256-bit encryption. We never store credit card numbers.</p>
        </div>
        <div className="flex flex-col items-center">
          <CheckCircle2 className="h-6 w-6 text-amber-500 mb-2" />
          <h4 className="text-sm font-semibold text-foreground">Instant Activation</h4>
          <p className="mt-1 text-xs text-muted-foreground">Your account is upgraded immediately with zero delay.</p>
        </div>
        <div className="flex flex-col items-center">
          <HeartHandshake className="h-6 w-6 text-blue-500 mb-2" />
          <h4 className="text-sm font-semibold text-foreground">Cancel Anytime</h4>
          <p className="mt-1 text-xs text-muted-foreground">One-click cancellation directly from your settings with no hidden steps.</p>
        </div>
      </div>

      {/* Detailed Feature Comparison Table */}
      <div className="mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Compare Plans & Features</h2>
          <p className="text-sm text-muted-foreground mt-1">Detailed breakdown of what is included in each tier.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/30">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <th className="p-4 sm:p-5">Capability</th>
                <th className="p-4 sm:p-5 text-center">Free</th>
                <th className="p-4 sm:p-5 text-center text-warning font-bold">Pro</th>
                <th className="p-4 sm:p-5 text-center">OA Season Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground/90">
              <tr>
                <td className="p-4 sm:p-5 font-medium">Core DSA Pattern Variations</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">12+ Patterns</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">All Patterns</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">All Patterns</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium">Timed Company OA Mock Simulator</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground">1 Demo Test</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">Unlimited</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium">Recent 60-Day Verified Company Questions</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground">Locked</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">Full Library</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">Full Library</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium">AI Edge-Case & Failing Input Debugger</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground">3 / day</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">100 / month</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">250 Total</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium">System Design & DevOps Curriculum</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground">Previews</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">Full Access</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">Full Access</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium">Auto-renewing Subscription</td>
                <td className="p-4 sm:p-5 text-center text-muted-foreground">No</td>
                <td className="p-4 sm:p-5 text-center text-foreground">Yes (Cancel anytime)</td>
                <td className="p-4 sm:p-5 text-center text-primary font-semibold">No (One-time)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
        </div>

        <Accordion className="w-full space-y-3">
          <AccordionItem value="faq-1" className="rounded-xl border border-border/60 px-4 bg-card/20">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              How does the OA Season Pass work?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The OA Season Pass is a single, one-time payment of $39 that gives you complete Pro access for 75 days. It will never auto-charge or renew. It is built specifically for students during their 2–3 month college placement drive.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="rounded-xl border border-border/60 px-4 bg-card/20">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              Can I cancel my Pro subscription at any time?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Yes! You can cancel anytime with a single click from the Billing Portal in your settings. You will retain full access until the end of your prepaid billing period.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="rounded-xl border border-border/60 px-4 bg-card/20">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              What payment methods are supported?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We use Stripe to process global payments, supporting Visa, Mastercard, American Express, Apple Pay, and Google Pay in 135+ currencies.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4" className="rounded-xl border border-border/60 px-4 bg-card/20">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">
              What if my code fails hidden testcases during practice?
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              BigO Pro includes our AI Edge-Case Debugger. You simply submit your code, and the engine analyzes boundary constraints and generates the exact minimal input that caused your logic to fail or hit TLE, without spoiling the answer.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
