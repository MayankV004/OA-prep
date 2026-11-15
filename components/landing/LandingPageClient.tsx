'use client';

import { useEffect, useState } from 'react';
import { Footer } from '@/components/shell/Footer';
import { Navbar } from '@/components/ui/navbar';
import { HeroExecutive } from '@/components/landing/HeroExecutive';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StickyScrollSection } from '@/components/ui/sticky-scroll-section';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

// Landing Page Modular Components & Constant Data
import { getPlatformModules } from '@/components/landing/landing-data';
import { LandingStats } from '@/components/landing/LandingStats';
import { CompanyMarquee } from '@/components/landing/CompanyMarquee';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { PlacementLoopSection } from '@/components/landing/PlacementLoopSection';
import { InteractiveWorkspaceSection } from '@/components/landing/InteractiveWorkspaceSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { MobileStickyCta } from '@/components/landing/MobileStickyCta';

export function LandingPageClient() {
  const [liveStats, setLiveStats] = useState({
    variations: '172',
    problems: '870+',
    topics: '5',
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLiveStats({
            variations: data.variationCount || '172',
            problems: data.problemCount || '870+',
            topics: String(data.topicCount || 5),
          });
        }
      })
      .catch(() => {});
  }, []);

  const platformModules = getPlatformModules(liveStats);

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/20 selection:text-emerald-500 overflow-x-clip">
        {/* 1. Viewport Top Scroll Progress Bar */}
        <ScrollProgress />

        {/* 2. Floating Navbar */}
        <Navbar />

        {/* 3. Flagship Executive Hero with Interactive OA Console */}
        <HeroExecutive />

        {/* 4. Tier-1 Company OA Target Marquee */}
        <CompanyMarquee />

        {/* 5. Live Telemetry Stats Strip */}
        <LandingStats liveStats={liveStats} />

        {/* 6. Curated Curriculum Architecture Scrollytelling */}
        <section id="features" className="py-20 relative">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3 px-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>Curriculum Architecture</span>
                <span className="text-emerald-500/40">·</span>
                <span>Four Pillars</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                Four pillars engineered for{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                  placement rounds.
                </span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
                A structured, non-redundant system covering algorithmic patterns, CS core fundamentals, company OAs, and active recall.
              </p>
            </div>
          </ScrollReveal>

          <StickyScrollSection items={platformModules} />
        </section>

        {/* 7. Comparison: Random Grind vs Pattern Intuition */}
        <div className="content-visibility-auto">
          <ComparisonSection />
        </div>

        {/* 8. The 4-Step Placement Loop Pipeline */}
        <div className="content-visibility-auto">
          <PlacementLoopSection />
        </div>

        {/* 9. Multi-Language Interactive Workspace Cockpit */}
        <div className="content-visibility-auto">
          <InteractiveWorkspaceSection />
        </div>

        {/* 10. Interactive Frequently Asked Questions */}
        <div className="content-visibility-auto">
          <FaqSection />
        </div>

        {/* 11. Closing Call To Action Section */}
        <div className="content-visibility-auto">
          <CtaSection />
        </div>

        {/* 12. Glassmorphic Footer (Callout hidden here to avoid double-CTA collision with CtaSection) */}
        <Footer variant="public" showCallout={false} />

        {/* 13. Mobile-Only Sticky Bottom CTA */}
        <MobileStickyCta />
      </div>
    </SmoothScrollProvider>
  );
}
