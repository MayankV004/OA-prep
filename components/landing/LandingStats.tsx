'use client';

import React from 'react';
import { ScrollReveal, ScrollCountUp } from '@/components/ui/scroll-reveal';

interface LandingStatsProps {
  liveStats: {
    variations: string;
    problems: string;
    topics: string;
  };
}

export function LandingStats({ liveStats }: LandingStatsProps) {
  return (
    <section className="relative z-20 max-w-6xl mx-auto px-4 -mt-12 mb-28">
      <ScrollReveal direction="up" delay={0.1} distance={30}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 p-2 bg-transparent">
          <ScrollCountUp value={liveStats.variations} label="Pattern Variations" />
          <ScrollCountUp value={liveStats.problems} label="Curated Problems" />
          <ScrollCountUp value={liveStats.topics} label="CS Core Subjects" />
          <ScrollCountUp value="100+" label="Company OA Sets" />
        </div>
      </ScrollReveal>
    </section>
  );
}
