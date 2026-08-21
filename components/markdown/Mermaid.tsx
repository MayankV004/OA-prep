'use client';

import { useEffect, useState, useId, useMemo } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

interface MermaidProps {
  chart: string;
}

// In-memory cache to prevent re-rendering flicker when components remount
const svgCache = new Map<string, string>();

export function Mermaid({ chart }: MermaidProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'dark' : 'default';
  const cleanChart = useMemo(() => (chart || '').trim(), [chart]);
  const cacheKey = `${theme}:${cleanChart}`;

  const cachedSvg = svgCache.get(cacheKey);
  const [svg, setSvg] = useState<string>(cachedSvg || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!cachedSvg && Boolean(cleanChart));

  const rawId = useId();
  const cleanId = useMemo(() => rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId]);

  useEffect(() => {
    if (!cleanChart) {
      setSvg('');
      setLoading(false);
      return;
    }

    if (svgCache.has(cacheKey)) {
      setSvg(svgCache.get(cacheKey)!);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const renderChart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: 'strict',
          fontFamily: 'inherit',
        });

        const uniqueId = `mermaid-${cleanId}-${Math.random().toString(36).substring(2, 7)}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, cleanChart);

        svgCache.set(cacheKey, renderedSvg);

        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError(err?.message || 'Failed to render Mermaid diagram');
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [cleanChart, theme, cacheKey, cleanId]);

  if (error) {
    return (
      <div className="my-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm font-mono overflow-x-auto">
        <p className="font-semibold mb-2">Mermaid Rendering Error</p>
        <pre className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{cleanChart}</pre>
      </div>
    );
  }

  if (loading && !svg) {
    return (
      <div className="my-6 p-8 rounded-2xl bg-muted/40 border border-border/30 flex items-center justify-center animate-pulse">
        <span className="text-xs text-muted-foreground font-mono">Rendering diagram…</span>
      </div>
    );
  }

  return (
    <div
      className="my-6 p-4 sm:p-6 rounded-2xl bg-card/60 border border-border/40 overflow-x-auto flex justify-center items-center shadow-sm [&_svg]:max-w-full [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
