'use client';

import Link from 'next/link';
import { BigOLogo } from '@/components/ui/big-o-logo';

export function AuthParallaxShowcase() {
  return (
    <aside
      className="relative hidden overflow-hidden bg-zinc-50 dark:bg-[#070A0F] text-zinc-900 dark:text-white lg:flex lg:flex-col justify-between p-10 xl:p-14 border-r border-zinc-200/80 dark:border-white/10 select-none transition-colors duration-300"
    >
      {/* ── Background: Ambient Gradients & Subtle Grid ─── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none z-0" />
      <div className="absolute -top-24 -left-24 size-[480px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/12 blur-[140px] pointer-events-none z-0" />
      <div className="absolute -bottom-24 -right-24 size-[480px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/12 blur-[140px] pointer-events-none z-0" />

      {/* ── Top Bar: Clean BigO Logo ───────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <BigOLogo size="lg" />
        </Link>
      </div>

      {/* ── Center: Clean, Breathable Headline & Description ────── */}
      <div className="relative z-10 my-auto py-8 max-w-xl space-y-5">
        <h1 className="font-display text-4xl xl:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.14] transition-colors duration-300">
          Every Pattern. <br />
          Every Assessment. <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
            One Unified Cockpit.
          </span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300/85 text-base xl:text-lg leading-relaxed font-normal max-w-lg transition-colors duration-300">
          The high-precision workspace for engineers targeting top-tier tech placements. Master 90+ algorithmic variations, simulate real OAs, and retain core CS theory.
        </p>
      </div>

      {/* ── Bottom Strip ───────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200/80 dark:border-white/10 pt-5 transition-colors duration-300">
        <span>BigO Engine © {new Date().getFullYear()}</span>
      </div>
    </aside>
  );
}
