import { Info } from "lucide-react";
import { MarkdownView } from "@/components/markdown/View";

export function ExplanationBlock({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="relative rounded-3xl bg-card/80 dark:bg-card/40 border border-border/80 p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Info className="size-4" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">
          Algorithmic Intuition & Explanation
        </h3>
      </div>
      <div className="leading-relaxed text-muted-foreground">
        <MarkdownView content={text} />
      </div>
    </div>
  );
}

