'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { BigOLogo } from '@/components/ui/big-o-logo';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
  variant?: 'app' | 'public';
}

export function Footer({ className, variant = 'app' }: FooterProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feedback'>('feedback');

  const openFeedback = (type: 'bug' | 'feedback') => {
    setFeedbackType(type);
    setFeedbackOpen(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer
        className={cn(
          'relative overflow-hidden border-t border-border/70 bg-card/60 dark:bg-card/40 backdrop-blur-3xl text-foreground mt-auto transition-colors',
          className
        )}
      >
        {/* Specular Emerald Top Border Beam */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Ambient Aurora Bottom Reflection */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[320px] bg-gradient-to-t from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl opacity-60 dark:opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18 relative z-10">
          
          {/* Top Community & Placement Callout Strip */}
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-card/70 dark:bg-surface-elevated/50 border border-border/80 backdrop-blur-xl shadow-e2 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="pointer-events-none absolute -left-12 -top-12 size-36 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="space-y-1 text-center sm:text-left relative z-10">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                  Ready for Hiring Season
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                Master the exact patterns asked in Tier-1 OAs
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                Join thousands of engineering students clearing Amazon, Google, Microsoft, and Uber assessments.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <Link href="/dsa">
                <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 transition-all active:scale-95 cursor-pointer">
                  Explore 90+ Patterns
                </button>
              </Link>
              <Link href="/oa/free-universal-diagnostic-oa">
                <button className="px-4 py-2.5 rounded-xl text-xs font-semibold text-foreground bg-surface-sunken hover:bg-muted border border-border/80 transition-all active:scale-95 cursor-pointer">
                  Take Free Diagnostic OA
                </button>
              </Link>
            </div>
          </div>

          {/* Main Footer Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-border/60">
            
            {/* Column 1: Brand Info & Live Engine Status */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center">
                <BigOLogo size="md" showBadge={false} />
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm font-normal">
                Structured DSA pattern roadmaps, full-screen proctored assessment emulation, and CS core conceptual revision engineered for software placement success.
              </p>

              {/* Live Status Pill */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/80 shadow-2xs text-xs font-mono">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                  </span>
                  <span className="text-muted-foreground">Evaluation Engine:</span>
                  <span className="font-bold text-emerald-500">Operational</span>
                </div>
              </div>
            </div>

            {/* Column 2: DSA & Patterns */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                DSA Roadmaps
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <Link href="/dsa" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    14 Core Patterns
                  </Link>
                </li>
                <li>
                  <Link href="/non-standard" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Non-Standard Variations
                  </Link>
                </li>
                <li>
                  <Link href="/advanced" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Advanced Data Structures
                  </Link>
                </li>
                <li>
                  <Link href="/cp" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Competitive Programming
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Assessments & OAs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                Company OAs
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <Link href="/oa" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Company OA Mock Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/oa/free-universal-diagnostic-oa" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Universal Diagnostic OA
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Forensic Scorecards
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Pro Pack All-Access
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: CS Core & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                CS Core & Legal
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <Link href="/subjects" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Operating Systems & DBMS
                  </Link>
                </li>
                <li>
                  <Link href="/interview" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Subject Interview Q&A
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFeedback('feedback')}
                    className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all text-left cursor-pointer"
                  >
                    Share Feedback
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFeedback('bug')}
                    className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all text-left cursor-pointer"
                  >
                    Report a Bug
                  </button>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Back-to-Top Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <p>© {new Date().getFullYear()} BigO Prep. Engineered with passion for future SDEs.</p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <span className="text-border">•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span className="text-border">•</span>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>

              {/* Scroll To Top Button */}
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                className="ml-2 flex size-8 items-center justify-center rounded-xl bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <ArrowUp className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Feedback Modal */}
      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        defaultType={feedbackType}
      />
    </>
  );
}
