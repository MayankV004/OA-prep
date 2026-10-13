'use client';

import React, { useState } from 'react';
import { X, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Check } from '@/components/animate-ui/icons/check';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TRADITIONAL_PAIN_POINTS = [
  {
    title: 'Isolated memorization with brittle recall',
    desc: 'Candidates solve hundreds of individual problems without seeing the underlying structure. The moment an interviewer introduces a slight boundary condition twist, memorized code collapses.',
    tag: 'Unanchored practice',
  },
  {
    title: 'Untimed practice vs strict countdown pressure',
    desc: 'Practicing in a relaxed browser editor without countdown constraints leaves candidates unprepared for actual 45-minute company assessments with hidden edge-case suites.',
    tag: 'Unsimulated test environment',
  },
  {
    title: 'Fragmented CS core subject preparation',
    desc: 'Scrambling through scattered college slides and textbook notes for OS concurrency, SQL indexing, and TCP networking protocols right before technical Round 2.',
    tag: 'Overlooked system fundamentals',
  },
  {
    title: 'Hidden edge-case blindspots',
    desc: 'Code that passes the two public sample testcases often fails in real OAs due to unhandled zero-length inputs, negative values, integer overflow, or off-by-one bounds.',
    tag: 'Unverified test coverage',
  },
];

const BIGO_ADVANTAGES = [
  {
    title: '19 pattern archetypes & 90+ variations',
    desc: 'Categorize problems systematically. Spot whether an interview prompt needs Sliding Window, Monotonic Stack, or 2D Dynamic Programming in under 60 seconds.',
    tag: 'Structured recognition',
  },
  {
    title: 'Universal invariant blueprints',
    desc: 'Learn the invariant rules and structural templates rather than memorizing code line-by-line. Adapt to any unseen problem variant with consistent logic.',
    tag: 'Deterministic intuition',
  },
  {
    title: 'Curated CS core interview sheets',
    desc: 'Concise conceptual revision sheets, subject interview drills, and spaced-repetition flashcards for Operating Systems, DBMS, Networks, and System Design.',
    tag: 'OS · DBMS · Networks · OOP',
  },
  {
    title: 'Authentic company OA simulation',
    desc: 'Full-screen exam environments emulating Amazon, Google, Uber, and Microsoft assessments with private test suites and realistic time limits.',
    tag: 'Real assessment suites',
  },
];

const INTUITION_TRIGGERS = [
  {
    problem: 'Find longest substring without repeating characters',
    traditional: 'Brute-force nested loops O(N^2) or trying to remember exact problem code from memory.',
    bigo: 'Dynamic Sliding Window + Hash Map. Expand right pointer, contract left pointer whenever duplicate count exceeds 1. Time: O(N).',
  },
  {
    problem: 'Next greater temperature for every day in array',
    traditional: 'Comparing every pair O(N^2) or getting confused with reverse array iteration.',
    bigo: 'Monotonic Decreasing Stack. Stack maintains unresolved indices. Pop when current temperature > stack top. Time: O(N).',
  },
  {
    problem: 'Course Schedule with prerequisite dependencies',
    traditional: 'Ad-hoc recursion that risks infinite cycles or unhandled disconnected subgraphs.',
    bigo: 'Topological Sort (Kahn’s In-Degree BFS). In-degree array with queue. Cycle detected if processed count != N. Time: O(V+E).',
  },
];

export function ComparisonSection() {
  const [activeTriggerIdx, setActiveTriggerIdx] = useState(0);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Section Header */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span>[ THE INTUITION GAP ]</span>
            <span>/</span>
            <span>METHODOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Stop random grinding. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              Master pattern intuition.
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            Most candidates struggle in technical rounds not from a lack of effort, but from unstructured preparation that fails to hold under exam time constraints.
          </p>
        </div>
      </ScrollReveal>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
        {/* Left Card: The Old Way (Brute Force Grind) */}
        <ScrollReveal direction="right" delay={0.2} className="h-full">
          <div className="h-full p-6 sm:p-8 rounded-3xl bg-surface-sunken/40 dark:bg-white/[0.02] border border-border/80 dark:border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    THE TRADITIONAL GRIND
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                    Isolated Problem Memorization
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-2xs font-mono font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Brittle Recall
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {TRADITIONAL_PAIN_POINTS.map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5 p-3 rounded-2xl bg-card/40 dark:bg-white/[0.01] border border-border/50">
                    <div className="size-6 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5 text-rose-500">
                      <X className="size-3.5 stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                      <span className="inline-block text-[11px] font-mono text-rose-500/90 font-medium">
                        • {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-2xs font-mono text-muted-foreground/80 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-rose-500" />
              <span>Result: High cognitive fatigue when unfamiliar problem variants appear.</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Right Card: The BigO Way (Pattern First Mastery) */}
        <ScrollReveal direction="left" delay={0.3} className="h-full">
          <div className="h-full p-6 sm:p-8 rounded-3xl bg-card/90 dark:bg-[#0d121a] border-2 border-emerald-500/40 shadow-lg dark:shadow-[0_12px_40px_rgba(16,185,129,0.1)] space-y-6 flex flex-col justify-between relative">
            {/* Top Highlight Badge */}
            <div className="absolute -top-3.5 right-6">
              <span className="px-3 py-1 rounded-full text-2xs font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black shadow-xs">
                STRUCTURED ROADMAP
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    THE BIGO METHODOLOGY
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                    Pattern-First Invariants
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-2xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Reusable Blueprints
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {BIGO_ADVANTAGES.map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5 p-3 rounded-2xl bg-surface-sunken/40 dark:bg-white/[0.03] border border-emerald-500/20">
                    <div className="size-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5 text-emerald-500">
                      <Check size={14} animateOnView className="stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                      <span className="inline-block text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-2xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="size-3.5" />
              <span>Result: Sub-60s trigger recognition & confidence under exam timers.</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Interactive Trigger Recognition Demo Box */}
      <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-border/80 dark:border-white/10 bg-card/60 dark:bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Zap className="size-3.5" />
              <span>PATTERN TRIGGER ENGINE</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mt-1">
              How Pattern Intuition Solves Unseen Problems
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-sunken/60 dark:bg-white/[0.04] border border-border/60">
            {INTUITION_TRIGGERS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTriggerIdx(idx)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-2xs font-mono font-bold transition-all cursor-pointer',
                  activeTriggerIdx === idx
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Case #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-surface-sunken/40 dark:bg-white/[0.02] border border-border/60">
            <span className="text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              UNSEEN OA PROBLEM PROMPT:
            </span>
            <p className="text-sm sm:text-base font-bold text-foreground mt-1">
              &quot;{INTUITION_TRIGGERS[activeTriggerIdx].problem}&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-1.5">
              <div className="text-2xs font-mono font-bold text-rose-500 uppercase flex items-center gap-1.5">
                <X className="size-3" />
                <span>Isolated Memorization Approach</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {INTUITION_TRIGGERS[activeTriggerIdx].traditional}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/30 space-y-1.5">
              <div className="text-2xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                <Check size={14} animateOnView />
                <span>BigO Pattern Invariant Solution</span>
              </div>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                {INTUITION_TRIGGERS[activeTriggerIdx].bigo}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
          <span className="text-2xs font-mono text-muted-foreground">
            90+ PATTERN VARIATION TEMPLATES READY IN BROWSER
          </span>
          <Link
            href="/dsa"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline group"
          >
            <span>Explore All 19 Archetypes</span>
            <ArrowRight size={14} animateOnHover className="size-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
