'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'BIGO_COOKIE_CONSENT_V1';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Small delay so it doesn't pop aggressively on initial page mount
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable / private mode
    }
  }, []);

  const handleConsent = (level: 'all' | 'essential') => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, timestamp: new Date().toISOString() }));
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-card/95 dark:bg-[#0B0F17]/95 border border-border/80 shadow-2xl backdrop-blur-2xl text-foreground space-y-3 relative overflow-hidden">
            {/* Top specular beam */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 font-mono">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Privacy & Storage Notice</span>
              </div>
              <button
                type="button"
                onClick={() => handleConsent('essential')}
                aria-label="Dismiss cookie notice"
                className="size-6 -mr-1 -mt-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              BigO uses essential functional cookies and local storage to maintain your authentication session, theme preferences, and code drafts. We run <strong>zero third-party advertising trackers</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Link
                href="/privacy#cookies"
                className="text-xs text-muted-foreground hover:text-emerald-500 underline underline-offset-2 transition-colors"
              >
                Learn More
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConsent('essential')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border/70 transition-all cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={() => handleConsent('all')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
