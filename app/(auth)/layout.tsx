import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BigOLogo } from '@/components/ui/big-o-logo';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';

/**
 * Modern 21st.dev inspired Auth Shell:
 * Features left-side animated canvas grid glow background and black theme.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr] text-foreground font-sans selection:bg-primary/20 overflow-hidden relative bg-background transition-colors duration-200">
      {/* ── Left Side: Branded Showcase Panel (LG and up) ─────────── */}
      <aside className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col border-r border-border">
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Top Logo Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <BigOLogo size="lg" />
            </Link>
          </div>

          {/* Center Main Copy */}
          <div className="max-w-lg space-y-6 my-auto py-12">
            <h1 className="font-display text-4xl xl:text-5xl font-black tracking-tight text-foreground leading-tight">
              Every Pattern. <br />
              Every Subject. <br />
              <span className="text-primary">
                One Workspace.
              </span>
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed font-normal">
              Track DSA problem variations, master core CS fundamentals, practice competitive programming, and simulate real Online Assessments.
            </p>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium border-t border-border pt-6">
            <span>BigO © {new Date().getFullYear()}</span>
            <span className="flex items-center gap-1.5 text-primary font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Actively used for OA & interview prep
            </span>
          </div>
        </div>
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

