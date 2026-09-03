'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

  return (
    <>
      <footer
        className={cn(
          'w-full border-t border-border/40 bg-background/80 backdrop-blur-xl text-foreground mt-auto transition-colors',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-border/40">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center">
                <BigOLogo size="md" showBadge={false} />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-normal">
                Master Data Structures, Algorithms, Competitive Programming, and CS Core fundamentals to ace your Online Assessments and technical interviews.
              </p>
            </div>

            {/* Column 2: DSA & Practice */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                DSA & Patterns
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link href="/dsa" className="text-muted-foreground hover:text-foreground transition-colors">
                    14 Coding Patterns
                  </Link>
                </li>
                <li>
                  <Link href="/non-standard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Non-Standard Patterns
                  </Link>
                </li>
                <li>
                  <Link href="/advanced" className="text-muted-foreground hover:text-foreground transition-colors">
                    Advanced Topics
                  </Link>
                </li>
                <li>
                  <Link href="/cp" className="text-muted-foreground hover:text-foreground transition-colors">
                    Competitive Programming
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: CS Core & Interview */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Interview Prep
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link href="/subjects" className="text-muted-foreground hover:text-foreground transition-colors">
                    CS Core Subjects
                  </Link>
                </li>
                <li>
                  <Link href="/interview" className="text-muted-foreground hover:text-foreground transition-colors">
                    Subject Q&A Practice
                  </Link>
                </li>
                <li>
                  <Link href="/cheatsheets" className="text-muted-foreground hover:text-foreground transition-colors">
                    Quick Revision Sheets
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Progress Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Support & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                Support & Legal
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFeedback('feedback')}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Share Feedback
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openFeedback('bug')}
                    className="text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Report a Bug
                  </button>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} BigO Prep. Designed for student developers & software engineers.</p>
            <div className="flex items-center gap-6">
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
            </div>
          </div>
        </div>
      </footer>

      {/* Global Feedback Modal triggerable from footer */}
      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        defaultType={feedbackType}
      />
    </>
  );
}
