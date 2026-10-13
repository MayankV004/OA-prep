'use client';

import React from 'react';
import Link from 'next/link';
import { Code2, Layers, BookOpen } from 'lucide-react';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { Timer } from '@/components/animate-ui/icons/timer';
import { Sparkles } from '@/components/animate-ui/icons/sparkles';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const PIPELINE_STAGES = [
  {
    num: '01',
    title: 'Spot the Invariant',
    subtitle: 'Under 60s Trigger Recognition',
    icon: Code2,
    desc: 'Deconstruct problem statements into their mathematical invariants instead of memorizing code. Know whether to apply Sliding Window, Monotonic Stack, or 2D DP immediately.',
    badge: 'Archetype Detection',
    actionText: 'Explore Patterns',
    actionHref: '/dsa',
  },
  {
    num: '02',
    title: 'Drill the Variations',
    subtitle: 'Boundary & Twist Resilience',
    icon: Layers,
    desc: 'Master the 90+ recurring variations per pattern. Solve non-standard twists, cyclic permutations, and complex constraints without freezing during tech rounds.',
    badge: '90+ Variations',
    actionText: 'View Variations',
    actionHref: '/non-standard',
  },
  {
    num: '03',
    title: 'Lock CS Core Systems',
    subtitle: 'Round-2 Technical Preparedness',
    icon: BookOpen,
    desc: 'Master concurrency deadlocks, virtual memory, SQL indexing internals, and TCP protocol handshakes with high-yield revision sheets and spaced-repetition cards.',
    badge: 'OS · DBMS · Networks',
    actionText: 'Open CS Sheets',
    actionHref: '/subjects',
  },
  {
    num: '04',
    title: 'Simulate Proctored OAs',
    subtitle: 'Timed Exam Simulation',
    icon: Timer,
    desc: 'Practice under real 45 to 70-minute countdown pressure. Submit against private hidden test suites and edge cases to ensure zero penalty on hiring cutoffs.',
    badge: 'Company Simulations',
    actionText: 'Launch Simulator',
    actionHref: '/oa',
  },
];

export function PlacementLoopSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative max-w-7xl mx-auto overflow-hidden">
      {/* Section Header */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span>[ SYSTEMATIC ROADMAP ]</span>
            <span>/</span>
            <span>4-STAGE PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            The 4-step placement loop.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            A battle-tested engineering workflow designed to build deep problem intuition, exam pacing, and zero-distraction recall.
          </p>
        </div>
      </ScrollReveal>

      {/* Connected 4-Stage Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <ScrollReveal
              key={stage.num}
              direction="up"
              delay={0.1 + idx * 0.1}
              distance={25}
              className="h-full"
            >
              <div className="relative h-full p-6 sm:p-7 rounded-3xl bg-card/85 dark:bg-[#0c1017] border border-border/80 dark:border-white/10 shadow-xs hover:border-emerald-500/40 hover:shadow-md dark:hover:shadow-[0_10px_30px_rgba(16,185,129,0.08)] transition-all duration-300 flex flex-col justify-between group">
                {/* Top Number & Icon */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {stage.num}
                    </span>
                    <div className="size-10 rounded-2xl bg-surface-sunken dark:bg-white/[0.04] border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-colors">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                      {stage.badge}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {stage.title}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                    {stage.desc}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-6 border-t border-border/60 dark:border-white/10 mt-6">
                  <Link
                    href={stage.actionHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                  >
                    <span>{stage.actionText}</span>
                    <ArrowRight size={14} animateOnHover className="ml-1" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Pipeline Summary Bar */}
      <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-surface-sunken/40 dark:bg-white/[0.02] border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5 text-2xs sm:text-xs font-mono text-muted-foreground">
          <Sparkles size={18} animateOnHover className="text-emerald-500 shrink-0" />
          <span>Follow this 4-step loop to prepare systematically for both online assessments and technical interview rounds.</span>
        </div>
        <Link
          href="/dsa"
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all active:scale-95 shadow-xs"
        >
          Begin Stage 01 Now
        </Link>
      </div>
    </section>
  );
}
