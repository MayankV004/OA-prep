import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TemplateCodeBlock } from "./TemplateCodeBlock";
import { ProblemList } from "./ProblemList";
import { Problem } from "@/components/problem/ProblemRow";
import { PatternVariation } from "@/types/pattern";
import ReactMarkdown from 'react-markdown';
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heading, Text } from "@/components/ui/typography";

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
    <AccordionItem
      value={variation._id || variation.id || ''}
      className="group overflow-hidden rounded-xl border-b-0! bg-card shadow-e1"
    >
      {/* Tinted header — expanded state reads from background + chevron rotation */}
      <AccordionTrigger className="items-center gap-3 rounded-xl bg-surface-sunken px-4 py-3.5 hover:bg-muted aria-expanded:rounded-b-none aria-expanded:bg-accent aria-expanded:text-accent-foreground sm:px-5">
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-primary shadow-e1 transition-transform duration-200 ease-out-quart group-aria-expanded/accordion-trigger:scale-105 sm:size-10"
          >
            <Layers className="size-4 sm:size-5" />
          </span>
          <Heading level="card" as="span" className="min-w-0 truncate text-left sm:text-lg">
            {variation.variation || variation.title}
          </Heading>
        </span>

        {totalCount > 0 && (
          <span className="mr-2 flex shrink-0 items-center gap-2">
            <Text as="span" size="caption" tone="muted" numeric className="hidden sm:inline">
              {progressPercentage}%
            </Text>
            <Badge variant="secondary" className="tabular-nums">
              {completedCount}/{totalCount}
            </Badge>
          </span>
        )}
      </AccordionTrigger>

      <AccordionContent className="pt-0 pb-0">
        <div className="space-y-6 px-4 py-5 sm:px-5">
          {totalCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Text as="span" size="micro" tone="muted" weight="medium">
                  Progress
                </Text>
                <Text as="span" size="micro" tone={progressPercentage === 100 ? 'success' : 'secondary'} weight="medium" numeric>
                  {completedCount} of {totalCount} solved
                </Text>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />
            </div>
          )}

          {(variation.description || variation.concept) && (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed text-text-secondary">
              <ReactMarkdown>{variation.description || variation.concept || ''}</ReactMarkdown>
            </div>
          )}

          {variation.important_details && variation.important_details.length > 0 && (
            <Card size="sm" className="bg-accent shadow-e1">
              <CardHeader>
                <Heading level="overline" className="text-accent-foreground">
                  Key details
                </Heading>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {variation.important_details.map((detail, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground [&_p]:my-0">
                        <ReactMarkdown>{detail}</ReactMarkdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {variation.other_relevant_details && (
            <Card size="sm" className="bg-surface-sunken shadow-e1">
              <CardHeader>
                <Heading level="overline">Additional information</Heading>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary">
                  <ReactMarkdown>{variation.other_relevant_details}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {(variation.template_code || variation.templateCode) && html && (
            <div className="space-y-2">
              <Heading level="overline">Template</Heading>
              <TemplateCodeBlock
                code={variation.template_code || variation.templateCode || ''}
                html={html}
              />
            </div>
          )}
        </div>

        <div className="bg-surface-sunken px-2 pb-2">
          <div className="px-3 py-3">
            <Heading level="overline">Practice problems</Heading>
          </div>
          <ProblemList problems={problems} onToggleComplete={onToggleComplete} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
