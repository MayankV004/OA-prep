'use client';

import { use, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  HelpCircle,
  Search,
  BookOpen,
  Copy,
  Check,
  Eye,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Group {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Question {
  _id: string;
  question: string;
  answer?: string;
  tags?: string[];
  createdAt?: string;
}

function QuestionDrillCard({
  q,
  index,
  isDrillMode,
  isOpen,
  onToggle,
}: {
  q: Question;
  index: number;
  isDrillMode: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `Question:\n${q.question}\n\nAnswer:\n${q.answer || 'N/A'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Question and answer copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHeaderClick = () => {
    onToggle();
    if (!isOpen) {
      setRevealed(false);
    }
  };

  const padIndex = String(index + 1).padStart(2, '0');

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-2xl border transition-all duration-200 backdrop-blur-xl',
        isOpen
          ? 'border-emerald-500/40 bg-card shadow-lg shadow-emerald-500/5'
          : 'border-border/30 bg-card/60 hover:bg-card/90 hover:border-border/60 shadow-xs'
      )}
    >
      <button
        type="button"
        onClick={handleHeaderClick}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <span className="shrink-0 font-mono text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Q{padIndex}
          </span>
          <div className="space-y-2 min-w-0 flex-1">
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-emerald-400 transition-colors">
              {q.question}
            </h3>

            {q.tags && q.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {q.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-2xs font-mono px-2 py-0.5 rounded-full border border-border/40 bg-muted/40 text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy question and answer"
            className="p-1.5 rounded-lg border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-border/40 transition-colors"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
          <div
            className={cn(
              'size-7 rounded-lg grid place-items-center border border-border/40 bg-background/50 text-muted-foreground transition-all duration-200',
              isOpen && 'rotate-180 text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            )}
          >
            <ChevronDown className="size-4" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border/30 bg-card/40 p-5 sm:p-7">
          {isDrillMode && !revealed ? (
            <div className="py-6 px-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 text-center space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Self-Test Drill Active</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Take a moment to formulate your answer mentally or write down key bullet points. When ready, reveal the solution.
                </p>
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs gap-1.5 shadow-xs"
              >
                <Eye className="size-3.5" />
                Reveal Model Answer
              </Button>
            </div>
          ) : q.answer ? (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border/20">
                <span className="text-2xs font-mono uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="size-3" />
                  Model Answer & Explanation
                </span>
                {isDrillMode && (
                  <button
                    type="button"
                    onClick={() => setRevealed(false)}
                    className="text-2xs font-mono text-muted-foreground hover:text-foreground underline"
                  >
                    Hide again
                  </button>
                )}
              </div>
              <div className="pt-2">
                <MarkdownView content={q.answer} fontSize="default" />
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
              No answer provided for this question yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewSubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = use(params);
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDrillMode, setIsDrillMode] = useState(false);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  // Add Question Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newTags, setNewTags] = useState('');

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const group = groups.find((g) => g.slug === slug);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['questions', { subjectId: group?._id }],
    queryFn: async () => {
      if (!group) return [];
      const res = await fetch(`/api/questions?subjectId=${group._id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!group,
  });

  // Create Question Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: { question: string; answer: string; tags: string[]; subjectId: string }) => {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create question');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setIsAddOpen(false);
      setNewQuestion('');
      setNewAnswer('');
      setNewTags('');
      toast.success('Interview question added successfully');
    },
    onError: () => {
      toast.error('Failed to add question. Please try again.');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group?._id || !newQuestion.trim()) return;
    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createMutation.mutate({
      subjectId: group._id,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      tags: tagsArray,
    });
  };

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        !searchQuery.trim() ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !selectedTag || (q.tags && q.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [questions, searchQuery, selectedTag]);

  const toggleAll = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    if (expand) {
      filteredQuestions.forEach((q) => {
        next[q._id] = true;
      });
    }
    setOpenIds(next);
  };

  const handleToggleCard = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-5 border-b border-border/50">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-2xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            <GraduationCap className="size-3.5 inline" />
            <span>Interview Drill Bank</span>
            <span className="text-border">·</span>
            <span>/{group?.slug || slug}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {group?.name || slug} Questions
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            {questions.length} high-frequency questions with deep explanations and edge cases.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <Link
            href="/interview"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-3.5 py-1.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Sets</span>
          </Link>
          <Button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Question</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Controls & Search Strip ── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter questions or answers..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-2xs"
            />
          </div>

          {/* Mode switch & Expand buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Self-Test Toggle */}
            <button
              type="button"
              onClick={() => setIsDrillMode(!isDrillMode)}
              className={cn(
                'flex items-center gap-2 h-10 px-3.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs cursor-pointer',
                isDrillMode
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                  : 'border-border/40 bg-card/70 text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="size-3.5" />
              <span>Self-Test Drill: {isDrillMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Expand / Collapse All */}
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="h-10 px-3 rounded-xl border border-border/40 bg-card/70 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="h-10 px-3 rounded-xl border border-border/40 bg-card/70 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-2xs font-mono uppercase text-muted-foreground mr-1">Tags:</span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-lg border font-mono transition-all',
                selectedTag === null
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold'
                  : 'border-border/40 bg-card/60 text-muted-foreground hover:text-foreground'
              )}
            >
              All ({questions.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-lg border font-mono transition-all',
                  selectedTag === tag
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold'
                    : 'border-border/40 bg-card/60 text-muted-foreground hover:text-foreground'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Question Cards List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-card/50 border border-border/30 p-5 space-y-2">
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center shadow-xs">
          <EmptyState
            icon={HelpCircle}
            title="No questions in this set yet"
            description="Add your first interview question for this subject and start testing yourself."
            action={
              <Button
                onClick={() => setIsAddOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs gap-1.5 shadow-xs"
              >
                <Plus className="size-3.5" />
                Add Question
              </Button>
            }
          />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center shadow-xs">
          <p className="text-sm text-muted-foreground">
            No questions matched your search query or tag filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="mt-3 text-xs font-semibold text-emerald-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredQuestions.map((q, index) => (
            <QuestionDrillCard
              key={q._id}
              q={q}
              index={index}
              isDrillMode={isDrillMode}
              isOpen={Boolean(openIds[q._id])}
              onToggle={() => handleToggleCard(q._id)}
            />
          ))}
        </div>
      )}

      {/* ── 4. Add Question Dialog ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-xl bg-card border border-border/50 text-foreground p-6 rounded-2xl">
          <form onSubmit={handleAddSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold">Add Interview Question</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add a new question to the {group?.name || slug} question bank. Markdown formatting is supported for the answer.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Question Title</label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Explain how virtual memory and paging work in Linux."
                  className="w-full h-10 px-3.5 rounded-xl bg-background/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Model Answer (Markdown)</label>
                <textarea
                  rows={6}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Write clear, structured explanation with key points, trade-offs, and examples..."
                  className="w-full p-3 rounded-xl bg-background/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 resize-y font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Memory, Linux, Paging, Top50"
                  className="w-full h-10 px-3.5 rounded-xl bg-background/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !newQuestion.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-xs"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
