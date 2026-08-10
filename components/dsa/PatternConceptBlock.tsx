import { BookOpen } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export function PatternConceptBlock({ concept }: { concept: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-sm overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="px-6 py-4 border-b border-border/50 bg-muted/40 relative">
        <h2 className="font-semibold text-base flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-primary" />
          Concept
        </h2>
      </div>
      <div className="p-6 text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none relative">
        <ReactMarkdown>{concept}</ReactMarkdown>
      </div>
    </div>
  );
}
