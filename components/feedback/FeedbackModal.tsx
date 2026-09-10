'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { FeedbackType, FeedbackSeverity } from '@/types/feedback';
import { Bug, MessageSquare, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: FeedbackType;
}

export function FeedbackModal({
  open,
  onOpenChange,
  defaultType = 'feedback',
}: FeedbackModalProps) {
  const pathname = usePathname();
  const toast = useToast();
  const { data: session } = authClient.useSession();

  const [type, setType] = useState<FeedbackType>(defaultType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [severity, setSeverity] = useState<FeedbackSeverity>('medium');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingToday, setRemainingToday] = useState<number | null>(null);

  // Sync user info and defaultType when modal opens
  useEffect(() => {
    if (open) {
      setType(defaultType);
      setSubmitted(false);
      setErrorMessage('');
      if (session?.user) {
        setEmail(session.user.email || '');
        setName(session.user.name || '');
      }

      // Fetch remaining submissions today
      fetch('/api/feedback')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.remainingToday === 'number') {
            setRemainingToday(data.remainingToday);
          }
        })
        .catch(() => {});
    }
  }, [open, defaultType, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.href : pathname;
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          category,
          severity: type === 'bug' ? severity : undefined,
          email: email || session?.user?.email,
          name: name || session?.user?.name,
          pageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to submit report');
      }

      setSubmitted(true);
      if (typeof data.remainingToday === 'number') {
        setRemainingToday(data.remainingToday);
      }

      toast.add(
        type === 'bug' ? 'Bug report submitted!' : 'Feedback submitted!',
        {
          description: 'Thank you for helping us make BigO better.',
          type: 'success',
        }
      );

      // Reset form fields
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border border-border/80 bg-background/95 backdrop-blur-2xl shadow-e4 p-6 sm:p-7 rounded-3xl overflow-hidden">
        {/* Specular Emerald Top Border Beam */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto size-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 grid place-items-center">
              <CheckCircle2 className="size-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-foreground">
                Thank you!
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                {type === 'bug'
                  ? 'Our engineering team has been notified with the debug telemetry.'
                  : 'Your feedback has been logged directly into our product review board.'}
              </p>
            </div>

            {remainingToday !== null && (
              <Badge
                variant="outline"
                className="py-1 px-3 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-full text-2xs font-mono font-bold"
              >
                {remainingToday} of 5 submissions remaining today
              </Badge>
            )}

            <div className="pt-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-muted text-foreground border border-border/80 transition-all cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  {type === 'bug' ? (
                    <>
                      <Bug className="size-5 text-rose-500" />
                      Report an Issue
                    </>
                  ) : (
                    <>
                      <MessageSquare className="size-5 text-emerald-500" />
                      Share Feedback
                    </>
                  )}
                </DialogTitle>
                {remainingToday !== null && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-2xs font-mono font-bold px-2.5 py-0.5 rounded-full border',
                      remainingToday === 0
                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                        : 'bg-muted/60 text-muted-foreground border-border/60'
                    )}
                  >
                    {remainingToday}/5 today
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Help us improve BigO with bug telemetry or feature recommendations.
              </DialogDescription>
            </DialogHeader>

            {/* Smooth Animated Toggle Pill Switcher */}
            <div className="relative flex p-1 bg-surface-sunken/80 dark:bg-surface-sunken/40 border border-border/70 rounded-xl my-2">
              <button
                type="button"
                onClick={() => setType('feedback')}
                className={cn(
                  'relative z-10 flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 text-center flex items-center justify-center gap-1.5 cursor-pointer',
                  type === 'feedback'
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'feedback' && (
                  <motion.span
                    layoutId="feedback-modal-toggle-pill"
                    className="absolute inset-0 rounded-lg bg-card shadow-xs border border-border/60"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  Feedback
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType('bug')}
                className={cn(
                  'relative z-10 flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 text-center flex items-center justify-center gap-1.5 cursor-pointer',
                  type === 'bug'
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'bug' && (
                  <motion.span
                    layoutId="feedback-modal-toggle-pill"
                    className="absolute inset-0 rounded-lg bg-card shadow-xs border border-border/60"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Bug className="size-3.5" />
                  Bug Report
                </span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-1">
              {!session?.user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="fb-name" className="text-2xs font-semibold px-1 text-foreground/90">
                      Your Name
                    </Label>
                    <input
                      id="fb-name"
                      placeholder="Mayank Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fb-email" className="text-2xs font-semibold px-1 text-foreground/90">
                      Email Address *
                    </Label>
                    <input
                      id="fb-email"
                      type="email"
                      required
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="fb-title" className="text-2xs font-semibold px-1 text-foreground/90">
                  {type === 'bug' ? 'Issue Summary *' : 'Title *'}
                </Label>
                <input
                  id="fb-title"
                  required
                  placeholder={
                    type === 'bug'
                      ? 'E.g., Activity heatmap not syncing LeetCode submissions'
                      : 'E.g., Add dark mode code theme switcher in Monaco editor'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fb-category" className="text-2xs font-semibold px-1 text-foreground/90">
                    Category
                  </Label>
                  <select
                    id="fb-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-xs sm:text-sm text-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    <option value="dsa">DSA Patterns & Practice</option>
                    <option value="oa">Company OA Mock Simulator</option>
                    <option value="cs_core">CS Core Subjects & Interview</option>
                    <option value="cp">Competitive Programming</option>
                    <option value="profile">Profile & Heatmap</option>
                    <option value="auth">Account & Billing</option>
                    <option value="ui">UI & Visual Polish</option>
                    <option value="other">Other / General</option>
                  </select>
                </div>

                {type === 'bug' ? (
                  <div className="space-y-1">
                    <Label htmlFor="fb-severity" className="text-2xs font-semibold px-1 text-foreground/90">
                      Severity
                    </Label>
                    <select
                      id="fb-severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full h-10 px-3.5 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-xs sm:text-sm text-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                    >
                      <option value="low">Low - Minor cosmetic / typo</option>
                      <option value="medium">Medium - Functional glitch</option>
                      <option value="high">High - Feature blocked</option>
                      <option value="critical">Critical - Crash / Data issue</option>
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="fb-desc" className="text-2xs font-semibold text-foreground/90">
                    Detailed Description *
                  </Label>
                  <span className="text-2xs text-muted-foreground font-mono">
                    {description.length}/1000
                  </span>
                </div>
                <textarea
                  id="fb-desc"
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder={
                    type === 'bug'
                      ? 'Steps to reproduce the problem, browser version, or expected outcome...'
                      : 'Share your thoughts, suggestions, or features you want to see...'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || remainingToday === 0}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit {type === 'bug' ? 'Report' : 'Feedback'}</span>
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
