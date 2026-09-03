'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'Is BigO Prep completely free to use?',
    a: 'Yes! Core pattern roadmaps, full DSA problem trackers, CS core fundamentals (OS, DBMS, CN), and contest radar are 100% free forever with no credit card required. BigO Pro is an optional upgrade that unlocks timed company OA simulators and AI testcase debugging.',
  },
  {
    q: 'How are pattern variations different from regular problem lists?',
    a: 'Instead of memorizing 200 isolated LeetCode problems, we group problems into core algorithmic variations (such as Fixed Window vs Dynamic Window vs Two Pointers). Once you learn the universal variation template, you can solve any related interview problem under timed exam conditions without freezing.',
  },
  {
    q: 'Does it cover CS core subjects for technical interviews?',
    a: 'Yes. Rejections in technical rounds frequently happen during Round-2 core CS questions. BigO includes dedicated high-yield revision sheets, subject Q&A interview drills, and flashcards for Operating Systems, DBMS, Computer Networks, and Object-Oriented Programming.',
  },
  {
    q: 'Can I simulate real company Online Assessments (OAs)?',
    a: 'Yes. BigO provides realistic 45 to 70-minute timed mock tests emulating actual OA environments from top companies like Amazon, Google, Uber, and Microsoft, including test suites with edge cases and hidden tests.',
  },
  {
    q: 'Does my progress sync across devices?',
    a: 'Yes. Your problem completion status, revision star list, custom notes, and daily activity heatmaps are synchronized in real-time across desktop, tablet, and mobile browsers.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto relative">
      <ScrollReveal direction="up" delay={0.1}>
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-light leading-relaxed">
            Everything you need to know about preparing for your placement season with BigO.
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={cn(
                'rounded-2xl border transition-colors duration-200 bg-card overflow-hidden',
                isOpen ? 'border-primary/40 shadow-xs' : 'border-border/80 hover:border-border'
              )}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer outline-none select-none"
                aria-expanded={isOpen}
              >
                <span className="text-base sm:text-lg font-bold text-foreground pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-180 text-primary'
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
