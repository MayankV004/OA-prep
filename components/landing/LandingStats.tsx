'use client';

import React from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Activity, Layers, Code2, BookOpen, ShieldCheck } from 'lucide-react';

interface LandingStatsProps {
  liveStats: {
    variations: string;
    problems: string;
    topics: string;
  };
}

export function LandingStats({ liveStats }: LandingStatsProps) {
  return (
    <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 my-16">
      <ScrollReveal direction="up" delay={0.1} distance={20}>
        <div className="space-y-4">
          {/* Telemetry Header Line */}
          <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground border-b border-border/60 pb-2">
            <span className="flex items-center gap-1.5 uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
              <Activity className="size-3 animate-pulse" />
              <span>Real-Time Telemetry // Verified Curriculum Surface</span>
            </span>
            <span className="hidden sm:inline font-mono text-muted-foreground/70">
              CURATED FOR CAMPUS & OFF-CAMPUS RECRUITMENT
            </span>
          </div>

          {/* 4-Stat Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <div className="relative p-5 sm:p-6 rounded-2xl bg-card/80 dark:bg-white/[0.02] border border-border/80 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Variations
                </span>
                <Layers className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-foreground">
                {liveStats.variations}
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Recurring pattern templates
              </p>
            </div>

            <div className="relative p-5 sm:p-6 rounded-2xl bg-card/80 dark:bg-white/[0.02] border border-border/80 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Problems
                </span>
                <Code2 className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-foreground">
                {liveStats.problems}
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Curated problem catalog
              </p>
            </div>

            <div className="relative p-5 sm:p-6 rounded-2xl bg-card/80 dark:bg-white/[0.02] border border-border/80 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  CS Core
                </span>
                <BookOpen className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-foreground">
                4
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                OS, DBMS, Networks, OOP
              </p>
            </div>

            <div className="relative p-5 sm:p-6 rounded-2xl bg-card/80 dark:bg-white/[0.02] border border-border/80 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Company OAs
                </span>
                <ShieldCheck className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-foreground">
                6
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Full timed assessment sets
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
