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
import { cn } from '@/lib/utils';
import { visit } from 'unist-util-visit';

const InsidePreContext = createContext<boolean>(false);
const InsideCodeTabsContext = createContext<boolean>(false);

interface MarkdownConfig {
  allowCopy: boolean;
  variant: 'default' | 'exam';
}

const MarkdownConfigContext = createContext<MarkdownConfig>({
  allowCopy: true,
  variant: 'default',
});

/* ── Language label formatter ───────────────────────────────────────────── */
function formatLanguageLabel(lang: string): string {
  const lower = (lang || '').toLowerCase();
  switch (lower) {
    case 'cpp':
    case 'c++':
      return 'C++';
    case 'java':
      return 'Java';
    case 'python':
    case 'python3':
    case 'py':
      return 'Python3';
    case 'typescript':
    case 'ts':
      return 'TypeScript';
    case 'javascript':
    case 'js':
      return 'JavaScript';
    case 'c':
      return 'C';
    case 'csharp':
    case 'cs':
      return 'C#';
    case 'go':
    case 'golang':
      return 'Go';
    case 'rust':
    case 'rs':
      return 'Rust';
    case 'kotlin':
    case 'kt':
      return 'Kotlin';
    default:
      return lang ? lang.toUpperCase() : 'CODE';
  }
}

/* ── LeetCode-style Code Tabs Group ─────────────────────────────────────── */
function CodeTabsGroup({ children }: { children: React.ReactNode }) {
  const childArray = React.Children.toArray(children);
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const { allowCopy, variant } = useContext(MarkdownConfigContext);

  const tabs = childArray.map((child: any) => {
    const codeChild = child?.props?.children;
    const className = codeChild?.props?.className || child?.props?.className || '';
    const match = /language-([a-zA-Z0-9_+-]+)/.exec(className);
    const rawLang = match ? match[1] : '';
    return {
      rawLang,
      label: formatLanguageLabel(rawLang),
    };
  });

  const activeChild = childArray[activeIdx] || childArray[0];

  const handleCopy = async () => {
    try {
      const activeCode = extractText(activeChild);
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="my-6 overflow-hidden rounded-2xl border border-border/80 bg-[#090D12] text-zinc-100 shadow-e2 relative group"
    >
      {/* Specular Top Border Beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* LeetCode-style Tab Header Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0D1219]/90 px-3 py-2 text-xs select-none backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(idx);
              }}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer',
                activeIdx === idx
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {allowCopy && variant !== 'exam' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
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
        )}
      </div>

      {/* Code Body */}
      <InsideCodeTabsContext.Provider value={true}>
        {activeChild}
      </InsideCodeTabsContext.Provider>
    </div>
  );
}

/* ── Code Block Component ───────────────────────────────────────────────── */
function CodeBlock({ code, language }: { code: string; language: string }) {
  const { allowCopy, variant } = useContext(MarkdownConfigContext);
  const isInsideTabs = useContext(InsideCodeTabsContext);
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

  // Inside a tabbed group: render only the code body without duplicate container/header
  if (isInsideTabs) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-zinc-100"
      >
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
    );
  }

  // In exam / test mode, or when copy is disabled:
  // Render a clean monospace example card matching LeetCode / HackerRank (no window dots, no Copy button)
  if (variant === 'exam' || !allowCopy) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-3 overflow-hidden rounded-xl border border-border/70 bg-card/60 p-3.5 font-mono text-xs sm:text-sm text-foreground/90 leading-relaxed shadow-2xs"
      >
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
    <div
      onClick={(e) => e.stopPropagation()}
      className="my-6 overflow-hidden rounded-2xl border border-border/80 bg-[#090D12] text-zinc-100 shadow-e2 relative group"
    >
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
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
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

function extractText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node?.props?.children) return extractText(node.props.children);
  return '';
}

/* ── GitHub-style Alert Callout / Blockquote Component ──────────────────── */
function BlockquoteComponent({ children }: any) {
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
    const text = extractText(children).trim();
    const id = text
      ? text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : undefined;
    return (
      <h1 id={id} className="group font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground mt-10 mb-5 pb-3 border-b border-border/50 scroll-mt-24">
        <a href={id ? `#${id}` : undefined} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
          <span>{children}</span>
          {id && <span className="opacity-0 group-hover:opacity-60 text-muted-foreground text-sm font-normal">#</span>}
        </a>
      </h1>
    );
  },
  h2: ({ children }: any) => {
    const text = extractText(children).trim();
    const id = text
      ? text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : undefined;
    return (
      <h2 id={id} className="group font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-9 mb-4 pb-2 border-b border-border/30 scroll-mt-24">
        <a href={id ? `#${id}` : undefined} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
          <span>{children}</span>
          {id && <span className="opacity-0 group-hover:opacity-60 text-muted-foreground text-sm font-normal">#</span>}
        </a>
      </h2>
    );
  },
  h3: ({ children }: any) => {
    const text = extractText(children).trim();
    const id = text
      ? text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : undefined;
    return (
      <h3 id={id} className="group font-display text-lg sm:text-xl font-bold text-foreground mt-7 mb-3 scroll-mt-24">
        <a href={id ? `#${id}` : undefined} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
          <span>{children}</span>
          {id && <span className="opacity-0 group-hover:opacity-60 text-muted-foreground text-xs font-normal">#</span>}
        </a>
      </h3>
    );
  },
  h4: ({ children }: any) => (
    <h4 className="font-display text-base sm:text-lg font-bold text-foreground mt-6 mb-2">
      {children}
    </h4>
  ),
  h5: ({ children }: any) => (
    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mt-5 mb-2">
      {children}
    </h5>
  ),
  h6: ({ children }: any) => (
    <h6 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground mt-5 mb-2">
      {children}
    </h6>
  ),
  p: ({ children }: any) => (
    <p className="my-4 text-[15px] sm:text-[16px] text-foreground/90 leading-[1.8] font-normal tracking-[0.01em]">
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
    <ul className="my-4 list-disc pl-6 space-y-2 text-[15px] sm:text-[16px] text-foreground/90 leading-[1.75] marker:text-primary">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-4 list-decimal pl-6 space-y-2 text-[15px] sm:text-[16px] text-foreground/90 leading-[1.75] marker:font-mono marker:font-bold marker:text-primary">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-[1.75] pl-1 text-foreground/90">{children}</li>
  ),
  div: ({ className, children, ...props }: any) => {
    if (className?.includes('code-tabs-group')) {
      return <CodeTabsGroup>{children}</CodeTabsGroup>;
    }
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  },
  details: ({ children, ...props }: any) => (
    <details
      className="group my-5 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 transition-all open:bg-card open:shadow-e1"
      {...props}
    >
      {children}
    </details>
  ),
  summary: ({ children, ...props }: any) => (
    <summary
      className="flex cursor-pointer items-center justify-between font-bold text-sm sm:text-base text-foreground select-none outline-none group-hover:text-primary transition-colors"
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

/* ── Rehype plugin to group consecutive code blocks into code-tabs-group ── */
function rehypeCodeTabs() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (!node.children || !Array.isArray(node.children)) return;
      if (node.tagName === 'div' && node.properties?.className?.includes('code-tabs-group')) return;

      const newChildren: any[] = [];
      let currentGroup: any[] = [];

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        if (child.type === 'element' && child.tagName === 'pre') {
          currentGroup.push(child);
        } else if (child.type === 'text' && child.value.trim() === '' && currentGroup.length > 0) {
          continue;
        } else {
          if (currentGroup.length > 1) {
            newChildren.push({
              type: 'element',
              tagName: 'div',
              properties: { className: ['code-tabs-group'] },
              children: currentGroup,
            });
          } else if (currentGroup.length === 1) {
            newChildren.push(currentGroup[0]);
          }
          currentGroup = [];
          newChildren.push(child);
        }
      }

      if (currentGroup.length > 1) {
        newChildren.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-tabs-group'] },
          children: currentGroup,
        });
      } else if (currentGroup.length === 1) {
        newChildren.push(currentGroup[0]);
      }

      node.children = newChildren;
    });
  };
}

interface MarkdownViewProps {
  content: string;
  allowCopy?: boolean;
  variant?: 'default' | 'exam';
  fontSize?: 'compact' | 'default' | 'comfortable';
  className?: string;
}

export function MarkdownView({
  content,
  allowCopy = true,
  variant = 'default',
  fontSize = 'default',
  className = '',
}: MarkdownViewProps) {
  const fontClass =
    fontSize === 'compact'
      ? 'text-[14px] leading-[1.7]'
      : fontSize === 'comfortable'
      ? 'text-[17px] sm:text-[18px] leading-[1.85]'
      : 'text-[15.5px] sm:text-[16px] leading-[1.8]';

  return (
    <MarkdownConfigContext.Provider value={{ allowCopy, variant }}>
      <div className={`prose dark:prose-invert max-w-none text-foreground ${fontClass} ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypeCodeTabs]}
          components={defaultMarkdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </MarkdownConfigContext.Provider>
  );
}
