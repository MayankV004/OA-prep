'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Terminal,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Layers,
  Cpu,
  Database,
  Network,
  BookOpen,
  ArrowRight,
  Menu,
  X,
  FileCode,
  BarChart2,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { UserMenu } from '@/components/shell/UserMenu';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { BigOLogo } from '@/components/ui/big-o-logo';
import { cn } from '@/lib/utils';

interface DropdownItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isPro?: boolean;
}

interface NavCategory {
  id: string;
  label: string;
  featured?: {
    title: string;
    description: string;
    href: string;
    tag: string;
  };
  items: DropdownItem[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'dsa',
    label: 'DSA & Patterns',
    featured: {
      title: '14 Core Coding Patterns',
      description: 'Master sliding window, two pointers, and fast & slow pointers with curated roadmaps.',
      href: '/dsa',
      tag: 'Most Popular',
    },
    items: [
      {
        title: '14 Standard Patterns',
        description: 'Two pointers, sliding window, cyclic sort & interval merges.',
        href: '/dsa',
        icon: Code2,
      },
      {
        title: 'Non-Standard Variations',
        description: 'Bitmask DP, meet in the middle, and monotonic queue problems.',
        href: '/non-standard',
        icon: Layers,
        badge: 'New',
      },
      {
        title: 'Advanced DSA',
        description: 'Segment trees, Fenwick trees, and Trie data structures.',
        href: '/advanced',
        icon: Terminal,
      },
      {
        title: 'Competitive Programming',
        description: 'Number theory, combinatorics, and game theory questions.',
        href: '/cp',
        icon: FileCode,
      },
    ],
  },
  {
    id: 'oa',
    label: 'Assessments & OAs',
    featured: {
      title: 'Tier-1 OA Simulator',
      description: 'Practice with real hiring cut-offs, countdown clocks, and AI proctoring emulation.',
      href: '/oa',
      tag: 'Proctoring Ready',
    },
    items: [
      {
        title: 'Company OA Catalog',
        description: 'Amazon, Google, Uber, and Microsoft placement assessment tracks.',
        href: '/oa',
        icon: ShieldCheck,
      },
      {
        title: 'Universal Diagnostic OA',
        description: '45-minute timed test measuring your speed, edge cases, and pacing.',
        href: '/oa/free-universal-diagnostic-oa',
        icon: ShieldCheck,
        badge: 'Free',
      },
      {
        title: 'Scorecards & Forensic Reports',
        description: 'Analyze time spent per problem, anti-cheat flags, and percentile rank.',
        href: '/dashboard',
        icon: BarChart2,
      },
    ],
  },
  {
    id: 'cs-core',
    label: 'CS Core & Revision',
    featured: {
      title: 'Engineering Core Essentials',
      description: 'Crack technical HR & managerial rounds with conceptual mastery of systems.',
      href: '/subjects',
      tag: 'Placement Prep',
    },
    items: [
      {
        title: 'Operating Systems',
        description: 'Concurrency, deadlocks, virtual memory, and process scheduling.',
        href: '/subjects',
        icon: Cpu,
      },
      {
        title: 'DBMS & SQL',
        description: 'B-Trees, indexing internals, transactions, and ACID properties.',
        href: '/subjects',
        icon: Database,
      },
      {
        title: 'Computer Networks',
        description: 'TCP 3-way handshake, DNS resolution, HTTP/3, and WebSockets.',
        href: '/subjects',
        icon: Network,
      },
      {
        title: 'Subject Interview Practice',
        description: 'Topic-wise interview questions asked by top tech employers.',
        href: '/interview',
        icon: BookOpen,
      },
    ],
  },
];

export function Navbar() {
  const { data: session } = authClient.useSession();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Close dropdown on escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3.5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl bg-card/75 dark:bg-card/60 backdrop-blur-2xl border border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 relative before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-500/30 before:to-transparent">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <BigOLogo size="md" showBadge={false} />
        </Link>

        {/* Desktop Nav with Hovering Smooth Dropdowns */}
        <nav
          className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/40 relative"
          onMouseLeave={handleMouseLeave}
        >
          {NAV_CATEGORIES.map((category) => {
            const isOpen = activeDropdown === category.id;
            return (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.id)}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(isOpen ? null : category.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-200 outline-none cursor-pointer',
                    isOpen
                      ? 'text-primary bg-primary/10 dark:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                  )}
                  aria-expanded={isOpen}
                >
                  <span>{category.label}</span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform duration-250 ease-out',
                      isOpen && 'rotate-180 text-primary'
                    )}
                  />
                </button>

                {/* Dropdown Menu Flyout */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                      className="absolute top-full left-0 mt-2 w-[540px] -translate-x-12 rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/80 p-4 shadow-2xl z-50 overflow-hidden"
                      onMouseEnter={() => handleMouseEnter(category.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Ambient corner glow */}
                      <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-primary/10 blur-2xl" />

                      <div className="grid grid-cols-12 gap-4 relative z-10">
                        {/* Main Link Items */}
                        <div className="col-span-7 space-y-1">
                          {category.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary/10 transition-colors"
                              >
                                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                  <Icon className="size-4" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Featured Sidebar Column */}
                        {category.featured && (
                          <div className="col-span-5 flex flex-col justify-between rounded-xl bg-surface-sunken/80 border border-border/60 p-4">
                            <div className="space-y-2">
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/15 text-primary">
                                {category.featured.tag}
                              </span>
                              <h4 className="text-xs font-bold text-foreground leading-snug">
                                {category.featured.title}
                              </h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {category.featured.description}
                              </p>
                            </div>

                            <Link
                              href={category.featured.href}
                              onClick={() => setActiveDropdown(null)}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors group/link"
                            >
                              <span>Explore Now</span>
                              <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Direct Link: Pricing */}
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-card/80"
          >
            <span>Pricing</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
              PRO
            </span>
          </Link>
        </nav>

        {/* Right Controls: Theme Toggle & Auth */}
        <div className="flex items-center gap-3">
          <AnimatedThemeToggle />

          {session ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <UserMenu collapsed={true} isAdmin={(session.user as { role?: string })?.role === 'admin'} />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/sign-in">
                <button className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-accent/50 cursor-pointer">
                  Log In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 transition-all active:scale-95 cursor-pointer">
                  <span>Get Started</span>
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with Accordion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mt-2 max-w-7xl mx-auto rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/60 p-4 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {NAV_CATEGORIES.map((cat) => {
                const isExpanded = expandedMobileCategory === cat.id;
                return (
                  <div key={cat.id} className="rounded-xl border border-border/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span>{cat.label}</span>
                      <ChevronDown
                        className={cn('size-3.5 transition-transform duration-200', isExpanded && 'rotate-180 text-primary')}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-surface-sunken/60 px-3 py-2 space-y-1.5"
                        >
                          {cat.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon className="size-4 text-muted-foreground" />
                                  <span className="text-xs font-semibold">{item.title}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[10px] font-bold text-emerald-500 uppercase">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl border border-border/40 text-xs font-bold text-foreground hover:bg-muted/40"
              >
                <span>Pricing & Pro Access</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  PRO
                </span>
              </Link>

              {!session && (
                <div className="flex flex-col gap-2 pt-3 border-t border-border/40 mt-2">
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 text-center text-xs font-bold text-foreground rounded-xl border border-border/60 bg-card hover:bg-muted/60">
                      Log In
                    </button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-2.5 text-center text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl shadow-sm">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
