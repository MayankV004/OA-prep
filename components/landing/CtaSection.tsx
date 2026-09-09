'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden text-center">
      {/* Subtle Ambient Emerald Aura - Borderless */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] blur-[90px] -z-10" />

      <div className="max-w-3xl mx-auto relative z-10">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="space-y-6">
            {/* Normal-sized Display Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground leading-[1.14]">
              Ready to Clear Your Next OA? <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                Start Practicing Today.
              </span>
            </h2>

            {/* Concise Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-normal">
              Master 90+ core patterns, run multi-language code in sub-millisecond sandboxes, and simulate real proctored company OAs.
            </p>

            {/* Action Buttons - Normal Size */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto inline-flex items-center justify-center h-12 px-7 sm:px-8 rounded-full font-semibold text-sm sm:text-base text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-95 cursor-pointer">
                  <span>Get Started Free</span>
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/oa" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 sm:px-7 rounded-full font-medium text-sm sm:text-base text-foreground bg-muted/50 dark:bg-white/[0.06] hover:bg-muted dark:hover:bg-white/[0.1] transition-all duration-200 active:scale-95 cursor-pointer">
                  Explore OA Library
                </button>
              </Link>
            </div>

            {/* Clean Reassurance - Borderless */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>Free forever core tier</span>
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>No credit card required</span>
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-500 shrink-0" />
                <span>Diagnostic OA simulations</span>
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
