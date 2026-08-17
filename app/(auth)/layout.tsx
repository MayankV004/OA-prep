import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BigOLogo } from '@/components/ui/big-o-logo';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { GridGlowBackground } from '@/components/ui/grid-glow-background';

/**
 * Modern 21st.dev inspired Auth Shell:
 * Features left-side animated canvas grid glow background and black theme.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr] text-foreground font-sans selection:bg-rose-500/30 overflow-hidden relative bg-background transition-colors duration-300">
      {/* Background Mesh Gradient matching theme across whole layout */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-background to-indigo-500/10 dark:from-red-950/40 dark:via-slate-950/95 dark:to-indigo-950/40 opacity-90 transition-colors duration-300 -z-20" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(225,29,72,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_25%_30%,rgba(225,29,72,0.18),transparent_65%)] -z-20" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(225,29,72,0.08),transparent_65%)] dark:bg-[radial-gradient(circle_at_75%_75%,rgba(225,29,72,0.10),transparent_65%)] -z-20" aria-hidden />

      {/* ── Left Side: Branded Showcase Panel (LG and up) ─────────── */}
      <aside className="relative hidden overflow-hidden bg-slate-950 text-slate-100 lg:flex lg:flex-col border-r border-border/20">
        <GridGlowBackground glowCount={8} gridSize={52} className="flex-1">
          <div className="relative z-10 flex flex-col justify-between h-full p-12">
            {/* Background Mesh for Left Panel */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-slate-950/95 to-indigo-950/50 opacity-90 -z-10" aria-hidden />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(225,29,72,0.18),transparent_65%)] -z-10" aria-hidden />

            {/* Top Logo Header */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <BigOLogo size="lg" />
              </Link>
            </div>

            {/* Center Main Copy */}
            <div className="max-w-lg space-y-6 my-auto py-12">
              <h1 className="font-display text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
                Every Pattern. <br />
                Every Subject. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-purple-400">
                  One Workspace.
                </span>
              </h1>

              <p className="text-slate-300 text-base leading-relaxed font-light">
                Track DSA problem variations, master core CS fundamentals, practice competitive programming, and simulate real Online Assessments.
              </p>
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-800/60 pt-6">
              <span>BigO © {new Date().getFullYear()}</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Battle-tested by 10k+ engineers
              </span>
            </div>
          </div>
        </GridGlowBackground>
      </aside>

      {/* ── Right Side: Form Column ─────────────────────────────── */}
      <main className="relative flex flex-col justify-between px-5 py-8 sm:px-12 lg:px-16 z-10 bg-background/80 dark:bg-slate-950/60 backdrop-blur-md text-foreground transition-colors duration-300">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all hover:bg-accent/50"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span>Back to home</span>
          </Link>

          <AnimatedThemeToggle />
        </div>

        {/* Centered Auth Box */}
        <div className="mx-auto w-full max-w-md my-auto py-8">
          {/* Mobile Logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <BigOLogo size="md" />
            </Link>
          </div>

          {children}
        </div>

        {/* Bottom subtle copyright */}
        <div className="text-center text-xs text-muted-foreground py-4 lg:hidden">
          BigO © {new Date().getFullYear()} · All rights reserved
        </div>
      </main>
    </div>
  );
}

