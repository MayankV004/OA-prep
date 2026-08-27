'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StickyScrollItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  linkText: string;
  linkUrl: string;
  icon: React.ElementType;
  badge?: string;
  metric?: string;
}

interface StickyScrollSectionProps {
  items: StickyScrollItem[];
}

export function StickyScrollSection({ items }: StickyScrollSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* 2-Column Grid: Left Sticky (Fixed), Right Scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: STRICTLY STICKY (PINNED ON SCROLL) - BORDERLESS UI */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 z-20 self-start py-4">
          <div className="space-y-8 bg-transparent">
            
            {/* Header pill indicator */}
            <div className="text-xs font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>Interactive Scrollytelling</span>
            </div>

            {/* Giant Borderless Number Stack */}
            <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {items.map((item, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const el = document.getElementById(`sticky-item-${idx}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={cn(
                      'group flex items-center gap-6 p-4 rounded-3xl transition-all duration-500 text-left cursor-pointer border-0 bg-transparent shrink-0',
                      isActive ? 'scale-105' : 'opacity-40 hover:opacity-80'
                    )}
                  >
                    {/* Big Borderless Number */}
                    <span
                      className={cn(
                        'text-4xl lg:text-6xl font-black font-mono transition-all duration-500',
                        isActive
                          ? 'bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-rose-500 to-red-500 drop-shadow-[0_0_20px_rgba(225,29,72,0.5)]'
                          : 'text-muted-foreground/60'
                      )}
                    >
                      {item.number}
                    </span>

                    <div className="hidden lg:block space-y-1">
                      <div
                        className={cn(
                          'text-lg lg:text-xl font-bold tracking-tight transition-colors duration-300',
                          isActive ? 'text-foreground font-extrabold' : 'text-muted-foreground'
                        )}
                      >
                        {item.title}
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="h-1 w-16 bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Borderless Active Subtitle Preview */}
            <div className="hidden lg:block min-h-[90px] pt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 p-4 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.02]"
                >
                  <span className="text-xs font-mono font-semibold text-rose-500 uppercase tracking-wider">
                    {items[activeIdx].metric || `Module ${items[activeIdx].number}`}
                  </span>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {items[activeIdx].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SCROLLS NATURALLY WITH PAGE - BORDERLESS CARDS */}
        <div className="lg:col-span-7 space-y-20 lg:space-y-32 py-4">
          {items.map((item, idx) => (
            <StickyItemCard
              key={item.id}
              item={item}
              index={idx}
              onInView={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StickyItemCard({
  item,
  index,
  onInView,
}: {
  item: StickyScrollItem;
  index: number;
  onInView: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '-35% 0px -35% 0px' });
  const Icon = item.icon;

  useEffect(() => {
    if (isInView) {
      onInView();
    }
  }, [isInView, onInView]);

  return (
    <div
      id={`sticky-item-${index}`}
      ref={ref}
      className="scroll-mt-36 transition-all duration-500"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="group relative p-8 md:p-10 rounded-3xl bg-foreground/[0.015] dark:bg-white/[0.015] backdrop-blur-3xl border-0 shadow-none hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] transition-all duration-500"
      >
        {/* Red Glow Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-600/10 via-rose-500/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-rose-500 tracking-wider uppercase">
                  Module {item.number}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>

            {item.metric && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold text-rose-500 bg-rose-500/10">
                {item.metric}
              </span>
            )}
          </div>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light">
            {item.description}
          </p>

          {/* Highlights Grid - Borderless */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {item.highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.02] border-0 text-xs sm:text-sm font-medium text-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link href={item.linkUrl}>
              <button className="group/btn inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer border-0">
                <span>{item.linkText}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
