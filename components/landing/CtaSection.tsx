'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function CtaSection() {
  return (
    <section className="py-28 px-4 text-center relative overflow-hidden">
      <ScrollReveal direction="up" delay={0.1}>
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
            Ready to Level Up Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500">
              Placement Game?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light leading-relaxed">
            Join engineering students who built structured prep habits, mastered patterns, and landed top tech roles.
          </p>
          <div className="pt-4">
            <Link href="/sign-up">
              <button className="group relative inline-flex items-center justify-center h-14 px-10 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_50px_rgba(225,29,72,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-0">
                <span>Get Started Now — It's Free</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
