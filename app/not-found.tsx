import Link from 'next/link';
import { ArrowLeft, BookOpen, Terminal, Cpu, Compass, Search, Home } from 'lucide-react';
import { BigOLogo } from '@/components/ui/big-o-logo';

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The requested page or algorithm could not be found. Explore 90+ DSA patterns, mock OAs, and CS core revision decks on BigO.',
};

export default function NotFound() {
  const quickLinks = [
    {
      title: '90+ DSA Patterns',
      description: 'Master Two Pointers, Sliding Window, DP, Graphs, and Trees.',
      href: '/dsa',
      icon: Compass,
      tag: 'Curriculum',
    },
    {
      title: 'Company Mock OAs',
      description: 'Simulate full-screen proctored assessments for top tech firms.',
      href: '/oa',
      icon: Terminal,
      tag: 'Assessments',
    },
    {
      title: 'CS Core Subjects',
      description: 'Operating Systems, DBMS, Computer Networks, and System Design.',
      href: '/subjects',
      icon: Cpu,
      tag: 'Theory',
    },
    {
      title: 'Cheat Sheets & Q&A',
      description: 'Rapid interview revision cards and complexity cheat sheets.',
      href: '/cheatsheets',
      icon: BookOpen,
      tag: 'Quick Prep',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Specular Ambient Lighting & Grid */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-500/[0.08] via-emerald-500/[0.02] to-transparent blur-3xl z-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#10b98110_1px,transparent_1px)] [background-size:24px_24px] opacity-40 z-0" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center">
          <BigOLogo size="md" showBadge={false} />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted border border-border/70 transition-colors"
        >
          <Home className="size-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main 404 Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        {/* 404 Glitch / Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold mb-6">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ERROR 404 • POINTER NULL / NODE NOT FOUND</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tight text-foreground mb-4">
          Lost in the{' '}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
            Binary Tree?
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8 font-normal">
          The page or problem you are looking for has been moved, unseeded, or never existed in this branch. Let&apos;s get you back on track to your placement target.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 border-t border-white/20 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            href="/dsa"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-foreground bg-card hover:bg-muted border border-border/80 transition-all active:scale-[0.98] shadow-xs"
          >
            <Compass className="size-4 text-emerald-500" />
            <span>Explore 90+ Patterns</span>
          </Link>
        </div>

        {/* Quick Navigation Cards Grid */}
        <div className="w-full max-w-3xl text-left">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center sm:text-left">
            Or jump directly into high-yield prep:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-4 rounded-2xl bg-card/60 dark:bg-[#0E131F]/60 border border-border/80 hover:border-emerald-500/40 backdrop-blur-xl transition-all hover:-translate-y-0.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Icon className="size-3.5" />
                      </div>
                      <span className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-muted-foreground border-t border-border/50">
        <p>© {new Date().getFullYear()} BigO Prep. Need help? Contact <a href="mailto:support@bigoprep.tech" className="text-emerald-500 hover:underline">support@bigoprep.tech</a></p>
      </footer>
    </div>
  );
}
