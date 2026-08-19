import { Info } from "lucide-react";
import { MarkdownView } from "@/components/markdown/View";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExplanationBlock({ text }: { text: string }) {
  if (!text) return null;
  return (
    <Card>
      <CardHeader className="-mt-(--card-spacing) rounded-t-xl bg-surface-sunken py-(--card-spacing)">
        <CardTitle className="flex items-center gap-2">
          <Info aria-hidden className="size-4 text-primary" />
          Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-text-secondary">
        <MarkdownView content={text} />
      </CardContent>
    </Card>
  );
}
