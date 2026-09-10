'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  MessageSquare,
  Bug,
  Clock,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Code2,
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/shell/Footer';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    question: 'How fast does the support team respond?',
    answer:
      'We typically respond to all support queries and bug reports within 12 to 24 hours. Critical issues regarding OA simulations and code execution are prioritized immediately.',
  },
  {
    question: 'How do I submit a bug report or feature request?',
    answer:
      'You can use the built-in "Report Bug / Feedback" button anywhere in the app, access the dedicated /feedback hub, or submit directly via the form on this page. Up to 5 submissions per day are allowed per user.',
  },
  {
    question: 'Can I track the status of my submitted feedback?',
    answer:
      'Yes! If you are logged in, our engineering team logs and tracks your feedback. High-priority resolutions and feature rollouts are shared in release notes and direct email updates.',
  },
  {
    question: 'Is BigO free to use for interview preparation?',
    answer:
      'Yes! BigO provides 14 core DSA pattern variations, comprehensive CS core subject curricula, LeetCode activity tracking, and community practice completely free of charge.',
  },
  {
    question: 'How do I report an issue during an ongoing Mock OA?',
    answer:
      'If you encounter a testcase or proctoring error during an active OA, click "Report Issue" in the test runner shell or email us with your submission ID for immediate review.',
  },
];

export default function ContactPage() {
  const toast = useToast();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState<'bug' | 'feedback'>('feedback');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          title: subject,
          description: message,
          name,
          email,
          category: 'contact_page',
          pageUrl: typeof window !== 'undefined' ? window.location.href : '/contact',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to send message');
      }

      setSubmitted(true);
      toast.add('Message sent successfully!', {
        description: 'We have received your query and our team will get back to you shortly.',
        type: 'success',
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@bigoprep.tech');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    toast.add('Email address copied', {
      description: 'support@bigoprep.tech copied to clipboard.',
      type: 'info',
    });
  };

  const openFeedback = (type: 'bug' | 'feedback') => {
    setFeedbackModalType(type);
    setFeedbackModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-primary/20 selection:text-primary">
      {/* Specular Emerald Top Border Beam */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Ambient Aurora Top Glow */}
      <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-gradient-to-b from-emerald-500/10 via-amber-500/5 to-transparent blur-3xl opacity-60 dark:opacity-40" />

      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-20 space-y-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            Candidate Support & Inquiries
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground">
            We're Here to Help You{' '}
            <span className="text-primary">
              Succeed
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
            Have questions about our DSA curricula, company OA mock simulations, or need technical assistance? Reach out directly to our engineering and support team.
          </p>
        </div>

        {/* Quick Contact Action Cards (Spotlight Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Direct Email */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.15)"
            className="flex flex-col justify-between space-y-4 p-6 sm:p-7"
          >
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 grid place-items-center shadow-2xs">
                <Mail className="size-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">Direct Email</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Send an email directly to our team. Inquiries are processed promptly with priority response for candidates.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <a
                href="mailto:support@bigoprep.tech"
                className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
              >
                support@bigoprep.tech
                <ArrowRight className="size-3.5" />
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Copy email address"
                aria-label="Copy email address"
              >
                {copiedEmail ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </SpotlightCard>

          {/* Card 2: Submit Feedback */}
          <SpotlightCard
            spotlightColor="rgba(245, 158, 11, 0.14)"
            className="flex flex-col justify-between space-y-4 p-6 sm:p-7"
          >
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 grid place-items-center shadow-2xs">
                <MessageSquare className="size-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">Share Feedback</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Have an idea for a new feature, company pattern, or curriculum addition? We actively build candidate requests.
              </p>
            </div>
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => openFeedback('feedback')}
                className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                Open Feedback Dialog
                <ArrowRight className="size-3.5" />
              </button>
              <Link
                href="/feedback"
                className="text-2xs font-mono text-muted-foreground hover:text-foreground"
              >
                Full Hub &rarr;
              </Link>
            </div>
          </SpotlightCard>

          {/* Card 3: Report a Bug */}
          <SpotlightCard
            spotlightColor="rgba(239, 68, 68, 0.12)"
            className="flex flex-col justify-between space-y-4 p-6 sm:p-7"
          >
            <div className="space-y-3">
              <div className="size-11 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 grid place-items-center shadow-2xs">
                <Bug className="size-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">Report a Bug</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Spotted a code execution mismatch, broken testcase, or UI glitch? Report it for rapid investigation.
              </p>
            </div>
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => openFeedback('bug')}
                className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                Report Technical Issue
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </SpotlightCard>
        </div>

        {/* Main Grid: Message Form + FAQs & Live SLA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form Side (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card/70 dark:bg-card/40 backdrop-blur-2xl shadow-e2 p-7 sm:p-9 space-y-6 relative overflow-hidden">
            {/* Specular Edge Top Light */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-foreground">Send Us a Message</h2>
                <Badge variant="outline" className="text-2xs font-mono border-border/80 text-muted-foreground">
                  Encrypted & Direct
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Submit your query below. Our team reviews all candidate submissions continuously.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 sm:p-10 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-4">
                <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 grid place-items-center mx-auto">
                  <CheckCircle2 className="size-7 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-foreground">Message Dispatched!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out. We have logged your request and our engineering team will respond shortly.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-muted text-foreground border border-border/80 transition-all cursor-pointer shadow-2xs"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name" className="text-xs font-semibold px-1 text-foreground/90">
                      Full Name *
                    </Label>
                    <input
                      id="contact-name"
                      required
                      placeholder="Mayank Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-xs font-semibold px-1 text-foreground/90">
                      Email Address *
                    </Label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-subject" className="text-xs font-semibold px-1 text-foreground/90">
                    Subject *
                  </Label>
                  <input
                    id="contact-subject"
                    required
                    placeholder="E.g., Question about Company OA Diagnostic Tests"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-xs font-semibold px-1 text-foreground/90">
                    Message *
                  </Label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Please include relevant details, URLs, or assessment slugs if applicable..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 rounded-xl bg-surface-sunken/60 dark:bg-surface-sunken/40 border border-border/70 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] border-t border-white/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="size-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* FAQs & SLA Side (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* SLA Card */}
            <div className="p-6 rounded-3xl border border-border/80 bg-card/60 dark:bg-card/30 backdrop-blur-xl space-y-4 shadow-e2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Clock className="size-4 text-emerald-500" />
                  <span>Support Desk Status</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-2xs font-mono font-bold">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Our support queue is monitored continuously throughout placement cycles. Average resolution time is under 12 hours.
              </p>

              <div className="pt-3 border-t border-border/60 text-xs space-y-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Support Hours:</span>
                  <span className="font-semibold text-foreground font-mono">Mon – Sat (9am – 9pm IST)</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Critical OA Escalations:</span>
                  <span className="font-semibold text-emerald-500 font-mono">24/7 Monitored</span>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="p-6 rounded-3xl border border-border/80 bg-card/60 dark:bg-card/30 backdrop-blur-xl space-y-3 shadow-e2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="size-3.5 text-amber-500" />
                Helpful Resources
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/dsa"
                    className="flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-muted/50 transition-colors font-medium group"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="size-4 text-primary" />
                      14 Core DSA Patterns
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/oa/free-universal-diagnostic-oa"
                    className="flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-muted/50 transition-colors font-medium group"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="size-4 text-amber-500" />
                      Free Diagnostic OA Test
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="flex items-center justify-between p-2 rounded-xl text-foreground hover:bg-muted/50 transition-colors font-medium group"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="size-4 text-emerald-500" />
                      BigO Pro & OA Season Pass
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2 px-1">
                <HelpCircle className="size-4 text-emerald-500" />
                Frequently Asked Questions
              </h3>

              <div className="space-y-2.5">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/70 bg-card/60 dark:bg-card/30 overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <span className="pr-2">{faq.question}</span>
                        <ChevronDown
                          className={cn(
                            'size-4 text-muted-foreground shrink-0 transition-transform duration-200',
                            isOpen && 'rotate-180 text-emerald-500'
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <Footer variant="public" />

      {/* Global Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        defaultType={feedbackModalType}
      />
    </div>
  );
}
