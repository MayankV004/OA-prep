'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Save,
  Loader2,
  Blocks,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Problem {
  _id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  link?: string;
  priority?: string;
  company_tags?: string[];
}

interface Variation {
  _id: string;
  variation: string;
  description?: string;
  important_details?: string[];
  template_code?: string;
  other_relevant_details?: string;
  problems?: Problem[];
}

interface Pattern {
  _id: string;
  title: string;
  slug: string;
  variations?: Variation[];
}

const DIFF_STYLE: Record<string, string> = {
  Easy: 'bg-success-muted text-success',
  Medium: 'bg-warning-muted text-warning',
  Hard: 'bg-destructive/10 text-destructive',
};

const EMPTY_VARIATION = { variation: '', description: '', important_details: '', template_code: '', other_relevant_details: '' };
type ProblemFormData = { name: string; difficulty: 'Easy' | 'Medium' | 'Hard'; platform: string; link: string; priority: string; company_tags: string };
const EMPTY_PROBLEM: ProblemFormData = { name: '', difficulty: 'Easy', platform: 'LeetCode', link: '', priority: '', company_tags: '' };

/* ── Problem form ───────────────────────────────────────────────────────── */
function ProblemForm({ initial, onSave, onCancel, saving }: {
  initial: ProblemFormData;
  onSave: (d: ProblemFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState(initial);
  const s = (k: string) => (e: any) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-sunken p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="pf-name">Name *</Label>
          <Input id="pf-name" value={f.name} onChange={s('name')} placeholder="Valid Palindrome" />
        </div>
        <div>
          <Label>Difficulty *</Label>
          <select value={f.difficulty} onChange={s('difficulty')} className="mt-1 w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/50">
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>
        <div>
          <Label htmlFor="pf-platform">Platform *</Label>
          <Input id="pf-platform" value={f.platform} onChange={s('platform')} placeholder="LeetCode" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pf-link">Problem URL</Label>
          <Input id="pf-link" value={f.link} onChange={s('link')} type="url" placeholder="https://leetcode.com/problems/..." />
        </div>
        <div>
          <Label htmlFor="pf-priority">Priority</Label>
          <Input id="pf-priority" value={f.priority} onChange={s('priority')} placeholder="High / Medium / Low" />
        </div>
        <div>
          <Label htmlFor="pf-tags">Company Tags (comma-sep)</Label>
          <Input id="pf-tags" value={f.company_tags} onChange={s('company_tags')} placeholder="Google, Meta" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(f)} disabled={saving || !f.name.trim()}>
          {saving ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <Save className="mr-1 size-3.5" />} Save
        </Button>
      </div>
    </div>
  );
}

/* ── Variation panel ────────────────────────────────────────────────────── */
function VariationPanel({ variation, patternSlug, onDeleteVariation }: {
  variation: Variation; patternSlug: string; onDeleteVariation: (id: string) => void;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const qKey = ['admin', 'patterns', patternSlug];
  const [open, setOpen] = useState(false);
  const [editingVar, setEditingVar] = useState(false);
  const [vForm, setVForm] = useState(EMPTY_VARIATION);
  const [addingP, setAddingP] = useState(false);
  const [editPId, setEditPId] = useState<string | null>(null);
  const [delP, setDelP] = useState<Problem | null>(null);

  const startEditVar = () => {
    setVForm({ variation: variation.variation, description: variation.description || '', important_details: (variation.important_details || []).join('\n'), template_code: variation.template_code || '', other_relevant_details: variation.other_relevant_details || '' });
    setEditingVar(true);
  };

  const updateVar = useMutation({
    mutationFn: async (form: typeof EMPTY_VARIATION) => {
      const r = await fetch(`/api/admin/content/patterns/${patternSlug}/variations/${variation._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, important_details: form.important_details.split('\n').map(s => s.trim()).filter(Boolean) }) });
      if (!r.ok) throw new Error('Failed');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast.add('Variation updated', { type: 'success' }); setEditingVar(false); },
    onError: (e: Error) => toast.add('Error', { description: e.message, type: 'error' }),
  });

  const addP = useMutation({
    mutationFn: async (form: ProblemFormData) => {
      const r = await fetch(`/api/admin/content/patterns/${patternSlug}/variations/${variation._id}/problems`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, company_tags: form.company_tags.split(',').map(s => s.trim()).filter(Boolean) }) });
      if (!r.ok) throw new Error('Failed');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast.add('Problem added', { type: 'success' }); setAddingP(false); },
    onError: (e: Error) => toast.add('Error', { description: e.message, type: 'error' }),
  });

  const updateP = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: ProblemFormData }) => {
      const r = await fetch(`/api/admin/content/patterns/${patternSlug}/variations/${variation._id}/problems`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: id, ...form, company_tags: form.company_tags.split(',').map(s => s.trim()).filter(Boolean) }) });
      if (!r.ok) throw new Error('Failed');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast.add('Problem updated', { type: 'success' }); setEditPId(null); },
    onError: (e: Error) => toast.add('Error', { description: e.message, type: 'error' }),
  });

  const delPMut = useMutation({
    mutationFn: async (pid: string) => {
      const r = await fetch(`/api/admin/content/patterns/${patternSlug}/variations/${variation._id}/problems?problemId=${pid}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast.add('Problem deleted', { type: 'success' }); setDelP(null); },
    onError: (e: Error) => toast.add('Error', { description: e.message, type: 'error' }),
  });

  return (
    <Card className="overflow-hidden shadow-e1">
      <div className="flex items-center gap-3 bg-surface-sunken px-4 py-3">
        <button type="button" onClick={() => setOpen(o => !o)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="size-4 shrink-0 text-text-muted" /> : <ChevronRight className="size-4 shrink-0 text-text-muted" />}
          <span className="truncate text-sm font-semibold text-foreground">{variation.variation}</span>
          <Badge variant="secondary" className="shrink-0 tabular-nums">{variation.problems?.length || 0} problems</Badge>
        </button>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={startEditVar} className="grid size-8 place-items-center rounded-lg text-text-muted hover:bg-accent hover:text-accent-foreground"><Pencil className="size-3.5" /></button>
          <button type="button" onClick={() => onDeleteVariation(variation._id)} className="grid size-8 place-items-center rounded-lg text-text-muted hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-3.5" /></button>
        </div>
      </div>

      {open && (
        <CardContent className="space-y-4 pt-4">
          {editingVar && (
            <div className="space-y-3 rounded-xl border border-border bg-surface-sunken p-4">
              <Heading level="overline">Edit Variation</Heading>
              {[['Name *', 'variation', 'input'], ['Description (Markdown)', 'description', 'textarea'], ['Key Details (one per line)', 'important_details', 'textarea'], ['Template Code', 'template_code', 'textarea-mono'], ['Additional Info (Markdown)', 'other_relevant_details', 'textarea']].map(([label, key, type]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  {type === 'input' ? (
                    <Input value={(vForm as any)[key]} onChange={e => setVForm(f => ({ ...f, [key]: e.target.value }))} />
                  ) : (
                    <Textarea rows={type === 'textarea-mono' ? 6 : 4} className={type === 'textarea-mono' ? 'font-mono text-xs' : ''} value={(vForm as any)[key]} onChange={e => setVForm(f => ({ ...f, [key]: e.target.value }))} />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingVar(false)}>Cancel</Button>
                <Button size="sm" onClick={() => updateVar.mutate(vForm)} disabled={updateVar.isPending}>
                  {updateVar.isPending && <Loader2 className="mr-1 size-3.5 animate-spin" />} Save
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text size="caption" tone="muted" weight="medium" className="uppercase tracking-wider">Problems</Text>
              <Button size="sm" variant="ghost" onClick={() => setAddingP(true)}><Plus className="mr-1 size-3.5" /> Add Problem</Button>
            </div>
            {addingP && <ProblemForm initial={EMPTY_PROBLEM} onSave={d => addP.mutate(d)} onCancel={() => setAddingP(false)} saving={addP.isPending} />}
            {!(variation.problems?.length) && !addingP && (
              <div className="rounded-xl border-2 border-dashed border-border py-6 text-center">
                <Text size="caption" tone="muted">No problems yet.</Text>
              </div>
            )}
            {(variation.problems || []).map(prob => (
              <div key={prob._id}>
                {editPId === prob._id ? (
                  <ProblemForm
                    initial={{ name: prob.name, difficulty: prob.difficulty as 'Easy' | 'Medium' | 'Hard', platform: prob.platform, link: prob.link || '', priority: prob.priority || '', company_tags: (prob.company_tags || []).join(', ') }}
                    onSave={d => updateP.mutate({ id: prob._id, form: d })}
                    onCancel={() => setEditPId(null)}
                    saving={updateP.isPending}
                  />
                ) : (
                  <div className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent/40">
                    <Badge variant="secondary" className={`shrink-0 text-xs font-semibold ${DIFF_STYLE[prob.difficulty] || ''}`}>{prob.difficulty}</Badge>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{prob.name}</span>
                    <span className="hidden text-xs text-text-muted sm:inline">· {prob.platform}</span>
                    {prob.link && <a href={prob.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-text-muted hover:text-primary"><ExternalLink className="size-3" /></a>}
                    <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => setEditPId(prob._id)} className="grid size-7 place-items-center rounded text-text-muted hover:bg-accent hover:text-accent-foreground"><Pencil className="size-3.5" /></button>
                      <button type="button" onClick={() => setDelP(prob)} className="grid size-7 place-items-center rounded text-text-muted hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
      {delP && <ConfirmDialog open itemName={delP.name} action="delete" description={`Delete "${delP.name}"? This cannot be undone.`} onConfirm={() => delPMut.mutate(delP._id)} onOpenChange={open => !open && setDelP(null)} />}
    </Card>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function AdminPatternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const toast = useToast();
  const queryClient = useQueryClient();

  const [addingVar, setAddingVar] = useState(false);
  const [vForm, setVForm] = useState(EMPTY_VARIATION);
  const [delVarId, setDelVarId] = useState<string | null>(null);
  const [wipeConfirm, setWipeConfirm] = useState(false);

  const qKey = ['admin', 'patterns', slug];
  const { data, isLoading } = useQuery<Pattern>({
    queryKey: qKey,
    queryFn: async () => {
      const r = await fetch(`/api/admin/content/patterns/${slug}`);
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    enabled: !!slug,
  });

  const addVar = useMutation({
    mutationFn: async (form: typeof EMPTY_VARIATION) => {
      const r = await fetch(`/api/admin/content/patterns/${slug}/variations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, important_details: form.important_details.split('\n').map(s => s.trim()).filter(Boolean) }) });
      if (!r.ok) throw new Error('Failed to add variation');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast.add('Variation added', { type: 'success' }); setAddingVar(false); setVForm(EMPTY_VARIATION); },
    onError: (e: Error) => toast.add('Error', { description: e.message, type: 'error' }),
  });

  const delVar = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/admin/content/patterns/${slug}/variations/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Failed');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qKey }); toast.add('Variation deleted', { type: 'success' }); setDelVarId(null); },
    onError: (e: Error) => toast.add('Error', { description: e.message, type: 'error' }),
  });

  const wipeMut = useMutation({
    mutationFn: async () => {
      const r = await fetch('/api/admin/content/patterns/wipe', { method: 'DELETE', headers: { 'x-confirm-wipe': 'DELETE_ALL_PATTERNS' } });
      if (!r.ok) throw new Error('Wipe failed');
      return r.json();
    },
    onSuccess: (d) => { toast.add('Wiped', { description: `Deleted ${d.deletedCount} pattern(s)`, type: 'success' }); setWipeConfirm(false); router.push('/admin/content/patterns'); },
    onError: (e: Error) => toast.add('Error', { description: e.message, type: 'error' }),
  });

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-6 animate-spin text-text-muted" /></div>;
  if (!data) return null;

  const variations = data.variations || [];
  const totalProblems = variations.reduce((a, v) => a + (v.problems?.length || 0), 0);

  return (
    <div className="space-y-8 pb-24">
      <Link href="/admin/content/patterns" className="group inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground">
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Patterns
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Blocks className="size-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.title}</h1>
          </div>
          <Text size="caption" tone="muted" className="mt-1">
            /{data.slug} · {variations.length} variation{variations.length !== 1 ? 's' : ''} · {totalProblems} problems
          </Text>
        </div>
        <Link href={`/dsa/${data.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-colors">
          <ExternalLink className="size-3" /> Preview
        </Link>
      </div>

      {/* Variations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level="section">Variations</Heading>
          <Button onClick={() => setAddingVar(true)}><Plus className="mr-1.5 size-4" /> Add Variation</Button>
        </div>

        {addingVar && (
          <Card className="shadow-e2">
            <CardHeader><Heading level="overline">New Variation</Heading></CardHeader>
            <CardContent className="space-y-3">
              {[['Name *', 'variation', 'input'], ['Description (Markdown)', 'description', 'textarea'], ['Key Details (one per line)', 'important_details', 'textarea'], ['Template Code', 'template_code', 'textarea-mono'], ['Additional Info', 'other_relevant_details', 'textarea']].map(([label, key, type]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  {type === 'input' ? <Input value={(vForm as any)[key]} onChange={e => setVForm(f => ({ ...f, [key]: e.target.value }))} /> : <Textarea rows={type === 'textarea-mono' ? 6 : 4} className={type === 'textarea-mono' ? 'font-mono text-xs' : ''} value={(vForm as any)[key]} onChange={e => setVForm(f => ({ ...f, [key]: e.target.value }))} />}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={() => { setAddingVar(false); setVForm(EMPTY_VARIATION); }}>Cancel</Button>
                <Button onClick={() => addVar.mutate(vForm)} disabled={addVar.isPending || !vForm.variation.trim()}>
                  {addVar.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />} Save Variation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {variations.length === 0 && !addingVar && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
            <Blocks className="size-10 text-text-muted" />
            <p className="mt-3 text-sm font-medium">No variations yet</p>
            <p className="mt-1 text-xs text-text-muted">Click "Add Variation" to create the first one.</p>
          </div>
        )}

        <div className="space-y-3">
          {variations.map(v => <VariationPanel key={v._id} variation={v} patternSlug={slug} onDeleteVariation={id => setDelVarId(id)} />)}
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <Heading level="overline" className="text-destructive">Danger Zone</Heading>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Text size="caption" tone="muted">Permanently delete <strong>all patterns</strong> from the database. This cannot be undone.</Text>
          <Button variant="destructive" onClick={() => setWipeConfirm(true)}><Trash2 className="mr-1.5 size-4" /> Wipe All Patterns</Button>
        </div>
      </section>

      {delVarId && <ConfirmDialog open itemName="this variation" action="delete" description="This will delete the variation and all its problems. Cannot be undone." confirmLabel="Delete" onConfirm={() => delVar.mutate(delVarId)} onOpenChange={open => !open && setDelVarId(null)} />}
      {wipeConfirm && <ConfirmDialog open itemName="ALL patterns" action="wipe" description="This permanently deletes every pattern, variation, and problem from the database." confirmLabel="Yes, wipe everything" onConfirm={() => wipeMut.mutate()} onOpenChange={open => !open && setWipeConfirm(false)} />}
    </div>
  );
}
