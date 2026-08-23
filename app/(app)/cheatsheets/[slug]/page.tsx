'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Tag, Download, Printer, Shield, ExternalLink, Calendar } from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  body?: string;
  tags?: string[];
  updatedAt: string;
}

export default function CheatsheetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  // Fetch sheet by slug from backend API
  const { data: sheets = [], isLoading } = useQuery<Cheatsheet[]>({
    queryKey: ['cheatsheets'],
    queryFn: async () => {
      const res = await fetch('/api/cheatsheets');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const sheet = sheets.find((s) => s.slug === slug);

  // Download PDF via Browser Print engine
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* ── Print Specific Styles ──────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          /* Hide app shell layout elements */
          header, sidebar, nav, .no-print, [role="navigation"] {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .printable-cheatsheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* ── Top Control Bar (Hidden on Print) ──────────────────────────── */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/cheatsheets"
            className="grid size-10 shrink-0 place-items-center rounded-2xl border border-border/60 bg-background/80 text-foreground transition-all hover:border-rose-500/50 hover:text-rose-500 hover:-translate-x-0.5 shadow-sm"
            aria-label="Back to cheat sheets"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">
                CHEAT SHEET REFERENCE
              </span>
              {sheet?.slug && (
                <code className="rounded-md bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-500">
                  /{sheet.slug}
                </code>
              )}
            </div>
            <Heading level="section" as="h1" className="min-w-0 truncate text-2xl sm:text-4xl font-black font-display tracking-tight text-foreground">
              {sheet?.title ?? 'Loading...'}
            </Heading>
          </div>
        </div>

        {/* Action Controls: PDF Download & Admin Edit Link */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleDownloadPDF}
            variant="soft"
            size="sm"
            className="rounded-xl gap-2 font-semibold border border-border/40 hover:border-rose-500/40 hover:text-rose-500"
          >
            <Printer className="size-4 text-rose-500" />
            <span>Download PDF / Print</span>
          </Button>

          {isAdmin && (
            <Link href="/admin/content/cheatsheets">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 font-semibold text-xs border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
              >
                <Shield className="size-3.5" />
                Edit in Admin Panel
                <ExternalLink className="size-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Metadata & Tags Bar ───────────────────────────────────────── */}
      {!isLoading && sheet && (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground bg-background/40 backdrop-blur-md p-3.5 rounded-2xl border border-border/30">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="size-3.5 text-rose-500" />
            {sheet.tags && sheet.tags.length > 0 ? (
              sheet.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 font-semibold rounded-lg text-xs"
                >
                  #{tag}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground italic">No tags specified</span>
            )}
          </div>

          {sheet.updatedAt && (
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Updated {formatDistanceToNow(parseISO(sheet.updatedAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Full Width Printable Cheat Sheet Content View ─────────────── */}
      <div className="printable-cheatsheet w-full min-h-[70vh] rounded-3xl border border-border/40 bg-background/60 dark:bg-background/30 backdrop-blur-xl p-6 sm:p-10 shadow-sm">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-11/12 rounded-lg" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
          </div>
        ) : !sheet ? (
          <EmptyState
            icon={FileText}
            title="Cheat Sheet Not Found"
            description="The cheat sheet document you are looking for does not exist or has been removed."
            action={
              <Link href="/cheatsheets">
                <Button variant="soft">Return to Cheat Sheets</Button>
              </Link>
            }
          />
        ) : (
          <div className="w-full">
            {/* Header visible only on PDF print */}
            <div className="hidden print:block mb-8 border-b pb-4">
              <h1 className="text-3xl font-bold">{sheet.title}</h1>
              <p className="text-xs text-gray-500 mt-1">BigO Platform Reference Guide &bull; {sheet.slug}</p>
            </div>

            {sheet.body ? (
              <div className="w-full prose-content max-w-none">
                <MarkdownView content={sheet.body} />
              </div>
            ) : (
              <EmptyState
                compact
                icon={FileText}
                title="Empty Cheat Sheet"
                description="This cheat sheet does not contain any content yet."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
