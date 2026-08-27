'use client';

import { useEffect, useState } from 'react';
import { Footer } from '@/components/shell/Footer';
import { Navbar } from '@/components/ui/navbar';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StickyScrollSection } from '@/components/ui/sticky-scroll-section';

// Landing Page Modular Components & Constant Data
import { getPlatformModules } from '@/components/landing/landing-data';
import { LandingStats } from '@/components/landing/LandingStats';
import { PlacementLoopSection } from '@/components/landing/PlacementLoopSection';
import { InteractiveWorkspaceSection } from '@/components/landing/InteractiveWorkspaceSection';
import { CtaSection } from '@/components/landing/CtaSection';

export default function LandingPage() {
  const [liveStats, setLiveStats] = useState({
    variations: '90+',
    problems: '500+',
    topics: '7',
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLiveStats({
            variations: data.variationCount || '90+',
            problems: data.problemCount || '500+',
            topics: String(data.topicCount || 7),
          });
        }
      })
      .catch(() => {});
  }, []);

  const platformModules = getPlatformModules(liveStats);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-rose-500/30 overflow-x-clip">
      {/* 1. Viewport Top Red Scroll Progress Bar */}
      <ScrollProgress />

      {/* 2. Floating Navbar */}
      <Navbar />

      {/* 3. Hero Parallax Section */}
      <HeroGeometric
        title1="Crack Your OA & Interview."
        title2="Zero Distractions."
        description="Structured DSA pattern roadmaps, interactive CS core modules, spaced-repetition flashcards, and real-time coding environments designed to help you land top engineering roles."
      />

      {/* 4. Borderless Live Stats Strip */}
      <LandingStats liveStats={liveStats} />

      {/* 5. Sticky Numbered Scrollytelling Section */}
      <section id="features" className="py-16 relative">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 px-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Everything you need to excel in{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500">
                Technical Rounds
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-light">
              Stop solving random problems. Follow a battle-tested roadmap designed for engineering placements.
            </p>
          </div>
        </ScrollReveal>

        <StickyScrollSection items={platformModules} />
      </section>

      {/* 6. The 4-Step Placement Loop Section */}
      <PlacementLoopSection />

      {/* 7. Multi-Language Interactive Workspace Section */}
      <InteractiveWorkspaceSection />

      {/* 8. Call To Action Section */}
      <CtaSection />

      {/* 9. Footer */}
      <Footer variant="public" />
    </div>
  );
}
