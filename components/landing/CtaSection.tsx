'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { BadgeCheck } from '@/components/animate-ui/icons/badge-check';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="relative p-8 sm:p-12 md:p-14 rounded-3xl bg-card/90 dark:bg-[#0c1017] border border-border/80 dark:border-white/10 shadow-2xl text-center space-y-6 overflow-hidden">
            {/* Top Specular Edge Glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-3xl -z-10" />

            {/* Technical Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-sunken dark:bg-white/[0.04] border border-border/60 text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Terminal className="size-3" />
              <span>FINAL PREPARATION MILESTONE</span>
            </div>

            {/* Headline in Sentence Case */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-foreground leading-[1.14]">
              Ready to clear your next <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                online assessment?
              </span>
            </h2>

            {/* Pragmatic Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-normal">
              Master 90+ recurring patterns, simulate timed 45-minute company assessments under exam conditions, and master core CS rounds.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/dsa" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto inline-flex items-center justify-center h-12 sm:h-13 px-8 rounded-full font-bold text-sm sm:text-base text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-200 active:scale-95 cursor-pointer">
                  <span>Start Practice Free</span>
                  <ArrowRight size={18} animateOnHover className="ml-2" />
                </button>
              </Link>

              <Link href="/oa" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center h-12 sm:h-13 px-7 rounded-full font-semibold text-sm sm:text-base text-foreground bg-surface-sunken hover:bg-muted/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-border/80 dark:border-white/10 transition-all duration-200 active:scale-95 cursor-pointer">
                  <span>Explore OA Simulator</span>
                </button>
              </Link>
            </div>

            {/* Reassurance Checks */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} animateOnHover className="text-emerald-500 shrink-0" />
                <span>Free forever core roadmaps</span>
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} animateOnHover className="text-emerald-500 shrink-0" />
                <span>Zero credit card required</span>
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={16} animateOnHover className="text-emerald-500 shrink-0" />
                <span>Instant in-browser execution</span>
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
