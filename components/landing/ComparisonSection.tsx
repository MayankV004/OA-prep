'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const TRADITIONAL_PAIN_POINTS = [
  {
    title: '3,000+ Random Problem Sea',
    desc: 'Unstructured solving with zero retention. You solve 200 questions and still forget how to start.',
  },
  {
    title: 'Rote Solution Memorization',
    desc: 'Remembering specific trick solutions that fall apart the moment an interviewer adds a slight twist.',
  },
  {
    title: 'Fragmented CS Core Notes',
    desc: 'Scattered college PDFs and textbook slides for OS, DBMS, and Networks cramming before Round 2.',
  },
  {
    title: 'Zero Exam Simulation',
    desc: 'Solving untimed in a relaxed browser editor, then freezing under actual 45-minute OA proctored countdowns.',
  },
];

const BIGO_ADVANTAGES = [
  {
    title: '14 Core Pattern Frameworks',
    desc: 'Master the 90 essential variations. Recognize whether a problem needs Sliding Window, Monotonic Stack, or 2D DP in under 60 seconds.',
  },
  {
    title: 'Universal Problem Templates',
    desc: 'Learn the underlying blueprints and invariant rules so you can adapt to any unseen problem variant effortlessly.',
  },
  {
    title: 'Integrated CS Core Modules',
    desc: 'Concise, high-yield interview revision sheets, subject Q&A drills, and flashcards built specifically for tech rounds.',
  },
  {
    title: 'Timed Company OA Simulations',
    desc: 'Practice under real exam pressure with realistic test suites, hidden edge cases, and time-constraint pacing.',
  },
];

export function ComparisonSection() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Section Header */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            The Better Way To Prepare
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Stop Random Grinding. <br className="hidden sm:inline" />
            <span className="text-primary">Master Problem Intuition.</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-light leading-relaxed">
            Most students fail technical rounds not from a lack of effort, but from unstructured preparation.
          </p>
        </div>
      </ScrollReveal>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
        {/* Left Card: The Old Way */}
        <ScrollReveal direction="right" delay={0.2} className="h-full">
          <div className="h-full p-6 sm:p-8 rounded-3xl bg-card/40 border border-border/70 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                The Traditional Grind
              </span>
              <h3 className="text-xl font-bold text-foreground">
                Random Problem Solving
              </h3>
            </div>

            <div className="space-y-4 pt-2">
              {TRADITIONAL_PAIN_POINTS.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground/80">
                    <X className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground/90">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Right Card: The BigO Way */}
        <ScrollReveal direction="left" delay={0.3} className="h-full">
          <div className="h-full p-6 sm:p-8 rounded-3xl bg-card border-2 border-primary/40 shadow-sm space-y-6 relative">
            {/* Top Highlight Badge */}
            <div className="absolute -top-3.5 right-6">
              <span className="px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-xs">
                Engineered for OAs
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                The BigO Prep System
              </span>
              <h3 className="text-xl font-bold text-foreground">
                Pattern-First Mastery
              </h3>
            </div>

            <div className="space-y-4 pt-2">
              {BIGO_ADVANTAGES.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
