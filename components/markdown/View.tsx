'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { sanitizeSchema } from '@/lib/markdown/sanitize';

interface MarkdownViewProps {
  content: string;
}

export function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          pre: ({ children }) => (
            <pre className="p-5 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs sm:text-sm overflow-x-auto my-6 border border-border/20 shadow-sm leading-relaxed whitespace-pre font-normal">
              {children}
            </pre>
          ),
          code: ({ inline, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="px-2 py-0.5 rounded-lg bg-muted text-rose-500 font-mono text-xs font-semibold border border-border/30" {...props}>
                  {children}
                </code>
              );
            }
            return <code className="font-mono text-xs sm:text-sm whitespace-pre" {...props}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
