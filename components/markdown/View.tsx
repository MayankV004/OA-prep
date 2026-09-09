'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { sanitizeSchema } from '@/lib/markdown/sanitize';
import { Mermaid } from './Mermaid';
import {
  Check,
  Copy,
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { highlightCode } from '@/lib/shiki';

const InsidePreContext = createContext<boolean>(false);

interface MarkdownConfig {
  allowCopy: boolean;
  variant: 'default' | 'exam';
}

const MarkdownConfigContext = createContext<MarkdownConfig>({
  allowCopy: true,
  variant: 'default',
});

/* ── Code Block Component ───────────────────────────────────────────────── */
function CodeBlock({ code, language }: { code: string; language: string }) {
  const { allowCopy, variant } = useContext(MarkdownConfigContext);
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (language && language !== 'mermaid' && code) {
      highlightCode(code, language)
        .then((html) => {
          if (isMounted && html) {
            setHighlightedHtml(html);
          }
        })
        .catch(() => {
          // Fallback to unhighlighted rendering on error
        });
    }
    return () => {
      isMounted = false;
    };
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (language === 'mermaid') {
    return <Mermaid chart={code} />;
  }

  // In exam / test mode, or when copy is disabled:
  // Render a clean monospace example card matching LeetCode / HackerRank (no window dots, no Copy button)
  if (variant === 'exam' || !allowCopy) {
    return (
      <div className="my-3 overflow-hidden rounded-xl border border-border/70 bg-card/60 p-3.5 font-mono text-xs sm:text-sm text-foreground/90 leading-relaxed shadow-2xs">
        {highlightedHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className="[&_pre]:m-0! [&_pre]:bg-transparent! [&_pre]:p-0! [&_code]:bg-transparent! [&_code]:p-0!"
          />
        ) : (
          <pre className="m-0 bg-transparent p-0 font-mono text-xs sm:text-sm whitespace-pre text-foreground/90">
            <code>{code}</code>
          </pre>
        )}
      </div>
    );
  }

  const displayLang = language ? language.toUpperCase() : 'CODE';

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-border/80 bg-[#090D12] text-zinc-100 shadow-e2 relative group">
      {/* Specular Top Border Beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0D1219]/90 px-4 py-2.5 text-xs select-none backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="font-mono text-2xs font-bold uppercase tracking-wider text-zinc-400">
            {displayLang}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
          aria-label={copied ? 'Code copied' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-primary" />
              <span className="text-primary font-bold text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-zinc-100">
        {highlightedHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className="[&_pre]:m-0! [&_pre]:bg-transparent! [&_pre]:p-0! [&_code]:bg-transparent! [&_code]:p-0!"
          />
        ) : (
          <pre className="m-0 bg-transparent p-0 font-mono text-xs sm:text-sm whitespace-pre text-zinc-100">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function PreComponent({ children }: any) {
  return (
    <InsidePreContext.Provider value={true}>
      {children}
    </InsidePreContext.Provider>
  );
}

function CodeComponent({ node, className, children, ...props }: any) {
  const isInsidePre = useContext(InsidePreContext);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  if (isInsidePre) {
    return <CodeBlock code={codeContent} language={language} />;
  }

  // Refined Emerald-tinted inline code snippet styling
  return (
    <code
      className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary dark:text-emerald-400 font-mono text-[12px] sm:text-[12.5px] font-semibold border border-primary/20 break-words shadow-2xs"
      {...props}
    >
      {children}
    </code>
  );
}

/* ── GitHub-style Alert Callout / Blockquote Component ──────────────────── */
function BlockquoteComponent({ children }: any) {
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node?.props?.children) return extractText(node.props.children);
    return '';
  };

  const rawText = extractText(children).trim();
  const match = rawText.match(/^\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);

  if (match) {
    const type = match[1].toUpperCase();
    const cleanChildren = React.Children.map(children, (child) => {
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
        const pText = extractText(child.props.children);
        const newText = pText.replace(/^\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim();
        return React.cloneElement(child as React.ReactElement<any>, {}, newText);
      }
      return child;
    });

    const configs = {
      NOTE: {
        border: 'border-l-4 border-sky-500 bg-sky-500/10 text-sky-950 dark:text-sky-200 border-border/40',
        icon: <Info className="size-4 text-sky-500 shrink-0 mt-0.5" />,
        title: 'Note',
      },
      TIP: {
        border: 'border-l-4 border-primary bg-primary/10 text-emerald-950 dark:text-emerald-200 border-border/40',
        icon: <Lightbulb className="size-4 text-primary shrink-0 mt-0.5" />,
        title: 'Tip',
      },
      IMPORTANT: {
        border: 'border-l-4 border-purple-500 bg-purple-500/10 text-purple-950 dark:text-purple-200 border-border/40',
        icon: <AlertCircle className="size-4 text-purple-500 shrink-0 mt-0.5" />,
        title: 'Important',
      },
      WARNING: {
        border: 'border-l-4 border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 border-border/40',
        icon: <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />,
        title: 'Warning',
      },
      CAUTION: {
        border: 'border-l-4 border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-200 border-border/40',
        icon: <ShieldAlert className="size-4 text-rose-500 shrink-0 mt-0.5" />,
        title: 'Caution',
      },
    };

    const cfg = configs[type as keyof typeof configs] || configs.NOTE;

    return (
      <div className={`my-5 flex items-start gap-3.5 rounded-2xl border p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm backdrop-blur-md ${cfg.border}`}>
        {cfg.icon}
        <div className="flex-1 space-y-1">
          <div className="font-mono text-2xs font-bold uppercase tracking-wider">{cfg.title}</div>
          <div className="[&_p]:m-0 leading-relaxed font-normal">{cleanChildren}</div>
        </div>
      </div>
    );
  }

  return (
    <blockquote className="my-5 border-l-3 border-primary/70 bg-primary/[0.04] px-5 py-3.5 text-foreground/90 italic rounded-r-2xl border-y border-r border-border/30 text-xs sm:text-sm leading-relaxed shadow-2xs">
      {children}
    </blockquote>
  );
}

export const defaultMarkdownComponents = {
  pre: PreComponent,
  code: CodeComponent,
  blockquote: BlockquoteComponent,
  h1: ({ children }: any) => {
    const text = typeof children === 'string' ? children : '';
    const id = text ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') : undefined;
    return (
      <h1 id={id} className="group font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-8 mb-4 pb-2 border-b border-border/50 scroll-mt-20">
        <a href={id ? `#${id}` : undefined} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
          <span>{children}</span>
          {id && <span className="opacity-0 group-hover:opacity-60 text-muted-foreground text-sm font-normal">#</span>}
        </a>
      </h1>
    );
  },
  h2: ({ children }: any) => {
    const text = typeof children === 'string' ? children : '';
    const id = text ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') : undefined;
    return (
      <h2 id={id} className="group font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-7 mb-3 pb-1 border-b border-border/30 scroll-mt-20">
        <a href={id ? `#${id}` : undefined} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
          <span>{children}</span>
          {id && <span className="opacity-0 group-hover:opacity-60 text-muted-foreground text-sm font-normal">#</span>}
        </a>
      </h2>
    );
  },
  h3: ({ children }: any) => {
    const text = typeof children === 'string' ? children : '';
    const id = text ? text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') : undefined;
    return (
      <h3 id={id} className="group font-display text-lg sm:text-xl font-bold text-foreground mt-6 mb-2 scroll-mt-20">
        <a href={id ? `#${id}` : undefined} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
          <span>{children}</span>
          {id && <span className="opacity-0 group-hover:opacity-60 text-muted-foreground text-xs font-normal">#</span>}
        </a>
      </h3>
    );
  },
  h4: ({ children }: any) => (
    <h4 className="font-display text-base font-bold text-foreground mt-5 mb-2">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-1">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-1">
      {children}
    </h6>
  ),
  p: ({ children }: any) => (
    <p className="my-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
      {children}
    </p>
  ),
  table: ({ children }: any) => (
    <div className="my-6 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-e1">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">{children}</table>
      </div>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border-b border-border/70 bg-muted/80 px-4 py-3 font-mono font-bold text-foreground text-2xs uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border-b border-border/30 px-4 py-3 text-foreground/90 last:border-0 hover:bg-muted/40 transition-colors">
      {children}
    </td>
  ),
  ul: ({ children }: any) => (
    <ul className="my-3.5 list-disc pl-6 space-y-1.5 text-xs sm:text-sm text-foreground/90 leading-relaxed marker:text-primary">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-3.5 list-decimal pl-6 space-y-1.5 text-xs sm:text-sm text-foreground/90 leading-relaxed marker:font-mono marker:font-bold marker:text-primary">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed pl-1">{children}</li>
  ),
  details: ({ children, ...props }: any) => (
    <details
      className="group my-4 rounded-2xl border border-border/70 bg-card/60 p-4 transition-all open:bg-card open:shadow-e1"
      {...props}
    >
      {children}
    </details>
  ),
  summary: ({ children, ...props }: any) => (
    <summary
      className="flex cursor-pointer items-center justify-between font-bold text-xs sm:text-sm text-foreground select-none outline-none group-hover:text-primary transition-colors"
      {...props}
    >
      <span>{children}</span>
      <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary" />
    </summary>
  ),
  hr: () => (
    <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
  ),
  kbd: ({ children }: any) => (
    <kbd className="px-2 py-0.5 text-2xs font-mono font-bold rounded-md bg-muted border border-border/80 shadow-2xs text-foreground inline-block">
      {children}
    </kbd>
  ),
  input: ({ type, checked, disabled, ...props }: any) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          readOnly
          className="mr-2.5 rounded border-border text-primary focus:ring-primary/40 size-4 align-middle accent-primary cursor-default shadow-2xs"
          {...props}
        />
      );
    }
    return <input type={type} {...props} />;
  },
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors inline-flex items-center gap-0.5"
      {...props}
    >
      <span>{children}</span>
      <ExternalLink className="size-3 opacity-70" />
    </a>
  ),
};

interface MarkdownViewProps {
  content: string;
  allowCopy?: boolean;
  variant?: 'default' | 'exam';
}

export function MarkdownView({
  content,
  allowCopy = true,
  variant = 'default',
}: MarkdownViewProps) {
  return (
    <MarkdownConfigContext.Provider value={{ allowCopy, variant }}>
      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
          components={defaultMarkdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </MarkdownConfigContext.Provider>
  );
}
