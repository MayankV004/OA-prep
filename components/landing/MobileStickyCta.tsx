'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';

export function MobileStickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 380px (past top hero fold)
      if (window.scrollY > 380) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 dark:bg-[#080B10]/95 backdrop-blur-xl border-t border-border/80 px-4 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex items-center justify-between gap-3"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">
              Master 90+ Patterns
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              Free • Zero Distractions
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/sign-in"
              className="px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dsa"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Free</span>
              <ArrowRight className="size-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
