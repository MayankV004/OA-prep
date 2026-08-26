'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bug,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  const [type, setType] = useState<'bug' | 'feedback'>(defaultType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
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
      <DialogContent className="sm:max-w-lg border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl p-6 rounded-2xl">
        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-in-up">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-foreground">
                Thank you for your feedback!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {type === 'bug'
                  ? 'Our engineering team has been notified. We appreciate you taking the time to report this.'
                  : 'Your suggestion has been logged and sent to our team.'}
              </p>
            </div>

            {remainingToday !== null && (
              <Badge variant="outline" className="gap-1.5 py-1 px-3 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                <Clock className="size-3.5" />
                {remainingToday} of 5 submissions remaining today
              </Badge>
            )}

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-8 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-xl font-display font-bold text-foreground">
                  <Sparkles className="size-5 text-rose-500" />
                  {type === 'bug' ? 'Report a Bug' : 'Share Feedback'}
                </DialogTitle>
                {remainingToday !== null && (
                  <Badge variant="outline" className={cn("gap-1 text-2xs font-semibold px-2.5 py-0.5 rounded-full", remainingToday === 0 ? "border-red-500/40 text-red-500 bg-red-500/10" : "border-border text-muted-foreground")}>
                    <Clock className="size-3" />
                    {remainingToday}/5 max today
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Found a bug or have an idea to make BigO better? We read every submission.
              </DialogDescription>
            </DialogHeader>

            {/* Selector: Bug vs Feedback */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/50 my-2">
              <button
                type="button"
                onClick={() => setType('bug')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                  type === 'bug'
                    ? 'bg-background text-rose-600 dark:text-rose-400 shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Bug className="size-4" />
                Bug Report
              </button>
              <button
                type="button"
                onClick={() => setType('feedback')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                  type === 'feedback'
                    ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageSquare className="size-4" />
                Feedback
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!session?.user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-name" className="text-xs font-semibold">Your Name</Label>
                    <Input
                      id="fb-name"
                      placeholder="Mayank Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-email" className="text-xs font-semibold">Email Address *</Label>
                    <Input
                      id="fb-email"
                      type="email"
                      required
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="fb-title" className="text-xs font-semibold">
                  {type === 'bug' ? 'Issue Summary *' : 'Feedback Title *'}
                </Label>
                <Input
                  id="fb-title"
                  required
                  placeholder={
                    type === 'bug'
                      ? 'e.g. Activity heatmap not rendering on profile page'
                      : 'e.g. Option to bookmark CP problems'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fb-category" className="text-xs font-semibold">Category</Label>
                  <select
                    id="fb-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
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
                    <Label htmlFor="fb-severity" className="text-xs font-semibold">Severity</Label>
                    <select
                      id="fb-severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="low">Low - Minor cosmetic issue</option>
                      <option value="medium">Medium - Normal bug</option>
                      <option value="high">High - Feature broken</option>
                      <option value="critical">Critical - App crash / data issue</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-desc" className="text-xs font-semibold">
                  Detailed Description *
                </Label>
                <Textarea
                  id="fb-desc"
                  required
                  rows={4}
                  placeholder={
                    type === 'bug'
                      ? 'Please describe steps to reproduce the issue, what happened, and what you expected to happen.'
                      : 'Share your thoughts, suggestions, or features you would love to see.'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-2xs text-muted-foreground p-2 rounded-lg bg-muted/30">
                <Info className="size-3.5 shrink-0 text-muted-foreground" />
                <span>
                  Current page URL (<code className="text-foreground">{pathname}</code>) will be attached automatically.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={remainingToday === 0}
                  className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white shadow-md hover:shadow-lg border-none px-6"
                >
                  <Send className="mr-2 size-4" />
                  Submit {type === 'bug' ? 'Report' : 'Feedback'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
