'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, BookOpen, Share2, Check, ChevronRight, ChevronLeft, Type, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MarkdownView } from '@/components/markdown/View';

export interface TocHeading {
  id: string;
  title: string;
  level: number;
}

interface ReaderNavigationItem {
  title: string;
  href: string;
  subtitle?: string;
}

interface ReaderLayoutProps {
  title: string;
  category: string;
  categoryHref: string;
  content: string;
  updatedAt?: string;
  prevItem?: ReaderNavigationItem | null;
  nextItem?: ReaderNavigationItem | null;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function ReaderLayout({
  title,
  category,
  categoryHref,
  content,
  updatedAt,
  prevItem,
  nextItem,
  children,
  actions,
}: ReaderLayoutProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [fontSize, setFontSize] = useState<'compact' | 'default' | 'comfortable'>('default');
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Calculate word count and estimated reading time
  const { wordCount, readTimeMinutes } = useMemo(() => {
    const text = content ? content.replace(/[#*`_~\[\]()>-]/g, ' ').trim() : '';
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, readTimeMinutes: minutes };
  }, [content]);

  // 2. Extract Table of Contents from markdown content with unique IDs
  const tocHeadings: TocHeading[] = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const headings: TocHeading[] = [];
    const idCounts = new Map<string, number>();

    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawTitle = match[2].replace(/[*_~`]/g, '').trim();
        let baseId = rawTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (!baseId) baseId = 'section';

        const count = idCounts.get(baseId) || 0;
        const uniqueId = count === 0 ? baseId : `${baseId}-${count}`;
        idCounts.set(baseId, count + 1);

        if (rawTitle) {
          headings.push({ id: uniqueId, title: rawTitle, level });
        }
      }
    }
    return headings;
  }, [content]);

  // 3. Scroll progress & Scroll-spy active heading detection
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      if (tocHeadings.length === 0) return;

      const headingElements = tocHeadings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      const scrollPosition = window.scrollY + 140;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveHeadingId(el.id);
          return;
        }
      }

      if (headingElements.length > 0 && window.scrollY < 200) {
        setActiveHeadingId(headingElements[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocHeadings]);

  // Copy article link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Article link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="relative min-h-screen pb-24">
      {/* ── Top Fixed Reading Progress Indicator ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-muted/40 backdrop-blur-xs">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ── Top Navigation & Breadcrumbs Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border/60 pt-1">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={categoryHref}
            className="group flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-emerald-500/10 hover:border-emerald-500/40 text-muted-foreground hover:text-emerald-500 transition-all shadow-2xs"
            aria-label={`Back to ${category}`}
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>

          <div className="min-w-0 flex items-center gap-2 text-xs font-mono">
            <Link
              href={categoryHref}
              className="text-muted-foreground hover:text-foreground truncate transition-colors uppercase tracking-wider font-semibold"
            >
              {category}
            </Link>
            <span className="text-border text-sm">/</span>
            <span className="text-emerald-500 font-bold truncate">Concept Notes</span>
          </div>
        </div>

        {/* Action controls & Font scale toggle */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {/* Font Size Adjuster */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/50 border border-border/60">
            <button
              type="button"
              onClick={() => setFontSize('compact')}
              className={cn(
                'px-2 py-1 rounded-lg text-2xs font-semibold font-mono transition-all cursor-pointer',
                fontSize === 'compact'
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Compact font"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('default')}
              className={cn(
                'px-2 py-1 rounded-lg text-2xs font-semibold font-mono transition-all cursor-pointer',
                fontSize === 'default'
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Default font"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('comfortable')}
              className={cn(
                'px-2 py-1 rounded-lg text-2xs font-semibold font-mono transition-all cursor-pointer',
                fontSize === 'comfortable'
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Comfortable font"
            >
              A+
            </button>
          </div>

          {/* Share / Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
            title="Copy article link"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {actions}
        </div>
      </div>

      {/* ── Article Header & Reading Metrics ── */}
      <header className="space-y-4 mb-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-2xs font-mono font-bold uppercase tracking-wider">
          <BookOpen className="size-3" />
          <span>{category} Guide</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          {title}
        </h1>

        {/* Metrics Row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-muted-foreground pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-emerald-500" />
            <span>{readTimeMinutes} min read</span>
          </div>

          <div className="flex items-center gap-1.5">
            <AlignLeft className="size-3.5 text-muted-foreground" />
            <span>{wordCount.toLocaleString()} words</span>
          </div>

          {updatedAt && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Updated {updatedAt}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Dual-Rail Main Grid: Prose Column + Sticky TOC Rail ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Main Article Reading Container (8-9 columns) */}
        <main className="xl:col-span-8 min-w-0 max-w-3xl xl:max-w-none">
          <article className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-10 shadow-xs backdrop-blur-xs">
            {content ? (
              <MarkdownView
                content={content}
                fontSize={fontSize}
                className="transition-all"
              />
            ) : (
              children
            )}
          </article>

          {/* ── Bottom Next / Previous Curriculum Navigator ── */}
          {(prevItem || nextItem) && (
            <nav
              aria-label="Curriculum navigation"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/60"
            >
              {prevItem ? (
                <Link
                  href={prevItem.href}
                  className="group flex flex-col p-4 rounded-2xl border border-border/70 bg-card hover:border-emerald-500/40 hover:bg-emerald-500/[0.03] transition-all shadow-2xs"
                >
                  <span className="flex items-center gap-1 text-2xs font-mono font-bold text-muted-foreground group-hover:text-emerald-500 uppercase tracking-wider mb-1">
                    <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
                    Previous Concept
                  </span>
                  <span className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-400 line-clamp-1">
                    {prevItem.title}
                  </span>
                  {prevItem.subtitle && (
                    <span className="text-2xs text-muted-foreground line-clamp-1 mt-0.5 font-light">
                      {prevItem.subtitle}
                    </span>
                  )}
                </Link>
              ) : (
                <div />
              )}

              {nextItem && (
                <Link
                  href={nextItem.href}
                  className="group flex flex-col items-end text-right p-4 rounded-2xl border border-border/70 bg-card hover:border-emerald-500/40 hover:bg-emerald-500/[0.03] transition-all shadow-2xs sm:col-start-2"
                >
                  <span className="flex items-center gap-1 text-2xs font-mono font-bold text-muted-foreground group-hover:text-emerald-500 uppercase tracking-wider mb-1">
                    Next Concept
                    <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-emerald-400 line-clamp-1">
                    {nextItem.title}
                  </span>
                  {nextItem.subtitle && (
                    <span className="text-2xs text-muted-foreground line-clamp-1 mt-0.5 font-light">
                      {nextItem.subtitle}
                    </span>
                  )}
                </Link>
              )}
            </nav>
          )}
        </main>

        {/* Sticky Right-Rail Table of Contents (3-4 columns) */}
        {tocHeadings.length > 0 && (
          <aside className="hidden xl:block xl:col-span-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pl-4 border-l border-border/50 scrollbar-none">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>On This Page</span>
              </div>

              <ul className="space-y-1 text-xs">
                {tocHeadings.map((heading, index) => {
                  const isActive = activeHeadingId === heading.id;
                  return (
                    <li
                      key={`${heading.id}-${index}`}
                      style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
                    >
                      <a
                        href={`#${heading.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el =
                            document.getElementById(heading.id) ||
                            document.getElementById(heading.id.replace(/-\d+$/, ''));
                          if (el) {
                            const y = el.getBoundingClientRect().top + window.scrollY - 90;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                            setActiveHeadingId(heading.id);
                          }
                        }}
                        className={cn(
                          'block py-1 px-2 rounded-lg transition-all font-medium truncate',
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        )}
                        title={heading.title}
                      >
                        {heading.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
