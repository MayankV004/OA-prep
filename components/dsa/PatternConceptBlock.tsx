import { BookOpen } from "lucide-react";
import { MarkdownView } from "@/components/markdown/View";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatternConceptBlock({ concept }: { concept: string }) {
  return (
    <Card>
      <CardHeader className="-mt-(--card-spacing) rounded-t-xl bg-surface-sunken py-(--card-spacing)">
        <CardTitle className="flex items-center gap-2">
          <BookOpen aria-hidden className="size-4 text-primary" />
          Concept
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-text-secondary">
        <MarkdownView content={concept} />
      </CardContent>
    </Card>
  );
}
