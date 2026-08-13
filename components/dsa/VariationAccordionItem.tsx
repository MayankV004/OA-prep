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
    <AccordionItem value={variation._id || variation.id || ''} className="border-b border-border/40 overflow-hidden mt-8 group transition-all duration-300">
      <AccordionTrigger className="bg-transparent hover:no-underline py-6">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-4 text-2xl sm:text-3xl font-black group-data-[state=open]:text-foreground transition-colors duration-300">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm transition-transform duration-300 group-data-[state=open]:scale-105">
              <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            {variation.variation || variation.title}
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

      <AccordionContent className="p-0 border-none bg-transparent">
        <div className="py-6 space-y-8">
          <div className="text-base text-foreground/90 leading-relaxed prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <ReactMarkdown>{variation.description || variation.concept || ''}</ReactMarkdown>
          </div>

          {variation.important_details && variation.important_details.length > 0 && (
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 transition-colors duration-300 hover:bg-primary/10">
              <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-primary" /> Key Details
              </h4>
              <ul className="space-y-2 text-sm text-foreground/80 list-disc list-inside">
                {variation.important_details.map((detail, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <div className="inline prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{detail}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {variation.other_relevant_details && (
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-5 border border-border/50">
              <h4 className="text-sm font-semibold text-foreground/70 mb-2">Additional Information</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{variation.other_relevant_details}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {(variation.template_code || variation.templateCode) && html && (
          <div className="px-6 pb-6">
            <div className="rounded-xl overflow-hidden border border-border/40 shadow-sm relative">
               <div className="absolute top-0 right-0 bg-muted/80 backdrop-blur-sm px-3 py-1 rounded-bl-lg border-b border-l border-border/40 text-xs font-medium text-muted-foreground z-10">
                 Template
               </div>
               <TemplateCodeBlock code={variation.template_code || variation.templateCode || ''} html={html} className="rounded-none border-none shadow-none mt-0" />
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
