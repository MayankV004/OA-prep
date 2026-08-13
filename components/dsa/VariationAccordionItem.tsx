import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TemplateCodeBlock } from "./TemplateCodeBlock";
import { ProblemList } from "./ProblemList";
import { Problem } from "@/components/problem/ProblemRow";
import { PatternVariation } from "@/types/pattern";
import ReactMarkdown from 'react-markdown';
import { Layers } from "lucide-react";

interface VariationAccordionItemProps {
  variation: PatternVariation;
  problems: Problem[];
  html: string; // The HTML of the code block generated on the server
  onToggleComplete?: (problemId: string, completed: boolean) => void;
}

export function VariationAccordionItem({ variation, problems, html, onToggleComplete }: VariationAccordionItemProps) {
  const completedCount = problems.filter(p => p.completed).length;
  const totalCount = problems.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <AccordionItem value={variation.id} className="border border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden mt-5 shadow-sm transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-primary/20 data-[state=open]:bg-card/80 group">
      <AccordionTrigger className="bg-transparent border-b-0 hover:no-underline px-6 py-5">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3 text-lg font-bold group-data-[state=open]:text-primary transition-colors">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            {variation.title}
          </div>
          {totalCount > 0 && (
            <div className="flex items-center gap-3 text-sm font-normal text-muted-foreground">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="w-12 text-right">{progressPercentage}%</span>
              </div>
              <span className="bg-muted/50 px-2.5 py-1 rounded-md text-xs font-semibold">
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-0 border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="p-6 text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{variation.concept}</ReactMarkdown>
        </div>

        {variation.templateCode && html && (
          <div className="px-6 pb-6 pt-2">
            <div className="rounded-xl overflow-hidden border border-border/40 shadow-sm">
               <TemplateCodeBlock code={variation.templateCode} html={html} className="rounded-none border-none shadow-none" />
            </div>
          </div>
        )}

        <div className="bg-card/30 mt-2">
          <div className="px-6 py-4 border-y border-border/40 bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60"></span>
              Practice Problems
            </h3>
          </div>
          <div className="px-2 pb-2">
            <ProblemList problems={problems} onToggleComplete={onToggleComplete} />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
