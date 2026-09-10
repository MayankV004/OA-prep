'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bug,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  HelpCircle,
  Clock,
  ShieldAlert,
  Send,
  ExternalLink,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/components/ui/toast';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { cn } from '@/lib/utils';
import { FeedbackType, FeedbackSeverity } from '@/types/feedback';

export default function FeedbackPage() {
  const toast = useToast();
  const { data: session } = authClient.useSession();

  const [type, setType] = useState<FeedbackType>('feedback');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('dsa');
  const [severity, setSeverity] = useState<FeedbackSeverity>('medium');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pageUrl, setPageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingToday, setRemainingToday] = useState<number | null>(null);

  // Sync session and initial values
  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '');
      setName(session.user.name || '');
    }
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }

    fetch('/api/feedback')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.remainingToday === 'number') {
          setRemainingToday(data.remainingToday);
        }
      })
      .catch(() => {});
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
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
          pageUrl: pageUrl || (typeof window !== 'undefined' ? window.location.href : ''),
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
        type === 'bug' ? 'Bug report received!' : 'Feedback submitted!',
        {
          description: 'Thank you for helping us elevate BigO Prep.',
          type: 'success',
        }
      );

      setTitle('');
      setDescription('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 relative selection:bg-primary/20 selection:text-primary">
      {/* Specular Top Beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Ambient Aurora Top Glow */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-emerald-500/10 via-amber-500/5 to-transparent blur-3xl opacity-60 dark:opacity-40" />

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="size-3 text-emerald-500" />
          Product Telemetry & Community Feedback
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-foreground">
          Report an Issue or{' '}
          <span className="text-primary">
            Share Feedback
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Your feedback directly drives our engineering roadmap. Whether it’s an edge-case testcase bug, a new company assessment request, or a UI suggestion, we review every entry.
        </p>
      </div>

      {/* Main Grid: Form + Tips & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-2xl shadow-e2 p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Top highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          {/* Mode Switcher Buttons */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="relative flex p-1 bg-surface-sunken/80 dark:bg-surface-sunken/40 border border-border/70 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setType('feedback')}
                className={cn(
                  'relative z-10 px-5 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 text-center flex items-center justify-center gap-2 cursor-pointer',
                  type === 'feedback'
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'feedback' && (
                  <motion.span
                    layoutId="feedback-page-toggle-pill"
                    className="absolute inset-0 rounded-lg bg-card shadow-xs border border-border/60"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  Product Feedback
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType('bug')}
                className={cn(
                  'relative z-10 px-5 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 text-center flex items-center justify-center gap-2 cursor-pointer',
                  type === 'bug'
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'bug' && (
                  <motion.span
                    layoutId="feedback-page-toggle-pill"
                    className="absolute inset-0 rounded-lg bg-card shadow-xs border border-border/60"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Bug className="size-3.5" />
                  Technical Bug Report
                </span>
              </button>
            </div>

            {remainingToday !== null && (
              <Badge
                variant="outline"
                className={cn(
                  'text-2xs font-mono font-bold px-3 py-1 rounded-full border',
                  remainingToday === 0
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-muted/60 text-muted-foreground border-border/60'
                )}
              >
                {remainingToday}/5 remaining today
              </Badge>
            )}
          </div>

          {submitted ? (
            <div className="py-10 text-center space-y-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 grid place-items-center mx-auto">
                <CheckCircle2 className="size-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-foreground">
                  Submission Logged!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  {type === 'bug'
                    ? 'Your bug report and system parameters have been routed to our core engineers.'
                    : 'Thank you for your valuable feedback! We iterate on platform features continuously.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-muted text-foreground border border-border/80 transition-all cursor-pointer shadow-2xs"
                >
                  Submit another report
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-destructive/10 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!session?.user && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-name" className="text-xs font-semibold px-1 text-foreground/90">
                      Your Name
                    </Label>
                    <input
                      id="p-name"
                      placeholder="Mayank Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-email" className="text-xs font-semibold px-1 text-foreground/90">
                      Email Address *
                    </Label>
                    <input
                      id="p-email"
                      type="email"
                      required
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="p-title" className="text-xs font-semibold px-1 text-foreground/90">
                  {type === 'bug' ? 'Issue Summary *' : 'Subject *'}
                </Label>
                <input
                  id="p-title"
                  required
                  placeholder={
                    type === 'bug'
                      ? 'E.g., Judge0 code runner timed out on custom graph input'
                      : 'E.g., Suggestion for Company OA Question tagging by frequency'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="p-category" className="text-xs font-semibold px-1 text-foreground/90">
                    Platform Category
                  </Label>
                  <select
                    id="p-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    <option value="dsa">DSA Patterns & Practice</option>
                    <option value="oa">Company OA Mock Simulator</option>
                    <option value="cs_core">CS Core Subjects & Interview Q&A</option>
                    <option value="cp">Competitive Programming Radar</option>
                    <option value="profile">Profile & Heatmap Sync</option>
                    <option value="auth">Billing & Pro Subscription</option>
                    <option value="ui">UI, Dark Mode & Reader View</option>
                    <option value="other">Other / General</option>
                  </select>
                </div>

                {type === 'bug' ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="p-severity" className="text-xs font-semibold px-1 text-foreground/90">
                      Severity Level
                    </Label>
                    <select
                      id="p-severity"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                    >
                      <option value="low">Low - Minor cosmetic / typo</option>
                      <option value="medium">Medium - Functional glitch</option>
                      <option value="high">High - Key feature broken</option>
                      <option value="critical">Critical - Crash / Proctor lock</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="p-url" className="text-xs font-semibold px-1 text-foreground/90">
                      Related Page / URL
                    </Label>
                    <input
                      id="p-url"
                      placeholder="E.g., /oa/amazon-sde-oa"
                      value={pageUrl}
                      onChange={(e) => setPageUrl(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="p-desc" className="text-xs font-semibold text-foreground/90">
                    Detailed Explanation *
                  </Label>
                  <span className="text-2xs text-muted-foreground font-mono">
                    {description.length}/1000
                  </span>
                </div>
                <textarea
                  id="p-desc"
                  required
                  rows={5}
                  maxLength={1000}
                  placeholder={
                    type === 'bug'
                      ? '1. What were you doing?\n2. What was expected?\n3. What actually happened? (Paste error code or submission ID)'
                      : 'Describe your idea, what problem it solves, or why you would love to see it in BigO...'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-sans"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || remainingToday === 0}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>Submit {type === 'bug' ? 'Bug Report' : 'Product Feedback'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Side Info & Tips (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tip Card */}
          <div className="p-6 rounded-3xl border border-border/80 bg-card/60 dark:bg-card/30 backdrop-blur-xl space-y-4 shadow-e2">
            <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-4 text-emerald-500" />
              Effective Bug Reporting Guide
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Include URLs & IDs</strong>: If it occurred in a Mock OA or problem practice, share the assessment slug or problem title.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Mention Browser & OS</strong>: Screen proctoring behavior can vary across Chrome, Brave, Safari, and Firefox.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Failing Testcase</strong>: Paste the minimal code or input that caused the unexpected outcome.</span>
              </li>
            </ul>
          </div>

          {/* SLA Card */}
          <div className="p-6 rounded-3xl border border-border/80 bg-card/60 dark:bg-card/30 backdrop-blur-xl space-y-3 shadow-e2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-amber-500" />
                Response SLA
              </span>
              <span className="text-2xs font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                &lt; 12h Average
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every submission generates a tracked engineering ticket. High-impact issues are pushed into our staging pipeline within hours.
            </p>
          </div>

          {/* Need Immediate Support */}
          <div className="p-6 rounded-3xl border border-border/80 bg-card/60 dark:bg-card/30 backdrop-blur-xl space-y-3 shadow-e2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Direct Contact
            </h4>
            <p className="text-xs text-muted-foreground">
              Need account assistance or urgent proctoring unblock? Contact candidate support directly.
            </p>
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Go to Candidate Support Desk <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
