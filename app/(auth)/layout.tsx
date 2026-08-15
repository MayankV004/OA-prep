import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BigOLogo } from '@/components/ui/big-o-logo';

/**
 * Shared auth shell. Branded panel on the left at lg and up, form column on
 * the right; stacks to a single column on mobile.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-accent-600 p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="accent-mesh absolute inset-0 opacity-80" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent-950"
          aria-hidden
        />

        <Link
          href="/"
          className="relative flex items-center gap-2.5 text-white outline-none"
        >
          <BigOLogo size="lg" showBadge />
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white text-balance">
            Every pattern, every subject, one place.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Track DSA patterns, competitive programming, core subjects and
            interview prep — and watch the gaps close as you go.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: 'DSA', label: 'Pattern drills' },
              { value: 'CP', label: 'Contest prep' },
              { value: 'Q&A', label: 'Interview sets' },
            ].map((stat) => (
              <div key={stat.value}>
                <dt className="font-display text-xl font-semibold text-white">
                  {stat.value}
                </dt>
                <dd className="mt-0.5 text-xs text-white/60">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-xs text-white/40">
          Built for top tech interview prep.
        </p>
      </aside>

      {/* ── Form column ─────────────────────────────────────────── */}
      <main className="relative flex flex-col justify-center bg-background px-5 py-10 sm:px-8">
        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-muted outline-none transition-colors hover:text-foreground sm:left-6 sm:top-6"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to home
        </Link>

        <div className="mx-auto w-full max-w-sm">
          {/* Mobile-only mark, since the brand panel is hidden here. */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2.5 outline-none lg:hidden"
          >
            <BigOLogo size="md" />
          </Link>

          {children}
        </div>
      </main>
    </div>
  );
}
