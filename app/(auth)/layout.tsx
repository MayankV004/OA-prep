import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from '@/components/animate-ui/icons/arrow-left';
import { BigOLogo } from '@/components/ui/big-o-logo';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { AuthParallaxShowcase } from '@/components/auth/AuthParallaxShowcase';

export const metadata: Metadata = {
  title: {
    default: 'Candidate Authentication',
    template: '%s | BigO',
  },
  description:
    'Sign in or create your BigO account to access OA simulations, DSA pattern roadmaps, and interview flashcards.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr] text-foreground font-sans selection:bg-emerald-500/30 overflow-hidden relative bg-zinc-50 dark:bg-[#070A0F] transition-colors duration-300">
      {/* ── Left Side: Multi-Layer Parallax Showcase ─────────── */}
      <AuthParallaxShowcase />

      {/* ── Right Side: Form Column (Borderless) ─────────────── */}
      <main className="relative flex flex-col justify-between px-4 py-8 sm:px-10 lg:px-14 z-10 bg-white dark:bg-[#0B0C0E] text-zinc-900 dark:text-white border-l border-zinc-200/80 dark:border-white/10 transition-colors duration-300">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-white/10"
          >
            <ArrowLeft size={14} animateOnHover className="group-hover:-translate-x-0.5 transition-transform" aria-hidden />
            <span>Back to home</span>
          </Link>

          <AnimatedThemeToggle />
        </div>

        {/* Centered Auth Box (Borderless) */}
        <div className="mx-auto w-full max-w-md my-auto py-6 z-10">
          {/* Mobile Logo */}
          <div className="mb-6 flex justify-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <BigOLogo size="md" />
            </Link>
          </div>

          {/* Borderless Form Container */}
          <div className="relative w-full">
            {children}
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="text-center text-xs text-zinc-500 py-4 z-10">
          BigO Placement Engine © {new Date().getFullYear()} · All rights reserved
        </div>
      </main>
    </div>
  );
}
