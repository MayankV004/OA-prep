'use client';

import { use, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Shield, FileCode2 } from 'lucide-react';
import { ReaderLayout } from '@/components/reader/ReaderLayout';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Cheatsheet {
  _id: string;
  title: string;
  slug: string;
  body?: string;
  tags?: string[];
  updatedAt: string;
  createdAt?: string;
}

function relative(value?: string) {
  if (!value) return undefined;
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return undefined;
  }
}

export default function CheatsheetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  // Fetch all sheets from backend API
  const { data: sheets = [], isLoading } = useQuery<Cheatsheet[]>({
    queryKey: ['cheatsheets'],
    queryFn: async () => {
      const res = await fetch('/api/cheatsheets');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const sheet = sheets.find((s) => s.slug === slug);

  // Compute Next & Previous cheatsheets
  const { prevSheet, nextSheet } = useMemo(() => {
    if (!sheets.length || !sheet) return { prevSheet: null, nextSheet: null };
    const currentIndex = sheets.findIndex((s) => s.slug === sheet.slug);
    if (currentIndex === -1) return { prevSheet: null, nextSheet: null };

    const prev = currentIndex > 0 ? sheets[currentIndex - 1] : null;
    const next = currentIndex < sheets.length - 1 ? sheets[currentIndex + 1] : null;

    return {
      prevSheet: prev
        ? {
            title: prev.title,
            href: `/cheatsheets/${prev.slug}`,
            subtitle: 'Previous Cheat Sheet',
          }
        : null,
      nextSheet: next
        ? {
            title: next.title,
            href: `/cheatsheets/${next.slug}`,
            subtitle: 'Next Cheat Sheet',
          }
        : null,
    };
  }, [sheets, sheet]);

  // Download PDF via Browser Print engine
  const handleDownloadPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4 max-w-4xl">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <Skeleton className="h-5 w-64 rounded-lg" />
        <div className="space-y-4 pt-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="py-12">
        <Card className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-12 text-center shadow-xs">
          <CardContent className="p-0">
            <EmptyState
              icon={FileCode2}
              title="Cheat Sheet Not Found"
              description="The requested cheat sheet document could not be found or may have been relocated."
              action={
                <Link
                  href="/cheatsheets"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-xs"
                >
                  Return to Cheat Sheets
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* ── Print Specific Styles ──────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          header, sidebar, nav, aside, .no-print, [role="navigation"] {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          main {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <ReaderLayout
        title={sheet.title}
        category="Cheat Sheets"
        categoryHref="/cheatsheets"
        content={sheet.body || ''}
        updatedAt={relative(sheet.updatedAt || sheet.createdAt)}
        prevItem={prevSheet}
        nextItem={nextSheet}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border/50 bg-card/60 hover:bg-card text-foreground text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Printer className="size-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {isAdmin && (
              <Link
                href="/admin/content/cheatsheets"
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all shadow-2xs"
              >
                <Shield className="size-3.5" />
                <span className="hidden sm:inline">Admin Edit</span>
              </Link>
            )}
          </div>
        }
      >
        {sheet.tags && sheet.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-b border-border/20 pb-4 mb-6">
            <span className="text-2xs font-mono uppercase text-muted-foreground mr-1">Tags:</span>
            {sheet.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-2xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </ReaderLayout>
    </>
  );
}

