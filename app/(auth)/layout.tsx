import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BigOLogo } from '@/components/ui/big-o-logo';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { AuthParallaxShowcase } from '@/components/auth/AuthParallaxShowcase';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr] text-foreground font-sans selection:bg-emerald-500/30 overflow-hidden relative bg-[#070A0F]">
      {/* ── Left Side: Multi-Layer Parallax Showcase ─────────── */}
      <AuthParallaxShowcase />

      {/* ── Right Side: Form Column (Borderless) ─────────────── */}
      <main className="relative flex flex-col justify-between px-4 py-8 sm:px-10 lg:px-14 z-10 bg-[#0B0C0E] text-white">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-all bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" aria-hidden />
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
