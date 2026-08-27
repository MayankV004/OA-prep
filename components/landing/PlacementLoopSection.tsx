'use client';

import React from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PLACEMENT_STEPS } from './landing-data';

export function PlacementLoopSection() {
  const step01 = PLACEMENT_STEPS[0];
  const step02 = PLACEMENT_STEPS[1];
  const step03 = PLACEMENT_STEPS[2];
  const step04 = PLACEMENT_STEPS[3];

  return (
    <section className="py-24 px-4 md:px-8 relative max-w-7xl mx-auto overflow-hidden">
      {/* Section Header */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            The 4-Step{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500">
              Placement Loop
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-light">
            A systematic workflow to build problem-solving intuition and exam speed.
          </p>
        </div>
      </ScrollReveal>

      {/* Desktop Timeline Layout (Top Cards -> Reduced Opacity Axis -> Bottom Cards) */}
      <div className="hidden md:block relative max-w-6xl mx-auto">
        {/* TOP ROW CARDS (01 and 03) */}
        <div className="grid grid-cols-4 gap-6 items-end mb-8">
          {/* Card 01 */}
          <ScrollReveal direction="up" delay={0.1} distance={30} className="w-full">
            <div className="relative p-2 bg-transparent border-0 shadow-none group">
              <div className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500 mb-2">
                {step01.num}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-rose-500 transition-colors">
                {step01.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                {step01.desc}
              </p>

              {/* Precise Vertical Connector Line pointing down to horizontal axis */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full h-8 w-[2px] bg-red-600/70 pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* Empty Space for Step 02 */}
          <div />

          {/* Card 03 */}
          <ScrollReveal direction="up" delay={0.3} distance={30} className="w-full">
            <div className="relative p-2 bg-transparent border-0 shadow-none group">
              <div className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500 mb-2">
                {step03.num}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-rose-500 transition-colors">
                {step03.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                {step03.desc}
              </p>

              {/* Precise Vertical Connector Line pointing down to horizontal axis */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full h-8 w-[2px] bg-red-600/70 pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* Empty Space for Step 04 */}
          <div />
        </div>

        {/* MIDDLE AXIS LINE (Solid Red with Reduced Opacity) */}
        <div className="w-full h-1.5 rounded-full bg-red-600/40 shadow-sm my-0" />

        {/* BOTTOM ROW CARDS (02 and 04) */}
        <div className="grid grid-cols-4 gap-6 items-start mt-8">
          {/* Empty Space for Step 01 */}
          <div />

          {/* Card 02 */}
          <ScrollReveal direction="down" delay={0.2} distance={30} className="w-full">
            <div className="relative p-2 bg-transparent border-0 shadow-none group">
              {/* Precise Vertical Connector Line pointing up to horizontal axis */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full h-8 w-[2px] bg-red-600/70 pointer-events-none" />

              <div className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500 mb-2">
                {step02.num}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-rose-500 transition-colors">
                {step02.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                {step02.desc}
              </p>
            </div>
          </ScrollReveal>

          {/* Empty Space for Step 03 */}
          <div />

          {/* Card 04 */}
          <ScrollReveal direction="down" delay={0.4} distance={30} className="w-full">
            <div className="relative p-2 bg-transparent border-0 shadow-none group">
              {/* Precise Vertical Connector Line pointing up to horizontal axis */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full h-8 w-[2px] bg-red-600/70 pointer-events-none" />

              <div className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500 mb-2">
                {step04.num}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-rose-500 transition-colors">
                {step04.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                {step04.desc}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Mobile Stacked Layout - Text Only */}
      <div className="md:hidden space-y-6">
        {PLACEMENT_STEPS.map((step, idx) => (
          <ScrollReveal key={step.num} direction="up" delay={idx * 0.1} distance={30}>
            <div className="p-2 bg-transparent border-0 shadow-none">
              <div className="text-3xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500 mb-2">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">{step.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
