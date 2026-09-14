'use client';

import { use, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Star,
  Zap,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import { MarkdownView } from '@/components/markdown/View';
import { Button } from '@/components/ui/button';
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
import { FlashcardDeck } from '@/components/interview/FlashcardDeck';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { InterviewQuestion, FlashcardStatus } from '@/types/interview';

interface Group {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

function QuestionDrillCard({
  q,
  index,
  isDrillMode,
  isOpen,
  onToggle,
  onToggleBookmark,
  onQuickStatus,
}: {
  q: InterviewQuestion;
  index: number;
  isDrillMode: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onToggleBookmark: (id: string, current: boolean) => void;
  onQuickStatus: (id: string, status: FlashcardStatus) => void;
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
      <div
        role="button"
        tabIndex={0}
        onClick={handleHeaderClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <span className="shrink-0 font-mono text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Q{padIndex}
          </span>
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-emerald-400 transition-colors">
                {q.question}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {q.difficulty && (
                <span
                  className={cn(
                    'text-3xs font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider',
                    q.difficulty === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : q.difficulty === 'Medium'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  )}
                >
                  {q.difficulty}
                </span>
              )}

              {q.status && q.status !== 'unseen' && (
                <span
                  className={cn(
                    'text-3xs font-mono font-semibold px-2 py-0.5 rounded-md uppercase',
                    q.status === 'mastered'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-muted/60 text-muted-foreground border border-border/40'
                  )}
                >
                  {q.status}
                </span>
              )}

              {q.companyTags &&
                q.companyTags.map((comp) => (
                  <span
                    key={comp}
                    className="text-3xs font-mono px-2 py-0.5 rounded-md border border-border/40 bg-muted/40 text-muted-foreground font-medium"
                  >
                    {comp}
                  </span>
                ))}

              {q.tags &&
                q.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-3xs font-mono px-2 py-0.5 rounded-md border border-border/30 bg-muted/20 text-muted-foreground/80"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          {/* Star Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(q._id, Boolean(q.bookmarked));
            }}
            title={q.bookmarked ? 'Remove Star' : 'Star Question'}
            className={cn(
              'p-1.5 rounded-lg border transition-colors cursor-pointer',
              q.bookmarked
                ? 'border-yellow-500/40 bg-yellow-500/15 text-yellow-400'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            <Star className={cn('size-3.5', q.bookmarked && 'fill-yellow-400')} />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy question and answer"
            className="p-1.5 rounded-lg border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>

          {/* Expand/Collapse Chevron */}
          <div
            className={cn(
              'size-7 rounded-lg grid place-items-center border border-border/40 bg-background/50 text-muted-foreground transition-all duration-200',
              isOpen && 'rotate-180 text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            )}
          >
            <ChevronDown className="size-4" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/30 bg-card/40 p-5 sm:p-7 space-y-4">
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
          ) : (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
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

              {/* Key Takeaways Box if available */}
              {q.keyPoints && q.keyPoints.length > 0 && (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1.5">
                  <p className="text-2xs font-mono uppercase font-bold text-emerald-400">
                    Key Concepts & Mental Models:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-foreground/90">
                    {q.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Markdown Content */}
              {q.answer ? (
                <div className="pt-1 text-sm">
                  <MarkdownView content={q.answer} fontSize="default" />
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground italic">
                  No model answer provided for this question yet.
                </div>
              )}

              {/* Quick Status Toggler */}
              <div className="pt-3 border-t border-border/20 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground text-2xs">Mastery Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onQuickStatus(q._id, 'learning')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg border text-2xs transition-all cursor-pointer',
                      q.status === 'learning'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 font-bold'
                        : 'border-border/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Learning
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickStatus(q._id, 'mastered')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg border text-2xs transition-all cursor-pointer flex items-center gap-1',
                      q.status === 'mastered'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold'
                        : 'border-border/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <CheckCircle2 className="size-3" />
                    <span>Mastered</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = use(params);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const initialMode = searchParams?.get('mode') === 'list' ? 'list' : 'deck';
  const [viewMode, setViewMode] = useState<'deck' | 'list'>(initialMode);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'due' | 'bookmarked'>('all');
  const [isDrillMode, setIsDrillMode] = useState(false);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  // Add Question Dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newCompanyTags, setNewCompanyTags] = useState('');
  const [newKeyPoints, setNewKeyPoints] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newTags, setNewTags] = useState('');

  // Fetch groups
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups', 'subject'],
    queryFn: async () => {
      const res = await fetch('/api/groups?kind=subject');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const group = groups.find((g) => g.slug === slug);

  // Fetch Questions for this subject
  const { data: questions = [], isLoading } = useQuery<InterviewQuestion[]>({
    queryKey: ['questions', { subjectId: group?._id || slug }],
    queryFn: async () => {
      const targetId = group?._id || slug;
      const res = await fetch(`/api/questions?subjectId=${targetId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: true,
  });

  // Rate Card Mutation (for SRS)
  const rateMutation = useMutation({
    mutationFn: async ({
      questionId,
      confidence,
      status,
    }: {
      questionId: string;
      confidence: number;
      status?: FlashcardStatus;
    }) => {
      const res = await fetch(`/api/questions/${questionId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence, status }),
      });
      if (!res.ok) throw new Error('Failed to update progress');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', 'stats'] });
    },
  });

  // Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ questionId, bookmarked }: { questionId: string; bookmarked: boolean }) => {
      const res = await fetch(`/api/questions/${questionId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked }),
      });
      if (!res.ok) throw new Error('Failed to update bookmark');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', 'stats'] });
    },
  });

  // Create Question Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: {
      question: string;
      answer: string;
      subjectId: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      companyTags: string[];
      tags: string[];
      keyPoints: string[];
    }) => {
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
      queryClient.invalidateQueries({ queryKey: ['questions', 'stats'] });
      setIsAddOpen(false);
      setNewQuestion('');
      setNewAnswer('');
      setNewDifficulty('Medium');
      setNewCompanyTags('');
      setNewKeyPoints('');
      setNewTags('');
      toast.success('Interview question added successfully');
    },
    onError: () => {
      toast.error('Failed to add question. Please try again.');
    },
  });

  const handleRateCard = async (questionId: string, confidence: number, status?: FlashcardStatus) => {
    await rateMutation.mutateAsync({ questionId, confidence, status });
  };

  const handleToggleBookmark = async (questionId: string, currentBookmarked: boolean) => {
    const next = !currentBookmarked;
    await bookmarkMutation.mutateAsync({ questionId, bookmarked: next });
    toast.success(next ? 'Starred card' : 'Removed from starred');
  };

  const handleQuickStatus = async (questionId: string, status: FlashcardStatus) => {
    await rateMutation.mutateAsync({
      questionId,
      confidence: status === 'mastered' ? 4 : 2,
      status,
    });
    toast.success(`Marked as ${status}`);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group?._id || !newQuestion.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const companyArray = newCompanyTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const keyPointsArray = newKeyPoints
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    createMutation.mutate({
      subjectId: group._id,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      difficulty: newDifficulty,
      companyTags: companyArray,
      tags: tagsArray,
      keyPoints: keyPointsArray,
    });
  };

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [questions]);

  // Filtered questions for list mode
  const filteredQuestions = useMemo(() => {
    const now = new Date();
    return questions.filter((q) => {
      const matchesSearch =
        !searchQuery.trim() ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.companyTags?.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
      const matchesTag = !selectedTag || (q.tags && q.tags.includes(selectedTag));

      let matchesScope = true;
      if (scopeFilter === 'bookmarked') {
        matchesScope = Boolean(q.bookmarked);
      } else if (scopeFilter === 'due') {
        if (q.status === 'unseen') matchesScope = true;
        else if (q.status === 'mastered') matchesScope = false;
        else if (!q.nextReviewAt) matchesScope = true;
        else matchesScope = new Date(q.nextReviewAt) <= now;
      }

      return matchesSearch && matchesDifficulty && matchesTag && matchesScope;
    });
  }, [questions, searchQuery, selectedDifficulty, selectedTag, scopeFilter]);

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

  const masteredCount = questions.filter((q) => q.status === 'mastered').length;
  const masteryPct = questions.length > 0 ? Math.round((masteredCount / questions.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. Top Header Strip ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-5 border-b border-border/50">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-2xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            <GraduationCap className="size-3.5 inline" />
            <span>Interview Drill Studio</span>
            <span className="text-border">·</span>
            <span>/{group?.slug || slug}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {group?.name || slug} Questions
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            {questions.length} high-frequency questions · {masteredCount} mastered ({masteryPct}%)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Link
            href="/interview"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-all px-3 py-1.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Subjects</span>
          </Link>

          {/* Segmented Mode Switcher */}
          <div className="p-1 rounded-xl bg-card/80 border border-border/40 flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('deck')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'deck'
                  ? 'bg-emerald-500 text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Zap className="size-3.5" />
              <span>3D Flashcards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                viewMode === 'list'
                  ? 'bg-emerald-500 text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ListFilter className="size-3.5" />
              <span>List Mode</span>
            </button>
          </div>

          <Button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Card</span>
          </Button>
        </div>
      </div>

      {/* ── 2. VIEW MODE: 3D Flashcards Deck ── */}
      {viewMode === 'deck' ? (
        isLoading ? (
          <div className="h-[460px] rounded-3xl bg-card/50 border border-border/30 p-8 space-y-4 animate-pulse" />
        ) : (
          <FlashcardDeck
            questions={questions}
            subjectName={group?.name || slug}
            onRateCard={handleRateCard}
            onToggleBookmark={handleToggleBookmark}
            onSwitchToListMode={() => setViewMode('list')}
          />
        )
      ) : (
        /* ── 3. VIEW MODE: Detailed Accordion List ── */
        <div className="space-y-6">
          {/* Controls & Filters Strip */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by question, company, tag, or answer..."
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
                  <span>Self-Test Mode: {isDrillMode ? 'ON' : 'OFF'}</span>
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

            {/* Sub-Filters: Scope & Difficulty */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1 pr-2 border-r border-border/40">
                <button
                  type="button"
                  onClick={() => setScopeFilter('all')}
                  className={cn(
                    'text-2xs font-mono px-2.5 py-1 rounded-lg border transition-all',
                    scopeFilter === 'all'
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold'
                      : 'border-border/40 bg-card/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('due')}
                  className={cn(
                    'text-2xs font-mono px-2.5 py-1 rounded-lg border transition-all',
                    scopeFilter === 'due'
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-400 font-bold'
                      : 'border-border/40 bg-card/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  Due
                </button>
                <button
                  type="button"
                  onClick={() => setScopeFilter('bookmarked')}
                  className={cn(
                    'text-2xs font-mono px-2.5 py-1 rounded-lg border transition-all',
                    scopeFilter === 'bookmarked'
                      ? 'border-yellow-500/40 bg-yellow-500/15 text-yellow-400 font-bold'
                      : 'border-border/40 bg-card/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  Starred
                </button>
              </div>

              {/* Difficulty filter */}
              <div className="flex items-center gap-1 pr-2 border-r border-border/40">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() =>
                      setSelectedDifficulty(selectedDifficulty === diff ? null : diff)
                    }
                    className={cn(
                      'text-2xs font-mono px-2 py-0.5 rounded-md border transition-all',
                      selectedDifficulty === diff
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold'
                        : 'border-border/40 bg-card/60 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Tags filter */}
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={cn(
                    'text-2xs font-mono px-2 py-0.5 rounded-md border transition-all',
                    selectedTag === tag
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-bold'
                      : 'border-border/30 bg-card/40 text-muted-foreground hover:text-foreground'
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-card/50 border border-border/30 p-5 space-y-2 animate-pulse"
                />
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center shadow-xs">
              <p className="text-sm text-muted-foreground">
                No questions matched your search query or active filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty(null);
                  setSelectedTag(null);
                  setScopeFilter('all');
                }}
                className="mt-3 text-xs font-semibold text-emerald-400 hover:underline"
              >
                Clear all filters
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
                  onToggleBookmark={handleToggleBookmark}
                  onQuickStatus={handleQuickStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Add Question Dialog ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-xl bg-card border border-border/50 text-foreground p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold">
                Add Custom Interview Question
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add a new question to your {group?.name || slug} deck. Markdown formatting is supported for the answer.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Question Title *</label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Explain how virtual memory and paging work in Linux."
                  className="w-full h-10 px-3.5 rounded-xl bg-background/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-background/80 border border-border/40 text-sm text-foreground focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Company Tags</label>
                  <input
                    type="text"
                    value={newCompanyTags}
                    onChange={(e) => setNewCompanyTags(e.target.value)}
                    placeholder="e.g. Google, Amazon"
                    className="w-full h-10 px-3 rounded-xl bg-background/80 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Key Takeaway Bullets (1 per line)</label>
                <textarea
                  rows={3}
                  value={newKeyPoints}
                  onChange={(e) => setNewKeyPoints(e.target.value)}
                  placeholder="Bullet 1&#10;Bullet 2"
                  className="w-full p-3 rounded-xl bg-background/80 border border-border/40 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 resize-y"
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
                <label className="text-xs font-semibold text-foreground">Topic Tags (comma-separated)</label>
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
