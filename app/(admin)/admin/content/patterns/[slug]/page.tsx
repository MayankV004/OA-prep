'use client';

import { use, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Info, Layers, Plus, Save, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';

interface ProblemFormData {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  link?: string;
  priority?: string;
  company_tags?: string[];
}

interface VariationFormData {
  variation: string;
  description: string;
  template_code: string;
  problems?: ProblemFormData[];
}

interface PatternFormData {
  title: string;
  slug: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  concept: string;
  templateCode: string;
  explanation: string;
  useCases: string;
  variations: VariationFormData[];
}

/** Borderless section shell — surface tone and shadow instead of an outline. */
function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl bg-card p-5 shadow-e2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Heading level="card" as="h2">
            {title}
          </Heading>
          {description ? (
            <Text size="caption" tone="muted">
              {description}
            </Text>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function PatternEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isNew = slug === 'new';
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: pattern, isLoading } = useQuery({
    queryKey: ['admin', 'patterns', slug],
    queryFn: async () => {
      if (isNew) return null;
      const res = await fetch(`/api/admin/content/patterns/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !isNew,
  });

  const { register, control, handleSubmit, reset } = useForm<PatternFormData>({
    defaultValues: {
      title: '', slug: '', description: '', timeComplexity: '', spaceComplexity: '',
      concept: '', templateCode: '', explanation: '', useCases: '', variations: []
    }
  });

  const { fields: variationFields, append: appendVariation, remove: removeVariation } = useFieldArray({ control, name: 'variations' });

  useEffect(() => {
    if (pattern) {
      reset({
        ...pattern,
        useCases: (pattern.useCases || []).join(', '),
      });
    }
  }, [pattern, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: PatternFormData) => {
      const payload = { ...data, useCases: data.useCases.split(',').map((s: string) => s.trim()).filter(Boolean) };
      const url = isNew ? `/api/admin/content/patterns` : `/api/admin/content/patterns/${slug}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patterns'] });
      toast.add(isNew ? 'Pattern created' : 'Pattern saved', { type: 'success' });
      router.push('/admin/content/patterns');
    },
    onError: (err: unknown) => {
      toast.add(isNew ? "Couldn't create pattern" : "Couldn't save pattern", {
        description: err instanceof Error ? err.message : undefined,
        type: 'error',
      });
    },
  });

  const onSubmit = (data: PatternFormData) => saveMutation.mutate(data);

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="space-y-4 rounded-xl bg-card p-5 shadow-e2">
          <Skeleton className="h-5 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl space-y-6 pb-4">
      {/* Sticky action bar so Save is always in reach on a long form. */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/90 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <Link href="/admin/content/patterns">
          <Button variant="ghost" size="icon-lg" type="button" aria-label="Back to patterns">
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        </Link>

        <div className="min-w-0 flex-1">
          <Heading level="overline">Patterns</Heading>
          <Heading level="section" as="h1" className="truncate">
            {isNew ? 'New pattern' : pattern?.title || 'Edit pattern'}
          </Heading>
        </div>

        <Button type="submit" size="lg" loading={saveMutation.isPending}>
          <Save className="size-4" aria-hidden />
          {isNew ? 'Create' : 'Save changes'}
        </Button>
      </div>

      <Section
        title="Basics"
        description="How the pattern is identified and routed."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pattern-title">Title</Label>
            <Input id="pattern-title" {...register('title', { required: true })} placeholder="e.g. Sliding Window" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern-slug">Slug</Label>
            <Input id="pattern-slug" {...register('slug', { required: true })} placeholder="e.g. sliding_window" className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern-time">Time complexity</Label>
            <Input id="pattern-time" {...register('timeComplexity')} placeholder="e.g. O(N)" className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern-space">Space complexity</Label>
            <Input id="pattern-space" {...register('spaceComplexity')} placeholder="e.g. O(1)" className="font-mono" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern-usecases">Use cases</Label>
          <Input id="pattern-usecases" {...register('useCases')} placeholder="Subarrays, Strings" />
          <Text size="micro" tone="muted">
            Comma separated.
          </Text>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern-description">Description</Label>
          <Textarea id="pattern-description" {...register('description')} rows={3} />
        </div>
      </Section>

      <Section
        title="Teaching content"
        description="What the learner reads before attempting problems."
      >
        <div className="space-y-2">
          <Label htmlFor="pattern-concept">Concept</Label>
          <Textarea id="pattern-concept" {...register('concept')} rows={4} placeholder="Markdown…" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern-template">Template code (Java)</Label>
          <Textarea id="pattern-template" {...register('templateCode')} rows={8} className="font-mono text-xs" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern-explanation">Explanation</Label>
          <Textarea id="pattern-explanation" {...register('explanation')} rows={4} />
        </div>
      </Section>

      <Section
        title="Variations"
        description="Each variation gets its own template and problem set."
        action={
          <Button
            type="button"
            variant="soft"
            size="sm"
            onClick={() => appendVariation({ variation: '', description: '', template_code: '', problems: [] })}
          >
            <Plus className="size-3.5" aria-hidden />
            Add variation
          </Button>
        }
      >
        {variationFields.length === 0 ? (
          <EmptyState
            compact
            icon={Layers}
            title="No variations yet"
            description="Add a variation to give this pattern a concrete shape."
            action={
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={() => appendVariation({ variation: '', description: '', template_code: '', problems: [] })}
              >
                <Plus className="size-3.5" aria-hidden />
                Add variation
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {variationFields.map((field, index) => (
              <div key={field.id} className="relative space-y-4 rounded-xl bg-surface-sunken p-4">
                <div className="flex items-start justify-between gap-3">
                  <Heading level="overline">Variation {index + 1}</Heading>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove variation ${index + 1}`}
                    className="size-11 text-text-muted hover:text-destructive md:size-8"
                    onClick={() => removeVariation(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`variation-${index}-title`}>Variation title</Label>
                  <Input
                    id={`variation-${index}-title`}
                    {...register(`variations.${index}.variation` as const, { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`variation-${index}-description`}>Description</Label>
                  <Textarea
                    id={`variation-${index}-description`}
                    {...register(`variations.${index}.description` as const)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`variation-${index}-template`}>Template code</Label>
                  <Textarea
                    id={`variation-${index}-template`}
                    {...register(`variations.${index}.template_code` as const)}
                    rows={4}
                    className="font-mono text-xs"
                  />
                </div>

                {/* We won't build nested field arrays for problems in this basic version, but it can be done. */}
                <div className="flex items-start gap-2 rounded-lg bg-info-muted p-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
                  <Text size="caption" className="text-info">
                    Problem lists inside a variation need a nested field array — not built yet, and
                    existing problems are preserved on save.
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </form>
  );
}
