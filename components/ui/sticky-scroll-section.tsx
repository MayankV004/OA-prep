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
            <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>Curated Curriculum</span>
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
                        'text-4xl lg:text-6xl font-black font-mono transition-all duration-300',
                        isActive ? 'text-primary' : 'text-muted-foreground/60'
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
                          className="h-1 w-16 bg-primary rounded-full"
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
                  <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
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
        className="group relative p-7 sm:p-9 md:p-10 rounded-3xl bg-card/85 dark:bg-[#0c1017] border border-border/80 dark:border-white/10 shadow-sm hover:border-emerald-500/40 hover:shadow-md dark:hover:shadow-[0_10px_30px_rgba(16,185,129,0.08)] transition-all duration-300"
      >
        <div className="space-y-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="size-12 sm:size-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-black font-bold shadow-xs">
                <Icon className="size-6 sm:size-7" />
              </div>
              <div>
                <span className="text-2xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                  Module {item.number}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>

            {item.metric && (
              <span className="px-3 py-1 rounded-full text-2xs sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                {item.metric}
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
            {item.description}
          </p>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {item.highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-sunken/60 dark:bg-white/[0.02] border border-border/60 text-xs sm:text-sm font-medium text-foreground"
              >
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 flex items-center justify-between">
            <Link href={item.linkUrl}>
              <button className="group/btn inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-xs active:scale-95 cursor-pointer border-0">
                <span>{item.linkText}</span>
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
