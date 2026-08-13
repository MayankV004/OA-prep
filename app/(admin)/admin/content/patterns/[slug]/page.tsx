'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';

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

export default function PatternEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isNew = slug === 'new';
  const router = useRouter();
  const queryClient = useQueryClient();

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
      router.push('/admin/content/patterns');
    }
  });

  const onSubmit = (data: PatternFormData) => saveMutation.mutate(data);

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/patterns">
            <Button variant="ghost" size="icon" type="button"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">{isNew ? 'New Pattern' : 'Edit Pattern'}</h1>
        </div>
        <Button type="submit" className="gap-2" disabled={saveMutation.isPending}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input {...register('title', { required: true })} placeholder="e.g. Sliding Window" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <Input {...register('slug', { required: true })} placeholder="e.g. sliding_window" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Complexity</label>
          <Input {...register('timeComplexity')} placeholder="e.g. O(N)" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Space Complexity</label>
          <Input {...register('spaceComplexity')} placeholder="e.g. O(1)" />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Use Cases (comma separated)</label>
        <Input {...register('useCases')} placeholder="e.g. Subarrays, Strings" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea {...register('description')} rows={3} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Concept (Markdown)</label>
        <Textarea {...register('concept')} rows={4} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Template Code (Java)</label>
        <Textarea {...register('templateCode')} rows={6} className="font-mono text-xs" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Explanation</label>
        <Textarea {...register('explanation')} rows={4} />
      </div>

      <div className="pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Variations</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => appendVariation({ variation: '', description: '', template_code: '', problems: [] })}>
            <Plus className="h-4 w-4 mr-2" /> Add Variation
          </Button>
        </div>

        <div className="space-y-6">
          {variationFields.map((field, index) => (
            <div key={field.id} className="p-4 border border-border rounded-xl bg-muted/10 relative">
              <Button type="button" variant="ghost" size="icon-sm" className="absolute top-2 right-2 text-destructive" onClick={() => removeVariation(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="space-y-4">
                <div className="space-y-2 pr-8">
                  <label className="text-sm font-medium">Variation Title</label>
                  <Input {...register(`variations.${index}.variation` as const, { required: true })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea {...register(`variations.${index}.description` as const)} rows={2} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Code</label>
                  <Textarea {...register(`variations.${index}.template_code` as const)} rows={3} className="font-mono text-xs" />
                </div>
                {/* We won't build nested field arrays for problems in this basic version, but it can be done. */}
                <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                  Problems array editing requires a deeply nested FieldArray (omitted for brevity, but you can add it similar to variations).
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
