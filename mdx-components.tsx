import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold tracking-tight text-foreground mt-8 mb-4 pb-2 border-b border-border/50">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3 flex items-center gap-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold text-foreground mt-6 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-muted-foreground leading-7 mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-muted-foreground space-y-1.5 mb-4 ml-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-muted-foreground space-y-1.5 mb-4 ml-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-7">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-4 bg-primary/5 rounded-r-lg text-muted-foreground italic">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    code: ({ children, ...props }) => {
      // Inline code (not inside pre)
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <div className="relative group my-4">
        <pre
          className="overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 text-sm font-mono"
          {...props}
        >
          {children}
        </pre>
      </div>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-medium text-muted-foreground bg-muted/50 border-b border-border">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-muted-foreground border-b border-border/50">
        {children}
      </td>
    ),
    hr: () => <hr className="my-8 border-border/50" />,
    ...components,
  };
}
