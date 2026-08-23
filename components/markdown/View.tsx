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
} from 'lucide-react';
import { highlightCode } from '@/lib/shiki';

const InsidePreContext = createContext<boolean>(false);

/* ── Code Block Component ───────────────────────────────────────────────── */
function CodeBlock({ code, language }: { code: string; language: string }) {
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

  const displayLang = language ? language.toUpperCase() : 'CODE';

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117] text-zinc-100 shadow-md">
      {/* Header toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-4 py-2 text-xs select-none">
        <div className="flex items-center gap-2">
          {/* Mac window dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="size-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="size-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="size-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="font-mono text-2xs font-semibold tracking-wider text-zinc-400">
            {displayLang}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label={copied ? 'Code copied' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed">
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

  // Inline code snippet styling
  return (
    <code
      className="px-1.5 py-0.5 rounded-md bg-muted/80 text-rose-600 dark:text-rose-400 font-mono text-xs sm:text-sm font-semibold border border-border/40 break-words shadow-2xs"
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
        border: 'border-blue-500/50 dark:border-blue-500/40 bg-blue-500/10 text-blue-900 dark:text-blue-200',
        icon: <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />,
        title: 'Note',
      },
      TIP: {
        border: 'border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
        icon: <Lightbulb className="size-4 text-emerald-500 shrink-0 mt-0.5" />,
        title: 'Tip',
      },
      IMPORTANT: {
        border: 'border-purple-500/50 dark:border-purple-500/40 bg-purple-500/10 text-purple-900 dark:text-purple-200',
        icon: <AlertCircle className="size-4 text-purple-500 shrink-0 mt-0.5" />,
        title: 'Important',
      },
      WARNING: {
        border: 'border-amber-500/50 dark:border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200',
        icon: <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />,
        title: 'Warning',
      },
      CAUTION: {
        border: 'border-rose-500/50 dark:border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-200',
        icon: <ShieldAlert className="size-4 text-rose-500 shrink-0 mt-0.5" />,
        title: 'Caution',
      },
    };

    const cfg = configs[type as keyof typeof configs] || configs.NOTE;

    return (
      <div className={`my-4 flex items-start gap-3 rounded-xl border-l-4 p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${cfg.border}`}>
        {cfg.icon}
        <div className="flex-1 space-y-1">
          <div className="font-semibold text-xs uppercase tracking-wider">{cfg.title}</div>
          <div className="[&_p]:m-0">{cleanChildren}</div>
        </div>
      </div>
    );
  }

  return (
    <blockquote className="my-4 border-l-4 border-primary/60 bg-muted/30 px-4 py-2.5 text-foreground/90 italic rounded-r-xl">
      {children}
    </blockquote>
  );
}

export const defaultMarkdownComponents = {
  pre: PreComponent,
  code: CodeComponent,
  blockquote: BlockquoteComponent,
  h1: ({ children }: any) => (
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-8 mb-4 pb-2 border-b border-border/40">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-7 mb-3 pb-1 border-b border-border/30">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-6 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-base font-semibold text-foreground mt-4 mb-2">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-3 mb-1">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-3 mb-1">
      {children}
    </h6>
  ),
  table: ({ children }: any) => (
    <div className="my-5 overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">{children}</table>
      </div>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border-b border-border/60 bg-muted/70 px-4 py-2.5 font-semibold text-foreground text-2xs uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border-b border-border/30 px-4 py-2.5 text-foreground/90 last:border-0 hover:bg-muted/30 transition-colors">
      {children}
    </td>
  ),
  ul: ({ children }: any) => (
    <ul className="my-3 list-disc pl-6 space-y-1.5 text-foreground/90 leading-relaxed">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-3 list-decimal pl-6 space-y-1.5 text-foreground/90 leading-relaxed">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed">{children}</li>
  ),
  hr: () => (
    <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  ),
  kbd: ({ children }: any) => (
    <kbd className="px-1.5 py-0.5 text-2xs font-mono font-semibold rounded-md bg-muted border border-border/80 shadow-2xs text-foreground">
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
}

export function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={defaultMarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}



