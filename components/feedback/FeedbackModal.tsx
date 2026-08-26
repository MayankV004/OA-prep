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
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.remainingToday === 'number') {
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
          description: 'Thank you for helping us improve BigO.',
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
      <DialogContent className="sm:max-w-lg border-none bg-background/95 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] p-7 rounded-3xl">
        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-in-up">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-xl">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-foreground">
                Thank you!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {type === 'bug'
                  ? 'Our engineering team has been notified. We appreciate you reporting this.'
                  : 'Your feedback has been logged and sent to our team.'}
              </p>
            </div>

            {remainingToday !== null && (
              <Badge variant="outline" className="py-1 px-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-full text-xs font-medium">
                {remainingToday} of 5 submissions remaining today
              </Badge>
            )}

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-8 rounded-full h-11 border-none bg-muted/50 hover:bg-muted text-foreground"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-display font-bold text-foreground">
                  {type === 'bug' ? 'Report a Bug' : 'Share Feedback'}
                </DialogTitle>
                {remainingToday !== null && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-2xs font-semibold px-3 py-1 rounded-full border-none",
                      remainingToday === 0
                        ? "bg-red-500/10 text-red-500"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {remainingToday}/5 remaining today
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Help us improve BigO with your thoughts or bug reports.
              </DialogDescription>
            </DialogHeader>

            {/* Smooth Animated Toggle Pill Switcher */}
            <div className="relative flex p-1.5 bg-muted/40 rounded-full my-3">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={cn(
                  'relative z-10 flex-1 py-2 rounded-full text-xs font-semibold transition-colors duration-200 text-center',
                  type === 'bug'
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'bug' && (
                  <motion.span
                    layoutId="feedback-modal-toggle-pill"
                    className="absolute inset-0 rounded-full bg-background shadow-md border border-border/40"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Bug Report</span>
              </button>
              <button
                type="button"
                onClick={() => setType('feedback')}
                className={cn(
                  'relative z-10 flex-1 py-2 rounded-full text-xs font-semibold transition-colors duration-200 text-center',
                  type === 'feedback'
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'feedback' && (
                  <motion.span
                    layoutId="feedback-modal-toggle-pill"
                    className="absolute inset-0 rounded-full bg-background shadow-md border border-border/40"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Feedback</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 text-xs rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-1">
              {!session?.user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-name" className="text-xs font-semibold px-2">
                      Your Name
                    </Label>
                    <input
                      id="fb-name"
                      placeholder="Mayank Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-email" className="text-xs font-semibold px-2">
                      Email Address *
                    </Label>
                    <input
                      id="fb-email"
                      type="email"
                      required
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="fb-title" className="text-xs font-semibold px-2">
                  {type === 'bug' ? 'Issue Summary *' : 'Title *'}
                </Label>
                <input
                  id="fb-title"
                  required
                  placeholder={
                    type === 'bug'
                      ? 'Activity heatmap not rendering'
                      : 'Option to bookmark CP problems'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fb-category" className="text-xs font-semibold px-2">
                    Category
                  </Label>
                  <select
                    id="fb-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 cursor-pointer"
                  >
                    <option value="dsa">DSA Patterns</option>
                    <option value="cs_core">CS Core Subjects</option>
                    <option value="profile">Profile & Progress</option>
                    <option value="auth">Auth & Account</option>
                    <option value="ui">UI / Visual Design</option>
                    <option value="other">Other / General</option>
                  </select>
                </div>

                {type === 'bug' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-severity" className="text-xs font-semibold px-2">
                      Severity
                    </Label>
                    <select
                      id="fb-severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 cursor-pointer"
                    >
                      <option value="low">Low - Minor cosmetic</option>
                      <option value="medium">Medium - Normal bug</option>
                      <option value="high">High - Feature broken</option>
                      <option value="critical">Critical - App crash</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-desc" className="text-xs font-semibold px-2">
                  Detailed Description *
                </Label>
                <textarea
                  id="fb-desc"
                  required
                  rows={4}
                  placeholder={
                    type === 'bug'
                      ? 'Describe steps to reproduce the issue...'
                      : 'Share your thoughts, suggestions, or features you want...'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 resize-none placeholder:text-muted-foreground/60"
                />
              </div>

              {/* <div className="text-2xs text-muted-foreground px-2">
                Page URL: <span className="font-mono text-foreground">{pathname}</span>
              </div> */}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="px-6 h-11 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || remainingToday === 0}
                  className="px-7 h-11 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none"
                >
                  {loading ? 'Submitting...' : `Submit ${type === 'bug' ? 'Report' : 'Feedback'}`}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
