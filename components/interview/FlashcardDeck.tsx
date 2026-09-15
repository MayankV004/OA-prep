'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';
import { InterviewQuestion, FlashcardStatus } from '@/types/interview';
import { MarkdownView } from '@/components/markdown/View';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlashcardDeckProps {
  questions: InterviewQuestion[];
  subjectName: string;
  onRateCard: (questionId: string, confidence: number, status?: FlashcardStatus) => Promise<void>;
  onToggleBookmark: (questionId: string, currentBookmarked: boolean) => Promise<void>;
  onSwitchToListMode: () => void;
}

export function FlashcardDeck({
  questions,
  subjectName,
  onRateCard,
  onToggleBookmark,
  onSwitchToListMode,
}: FlashcardDeckProps) {
  // Deck State
  const [deck, setDeck] = useState<InterviewQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'bookmarked' | 'unseen'>('all');
  const [isCompleted, setIsCompleted] = useState(false);

  // Session stats
  const [sessionStats, setSessionStats] = useState({
    reviewedCount: 0,
    masteredCount: 0,
    againCount: 0,
  });

  // Sync initial deck or filter
  useEffect(() => {
    let list = [...questions];
    if (filterMode === 'bookmarked') {
      list = list.filter((q) => q.bookmarked);
    } else if (filterMode === 'due') {
      const now = new Date();
      list = list.filter((q) => {
        if (q.status === 'unseen') return true;
        if (q.status === 'mastered') return false;
        if (!q.nextReviewAt) return true;
        return new Date(q.nextReviewAt) <= now;
      });
    } else if (filterMode === 'unseen') {
      list = list.filter((q) => !q.status || q.status === 'unseen');
    }

    if (isShuffled) {
      list.sort(() => Math.random() - 0.5);
    }
    setDeck(list);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setIsCompleted(false);
  }, [questions, filterMode, isShuffled]);

  const currentCard = deck[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  }, [currentIndex]);

  const handleShuffleToggle = () => {
    setIsShuffled((prev) => !prev);
    toast.success(isShuffled ? 'Ordered by sequence' : 'Deck shuffled');
  };

  const handleRate = async (confidence: number) => {
    if (!currentCard) return;

    let status: FlashcardStatus = 'learning';
    if (confidence === 4) status = 'mastered';
    else if (confidence === 3) status = 'reviewing';

    setSessionStats((prev) => ({
      reviewedCount: prev.reviewedCount + 1,
      masteredCount: confidence === 4 ? prev.masteredCount + 1 : prev.masteredCount,
      againCount: confidence === 1 ? prev.againCount + 1 : prev.againCount,
    }));

    await onRateCard(currentCard._id, confidence, status);

    // Update local card state in deck
    setDeck((prevDeck) =>
      prevDeck.map((c, i) => (i === currentIndex ? { ...c, status, confidence } : c))
    );

    // Advance to next card
    handleNext();
  };

  const handleBookmark = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentCard) return;
    const nextState = !currentCard.bookmarked;
    await onToggleBookmark(currentCard._id, currentCard.bookmarked || false);

    setDeck((prevDeck) =>
      prevDeck.map((c, i) => (i === currentIndex ? { ...c, bookmarked: nextState } : c))
    );
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' && isFlipped) {
        handleRate(1);
      } else if (e.key === '2' && isFlipped) {
        handleRate(2);
      } else if (e.key === '3' && isFlipped) {
        handleRate(3);
      } else if (e.key === '4' && isFlipped) {
        handleRate(4);
      } else if (e.key.toLowerCase() === 'b') {
        handleBookmark();
      } else if (e.key.toLowerCase() === 's') {
        handleShuffleToggle();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleFlip, handleNext, handlePrev, isFlipped, currentCard]);

  // Restart Deck
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setIsCompleted(false);
    setSessionStats({ reviewedCount: 0, masteredCount: 0, againCount: 0 });
  };

  if (deck.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center space-y-4">
        <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 grid place-items-center mx-auto border border-emerald-500/20">
          <HelpCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">No cards match this filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filterMode === 'bookmarked'
              ? 'You have not bookmarked any questions in this subject yet. Star some cards to build a quick revision deck!'
              : filterMode === 'due'
                ? 'Great job! You have no cards due for spaced-repetition review right now.'
                : 'No flashcards available in this category.'}
          </p>
        </div>
        <Button
          onClick={() => setFilterMode('all')}
          variant="outline"
          className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        >
          Reset to All Cards ({questions.length})
        </Button>
      </div>
    );
  }

  // Session Completed Summary
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-card/90 via-card/70 to-card/90 backdrop-blur-2xl p-8 sm:p-12 text-center space-y-8 max-w-xl mx-auto shadow-2xl shadow-emerald-500/10"
      >
        <div className="relative size-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative size-20 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 grid place-items-center shadow-inner">
            <Trophy className="size-10" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-2xs font-mono font-bold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Session Finished
          </span>
          <h2 className="font-display text-3xl font-black text-foreground">
            Flashcard Drill Complete!
          </h2>
          <p className="text-sm text-muted-foreground">
            You completed all <strong className="text-foreground">{deck.length}</strong> cards in{' '}
            <span className="text-emerald-400 font-semibold">{subjectName}</span>.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-background/50 border border-border/40">
          <div className="space-y-1">
            <p className="text-2xs font-mono text-muted-foreground uppercase">Reviewed</p>
            <p className="text-2xl font-bold text-foreground">{sessionStats.reviewedCount}</p>
          </div>
          <div className="space-y-1 border-x border-border/40">
            <p className="text-2xs font-mono text-emerald-400 uppercase">Mastered</p>
            <p className="text-2xl font-bold text-emerald-400">{sessionStats.masteredCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xs font-mono text-rose-400 uppercase">Need Work</p>
            <p className="text-2xl font-bold text-rose-400">{sessionStats.againCount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={handleRestart}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <RotateCcw className="size-4" />
            Restart Deck
          </Button>
          <Button
            onClick={onSwitchToListMode}
            variant="outline"
            className="w-full sm:w-auto text-xs border-border/60 hover:bg-muted/80"
          >
            Switch to Detailed List View
          </Button>
        </div>
      </motion.div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div
      className={cn(
        'space-y-6 transition-all duration-300',
        isFocusMode &&
          'fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl p-6 sm:p-12 overflow-y-auto flex flex-col justify-between'
      )}
    >
      {/* ── 1. Top Controls Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/50 border border-border/40 backdrop-blur-xl p-3 sm:px-4 sm:py-2.5 rounded-2xl shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={cn(
              'text-2xs font-mono px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
              filterMode === 'all'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            )}
          >
            All ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('due')}
            className={cn(
              'text-2xs font-mono px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
              filterMode === 'due'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            )}
          >
            Due for Review
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('bookmarked')}
            className={cn(
              'text-2xs font-mono px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
              filterMode === 'bookmarked'
                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            )}
          >
            Starred
          </button>
        </div>

        {/* Deck Utilities */}
        <div className="flex items-center gap-2">
          {/* Shuffle Button */}
          <button
            type="button"
            onClick={handleShuffleToggle}
            title="Shuffle deck (S)"
            className={cn(
              'p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              isShuffled
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <Shuffle className="size-3.5" />
            <span className="hidden sm:inline text-2xs">Shuffle</span>
          </button>

          {/* Focus mode toggle */}
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            title="Toggle Focus Mode"
            className="p-2 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            {isFocusMode ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* ── 2. Progress Bar & Indicator ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              Card {currentIndex + 1} of {deck.length}
            </span>
            <span className="text-border">·</span>
            <span>{progressPercent}% completed</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-2xs text-muted-foreground">
            <span>[Space] Flip</span>
            <span>[← / →] Navigate</span>
            <span>[1–4] Rate</span>
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* ── 3. The 3D Interactive Flashcard ── */}
      <div className="relative min-h-[460px] sm:min-h-[500px] w-full [perspective:1400px]">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full h-full min-h-[460px] sm:min-h-[500px] [transform-style:preserve-3d] cursor-pointer"
          onClick={handleFlip}
        >
          {/* ────── FRONT OF CARD ────── */}
          <div
            className={cn(
              'absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-9 flex flex-col justify-between [backface-visibility:hidden]',
              'border border-border/50 bg-gradient-to-br from-card/95 via-card/85 to-card/95 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300'
            )}
          >
            {/* Top Row: Meta badges & Bookmark */}
            <div className="flex items-center justify-between gap-3 border-b border-border/30 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-2xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Q{String(currentIndex + 1).padStart(2, '0')}
                </span>
                {currentCard.difficulty && (
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-2xs font-semibold uppercase tracking-wider',
                      currentCard.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : currentCard.difficulty === 'Medium'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    )}
                  >
                    {currentCard.difficulty}
                  </span>
                )}
                {currentCard.status && currentCard.status !== 'unseen' && (
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full border border-border/40 bg-muted/40 text-muted-foreground capitalize">
                    {currentCard.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBookmark}
                  title="Star question (B)"
                  className={cn(
                    'p-2 rounded-xl border transition-all cursor-pointer',
                    currentCard.bookmarked
                      ? 'border-yellow-500/40 bg-yellow-500/15 text-yellow-400 shadow-sm shadow-yellow-500/20'
                      : 'border-border/40 bg-background/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Star className={cn('size-4', currentCard.bookmarked && 'fill-yellow-400')} />
                </button>
              </div>
            </div>

            {/* Middle: Question Statement */}
            <div className="my-auto py-6 space-y-5 text-center sm:text-left">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
                {currentCard.question}
              </h3>

              {/* Company Tags */}
              {currentCard.companyTags && currentCard.companyTags.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
                  <span className="text-2xs font-mono text-muted-foreground mr-1">Asked at:</span>
                  {currentCard.companyTags.map((comp) => (
                    <span
                      key={comp}
                      className="text-2xs font-mono px-2 py-0.5 rounded-md border border-border/40 bg-muted/30 text-foreground/80 font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              )}

              {/* Hint Accordion */}
              {currentCard.keyPoints && currentCard.keyPoints.length > 0 && (
                <div className="pt-2 text-left" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-2xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Lightbulb className="size-3.5" />
                    <span>{showHint ? 'Hide Key Takeaway Clues' : '💡 Peek Key Clues (Hint)'}</span>
                  </button>

                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-xs text-foreground/90 space-y-1 font-sans"
                      >
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                          {currentCard.keyPoints.map((pt, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Bottom Prompt */}
            <div className="pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Sparkles className="size-3.5" />
                <span>Click or press [Space] to reveal answer</span>
              </span>
              <span className="hidden sm:inline text-2xs">Flip Card →</span>
            </div>
          </div>

          {/* ────── BACK OF CARD ────── */}
          <div
            className={cn(
              'absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]',
              'border border-emerald-500/40 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-2xl shadow-2xl overflow-y-auto'
            )}
            onClick={(e) => {
              // Allow selecting text inside answer without flipping
              if ((e.target as HTMLElement)?.tagName === 'A') return;
            }}
          >
            {/* Back Header */}
            <div className="flex items-center justify-between border-b border-border/30 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  Model Answer & Analysis
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBookmark}
                  title="Star question"
                  className={cn(
                    'p-1.5 rounded-lg border transition-all cursor-pointer',
                    currentCard.bookmarked
                      ? 'border-yellow-500/40 bg-yellow-500/15 text-yellow-400'
                      : 'border-border/40 bg-background/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Star className={cn('size-3.5', currentCard.bookmarked && 'fill-yellow-400')} />
                </button>

                <button
                  type="button"
                  onClick={handleFlip}
                  className="text-2xs font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded-md border border-border/40 bg-muted/30"
                >
                  Flip Back
                </button>
              </div>
            </div>

            {/* Answer Content */}
            <div className="my-4 overflow-y-auto pr-1 space-y-4 text-left">
              {/* Key takeaways callout box */}
              {currentCard.keyPoints && currentCard.keyPoints.length > 0 && (
                <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 space-y-1.5">
                  <p className="text-2xs font-mono uppercase font-bold text-emerald-400">
                    Key Mental Models & Takeaways:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-foreground/90">
                    {currentCard.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Markdown answer */}
              <div className="text-sm">
                <MarkdownView content={currentCard.answer} fontSize="default" />
              </div>
            </div>

            {/* Rating Buttons */}
            <div
              className="pt-3 border-t border-border/30 shrink-0 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground">
                <span>How well did you recall this?</span>
                <span className="hidden sm:inline">Use keys [1], [2], [3], [4]</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRate(1)}
                  className="py-2.5 px-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <span>Again</span>
                  <span className="text-3xs font-mono opacity-80">[1] 1d</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate(2)}
                  className="py-2.5 px-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <span>Hard</span>
                  <span className="text-3xs font-mono opacity-80">[2] 3d</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate(3)}
                  className="py-2.5 px-2 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <span>Good</span>
                  <span className="text-3xs font-mono opacity-80">[3] 7d</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate(4)}
                  className="py-2.5 px-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <span>Mastered</span>
                  <span className="text-3xs font-mono opacity-80">[4] 21d</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 4. Bottom Deck Navigation Controls ── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="text-xs gap-1.5 rounded-xl border-border/50 bg-card/60 hover:bg-card"
        >
          <ChevronLeft className="size-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleFlip}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs gap-1.5 shadow-sm px-5"
          >
            {isFlipped ? 'Show Question' : 'Flip to Answer'}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          className="text-xs gap-1.5 rounded-xl border-border/50 bg-card/60 hover:bg-card"
        >
          <span>{currentIndex === deck.length - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
