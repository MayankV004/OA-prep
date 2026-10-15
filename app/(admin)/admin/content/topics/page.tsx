'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Image as ImageIcon, FileText, Upload, BookOpen, Layers } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { MarkdownView } from '@/components/markdown/View';
import remarkGfm from 'remark-gfm';

import { DataTable, type Column } from '@/components/admin/DataTable';
import { SlideOver } from '@/components/admin/SlideOver';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { PageHeading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface SubjectGroup {
  _id: string;
  name: string;
  slug: string;
  kind: string;
  body?: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface TopicNote {
  _id: string;
  title: string;
  body?: string;
  groupId: string;
  tags?: string[];
  updatedAt?: string;
  createdAt?: string;
}

function relative(value?: string) {
  if (!value) return '—';
  try {
    return formatDistanceToNow(parseISO(value), { addSuffix: true });
  } catch {
    return '—';
  }
}

export default function AdminTopicsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'topics' | 'subjects'>('topics');
  const [search, setSearch] = useState('');

  // Topic SlideOver state
  const [topicSlideOverOpen, setTopicSlideOverOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicNote | null>(null);
  const [confirmingDeleteTopic, setConfirmingDeleteTopic] = useState<TopicNote | null>(null);

  // Subject SlideOver state
  const [subjectSlideOverOpen, setSubjectSlideOverOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectGroup | null>(null);
  const [confirmingDeleteSubject, setConfirmingDeleteSubject] = useState<SubjectGroup | null>(null);

  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [topicFormData, setTopicFormData] = useState({
    title: '',
    groupId: '',
    body: '',
  });

  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    slug: '',
    kind: 'subject',
    description: '',
  });

  // 1. Fetch Groups (Subjects and Advanced Tracks) with cache: 'no-store' to guarantee fresh data
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<SubjectGroup[]>({
    queryKey: ['admin', 'groups'],
    queryFn: async () => {
      const res = await fetch('/api/groups', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch groups');
      return res.json();
    },
  });

  // 2. Fetch Topics
  const { data: topicsResponse, isLoading: topicsLoading, error: topicsError } = useQuery<{ data: TopicNote[] }>({
    queryKey: ['admin', 'topics', search],
    queryFn: async () => {
      const url = search ? `/api/admin/content/topics?q=${encodeURIComponent(search)}` : '/api/admin/content/topics';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch topics');
      return res.json();
    },
  });

  const topics = topicsResponse?.data || [];

  // Filter subjects by search
  const filteredSubjects = subjects.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
  });

  // Topic Save Mutation (Create / Update)
  const saveTopicMutation = useMutation({
    mutationFn: async (payload: { id?: string; title: string; groupId: string; body: string }) => {
      const isEdit = Boolean(payload.id);
      const url = isEdit ? `/api/topics/${payload.id}` : '/api/admin/content/topics';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message || 'Failed to save topic note');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.add(editingTopic ? 'Topic note updated' : 'Topic note created', { type: 'success' });
      setTopicSlideOverOpen(false);
      resetTopicForm();
    },
    onError: (err: any) => {
      toast.add('Failed to save topic note', { description: err.message, type: 'error' });
    },
  });

  // Topic Delete Mutation
  const deleteTopicMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete topic note');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.add('Topic note deleted', { type: 'success' });
      setConfirmingDeleteTopic(null);
    },
    onError: (err: any) => {
      toast.add("Couldn't delete topic note", { description: err.message, type: 'error' });
    },
  });

  // Subject / Track Save Mutation
  const saveSubjectMutation = useMutation({
    mutationFn: async (payload: { id?: string; name: string; slug?: string; kind?: string; description?: string }) => {
      const isEdit = Boolean(payload.id);
      const url = isEdit ? `/api/groups/${payload.id}` : '/api/groups';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? payload : { ...payload, kind: payload.kind || 'subject' }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message || 'Failed to save subject / track');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.add(editingSubject ? 'Subject updated' : 'Subject created', {
        description: editingSubject ? 'Subject details updated successfully.' : 'Subject created. You can now add topic notes to this subject.',
        type: 'success',
      });
      setSubjectSlideOverOpen(false);
      resetSubjectForm();
    },
    onError: (err: any) => {
      toast.add('Failed to save subject', { description: err.message, type: 'error' });
    },
  });

  // Subject Delete Mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subject/track');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'taxonomies'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.add('Subject deleted', { type: 'success' });
      setConfirmingDeleteSubject(null);
    },
    onError: (err: any) => {
      toast.add("Couldn't delete subject", { description: err.message, type: 'error' });
    },
  });

  const resetTopicForm = () => {
    setEditingTopic(null);
    setTopicFormData({ title: '', groupId: subjects[0]?._id || '', body: '' });
    setEditorTab('edit');
  };

  const resetSubjectForm = () => {
    setEditingSubject(null);
    setSubjectFormData({ name: '', slug: '', kind: 'subject', description: '' });
  };

  const handleOpenCreateTopic = (preselectedGroupId?: string) => {
    resetTopicForm();
    const defaultGroup = preselectedGroupId || subjects[0]?._id || '';
    setTopicFormData({ title: '', groupId: defaultGroup, body: '' });
    setTopicSlideOverOpen(true);
  };

  const handleOpenEditTopic = (topic: TopicNote) => {
    setEditingTopic(topic);
    setTopicFormData({
      title: topic.title,
      groupId: topic.groupId,
      body: topic.body || '',
    });
    setEditorTab('edit');
    setTopicSlideOverOpen(true);
  };

  const handleOpenCreateSubject = () => {
    resetSubjectForm();
    setSubjectSlideOverOpen(true);
  };

  const handleOpenEditSubject = (subject: SubjectGroup) => {
    setEditingSubject(subject);
    setSubjectFormData({
      name: subject.name,
      slug: subject.slug,
      kind: subject.kind || 'subject',
      description: subject.description || '',
    });
    setSubjectSlideOverOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      if (!res.ok) throw new Error('Image upload failed');
      const { url } = await res.json();
      const imageMarkdown = `\n![${file.name.replace(/\.[^/.]+$/, '')}](${url})\n`;

      setTopicFormData((prev) => ({ ...prev, body: prev.body + imageMarkdown }));
      toast.add('Image attached', { type: 'success' });
    } catch (err: any) {
      toast.add('Image upload failed', { description: err.message, type: 'error' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Topic Columns
  const topicColumns: Column<TopicNote>[] = [
    {
      id: 'title',
      header: 'Topic Note Title',
      primary: true,
      sortValue: (row) => row.title,
      cell: (row) => {
        const parentSubject = subjects.find((s) => s._id === row.groupId || s.slug === row.groupId);
        return (
          <div className="min-w-0">
            <span className="block truncate font-bold text-foreground text-sm" title={row.title}>
              {row.title}
            </span>
            <span className="block truncate text-xs text-rose-500 font-mono">
              Subject: {parentSubject ? parentSubject.name : row.groupId}
            </span>
          </div>
        );
      },
    },
    {
      id: 'contentLength',
      header: 'Markdown Size',
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-500 font-mono text-xs font-bold">
          {row.body ? `${row.body.length} chars` : 'Empty note'}
        </span>
      ),
    },
    {
      id: 'updatedAt',
      header: 'Last Updated',
      hideBelow: 'md',
      sortValue: (row) => row.updatedAt ?? null,
      cell: (row) => (
        <Text as="span" size="caption" tone="muted" numeric>
          {relative(row.updatedAt)}
        </Text>
      ),
    },
  ];

  // Subject Columns
  const subjectColumns: Column<SubjectGroup>[] = [
    {
      id: 'name',
      header: 'Subject Name',
      primary: true,
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold text-foreground text-sm">
              {row.name}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-3xs font-mono font-bold uppercase tracking-wider border',
                row.kind === 'advanced'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              )}
            >
              {row.kind === 'advanced' ? 'Advanced Track' : 'Core Subject'}
            </span>
          </div>
          <span className="block truncate text-xs text-muted-foreground font-mono mt-0.5">
            {row.kind === 'advanced' ? `/advanced/${row.slug}` : `/subjects/${row.slug}`}
          </span>
          {row.description && (
            <span className="block truncate text-xs text-muted-foreground mt-0.5 max-w-md">
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'topicCount',
      header: 'Topics Count',
      cell: (row) => {
        const count = topics.filter((t) => t.groupId === row._id || t.groupId === row.slug).length;
        return (
          <span className="px-2.5 py-1 rounded-xl bg-muted/60 text-foreground font-mono text-xs font-semibold">
            {count} {count === 1 ? 'topic' : 'topics'}
          </span>
        );
      },
    },
    {
      id: 'updatedAt',
      header: 'Last Updated',
      hideBelow: 'md',
      sortValue: (row) => row.updatedAt ?? null,
      cell: (row) => (
        <Text as="span" size="caption" tone="muted" numeric>
          {relative(row.updatedAt)}
        </Text>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeading
        overline="Admin Control Panel"
        title="Subjects & Topics Content Manager"
        description="Create and edit Markdown concept notes for each CS Subject."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleOpenCreateSubject}
              className="rounded-xl border-border/40 font-semibold gap-1.5"
            >
              <Plus className="size-4" />
              <span>New Subject</span>
            </Button>
            <Button
              onClick={() => handleOpenCreateTopic()}
              className="rounded-xl font-semibold gap-1.5"
            >
              <Plus className="size-4" />
              <span>New Topic Note</span>
            </Button>
          </div>
        }
      />

      {/* Navigation Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/40 border border-border/30 w-fit">
        <button
          onClick={() => setActiveTab('topics')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'topics'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="size-3.5" />
          <span>All Topic Notes ({topics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'subjects'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <BookOpen className="size-3.5" />
          <span>Manage Subjects ({subjects.length})</span>
        </button>
      </div>

      {activeTab === 'topics' ? (
        <DataTable
          data={topics}
          columns={topicColumns}
          getRowId={(row) => row._id}
          loading={topicsLoading}
          error={topicsError}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search topic notes by title or content…"
          emptyTitle="No topic notes created yet"
          emptyDescription="Click 'New Topic Note' to add concept notes under any subject."
          emptyIcon={FileText}
          emptyAction={
            <Button onClick={() => handleOpenCreateTopic()} className="rounded-xl font-semibold">
              <Plus className="size-4" />
              New Topic Note
            </Button>
          }
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenEditTopic(row)}
              >
                <Edit className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-rose-500"
                onClick={() => setConfirmingDeleteTopic(row)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
          pageSize={15}
        />
      ) : (
        <DataTable
          data={filteredSubjects}
          columns={subjectColumns}
          getRowId={(row) => row._id}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search subjects by name or slug…"
          emptyTitle="No subjects created yet"
          emptyDescription="Click 'New Subject' to create your first CS Subject."
          emptyIcon={BookOpen}
          emptyAction={
            <Button onClick={handleOpenCreateSubject} className="rounded-xl font-semibold">
              <Plus className="size-4" />
              New Subject
            </Button>
          }
          rowActions={(row) => (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1 border-border/40 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30"
                onClick={() => handleOpenCreateTopic(row._id)}
                title="Add Topic Note under this subject"
              >
                <Plus className="size-3.5" />
                <span>Add Topic</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleOpenEditSubject(row)}
                title="Edit Subject"
              >
                <Edit className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-rose-500"
                onClick={() => setConfirmingDeleteSubject(row)}
                title="Delete Subject"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
          pageSize={15}
        />
      )}

      {/* 1. Topic Note SlideOver */}
      <SlideOver
        open={topicSlideOverOpen}
        onOpenChange={setTopicSlideOverOpen}
        title={editingTopic ? `Edit Note: ${editingTopic.title}` : 'Create New Topic Note'}
        description="Write concept notes in Markdown format."
        width="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setTopicSlideOverOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saveTopicMutation.isPending || !topicFormData.title || !topicFormData.groupId}
              onClick={() =>
                saveTopicMutation.mutate({
                  id: editingTopic?._id,
                  ...topicFormData,
                })
              }
              className="rounded-xl font-semibold"
            >
              {saveTopicMutation.isPending ? 'Saving...' : editingTopic ? 'Update Topic Note' : 'Create Topic Note'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Target Subject Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="topic-group" className="font-semibold text-foreground">
                Target Subject *
              </Label>
              <button
                type="button"
                onClick={() => {
                  setTopicSlideOverOpen(false);
                  handleOpenCreateSubject();
                }}
                className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:underline"
              >
                + New Subject
              </button>
            </div>
            {subjects.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs">
                No subjects created yet. Please create a subject first before adding topics.
              </div>
            ) : (
              <select
                id="topic-group"
                value={topicFormData.groupId}
                onChange={(e) => setTopicFormData({ ...topicFormData, groupId: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/40 text-sm font-medium focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="" disabled>Select a subject...</option>
                {subjects.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} ({g.slug})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Topic Title */}
          <div className="space-y-2">
            <Label htmlFor="topic-title" className="font-semibold text-foreground">
              Topic Title
            </Label>
            <Input
              id="topic-title"
              placeholder="e.g. Process vs Thread & Multithreading"
              value={topicFormData.title}
              onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Markdown Content & Image Attach */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/20">
                <button
                  type="button"
                  onClick={() => setEditorTab('edit')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                    editorTab === 'edit'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Markdown Edit
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('preview')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                    editorTab === 'preview'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Live Preview
                </button>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl text-xs font-semibold gap-1.5 border-border/40"
                >
                  {uploadingImage ? <Upload className="size-3.5 animate-spin" /> : <ImageIcon className="size-3.5 text-rose-500" />}
                  <span>{uploadingImage ? 'Uploading...' : 'Attach Image'}</span>
                </Button>
              </div>
            </div>

            {editorTab === 'edit' ? (
              <Textarea
                rows={16}
                placeholder="Write Markdown concept note content..."
                value={topicFormData.body}
                onChange={(e) => setTopicFormData({ ...topicFormData, body: e.target.value })}
                className="font-mono text-sm leading-relaxed rounded-2xl border-border/40"
              />
            ) : (
              <div className="p-6 rounded-2xl bg-background/80 border border-border/30 min-h-[300px] max-h-[500px] overflow-y-auto">
                <MarkdownView content={topicFormData.body || 'No content written yet.'} />
              </div>
            )}
          </div>
        </div>
      </SlideOver>

      {/* 2. Subject SlideOver */}
      <SlideOver
        open={subjectSlideOverOpen}
        onOpenChange={setSubjectSlideOverOpen}
        title={editingSubject ? `Edit ${editingSubject.name}` : 'Create New Subject'}
        description="Configure subject or advanced track details. All concept notes are created as Topic Notes inside this subject."
        width="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setSubjectSlideOverOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={saveSubjectMutation.isPending || !subjectFormData.name.trim()}
              onClick={() =>
                saveSubjectMutation.mutate({
                  id: editingSubject?._id,
                  ...subjectFormData,
                })
              }
              className="rounded-xl font-semibold"
            >
              {saveSubjectMutation.isPending ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="s-kind" className="font-semibold text-foreground">
              Category Type
            </Label>
            <select
              id="s-kind"
              value={subjectFormData.kind}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, kind: e.target.value })}
              className="w-full h-11 rounded-xl bg-background border border-border/40 px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
            >
              <option value="subject">Core Subject (/subjects)</option>
              <option value="advanced">Advanced Topic Track (/advanced)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-name" className="font-semibold text-foreground">
              Subject Name *
            </Label>
            <Input
              id="s-name"
              placeholder="e.g. Operating Systems"
              value={subjectFormData.name}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-slug" className="font-semibold text-foreground">
              URL Slug (Optional)
            </Label>
            <Input
              id="s-slug"
              placeholder="e.g. operating-systems (auto-generated if empty)"
              value={subjectFormData.slug}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, slug: e.target.value })}
              className="h-11 rounded-xl font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-desc" className="font-semibold text-foreground">
              Description / Overview (Optional)
            </Label>
            <Textarea
              id="s-desc"
              rows={4}
              placeholder="Brief summary of this subject (e.g. Processes, threads, memory management, virtual memory, and I/O scheduling)..."
              value={subjectFormData.description}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
              className="rounded-xl text-sm leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Shown on the subject syllabus page. High-yield notes and concepts are added as individual Topic Notes.
            </p>
          </div>
        </div>
      </SlideOver>

      {/* Confirm Delete Dialogs */}
      <ConfirmDialog
        open={Boolean(confirmingDeleteTopic)}
        onOpenChange={(open) => !open && setConfirmingDeleteTopic(null)}
        itemName={confirmingDeleteTopic?.title ?? 'this topic note'}
        action="delete"
        pending={deleteTopicMutation.isPending}
        onConfirm={() => confirmingDeleteTopic && deleteTopicMutation.mutate(confirmingDeleteTopic._id)}
      />

      <ConfirmDialog
        open={Boolean(confirmingDeleteSubject)}
        onOpenChange={(open) => !open && setConfirmingDeleteSubject(null)}
        itemName={confirmingDeleteSubject?.name ?? 'this subject'}
        action="delete"
        pending={deleteSubjectMutation.isPending}
        onConfirm={() => confirmingDeleteSubject && deleteSubjectMutation.mutate(confirmingDeleteSubject._id)}
      />
    </div>
  );
}
