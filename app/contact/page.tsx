'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  MessageSquare,
  Bug,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { useToast } from '@/components/ui/toast';

const FAQS = [
  {
    question: 'How fast does the support team respond?',
    answer:
      'We typically respond to all support queries and bug reports within 12 to 24 hours. Critical bugs are prioritized immediately.',
  },
  {
    question: 'How do I submit a bug report or feature request?',
    answer:
      'You can use the built-in "Report Bug / Feedback" button anywhere in the app or submit your feedback directly via the form on this page. Up to 5 submissions per day are allowed per user.',
  },
  {
    question: 'Can I track the status of my submitted feedback?',
    answer:
      'Yes! If you are logged in, our team reviews your feedback in the admin portal. Key updates will be reflected in platform updates and email notifications.',
  },
  {
    question: 'Is BigO free to use for interview preparation?',
    answer:
      'Yes, BigO provides curated DSA patterns, CS core topic guides, and problem tracking free of charge for students and software engineers.',
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
        description: 'We have received your message and will get back to you shortly.',
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

  const openFeedback = (type: 'bug' | 'feedback') => {
    setFeedbackModalType(type);
    setFeedbackModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 pb-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto animate-in-up">
          <Badge variant="outline" className="px-4 py-1 rounded-full border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5 text-xs font-semibold gap-1.5">
            <Sparkles className="size-3.5" />
            We&apos;re here to help
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-foreground">
            Contact & Support
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Have questions, feedback, or need help with your DSA & CS interview prep? Get in touch with our team.
          </p>
        </div>

        {/* Quick Contact Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:border-rose-500/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 grid place-items-center">
              <Mail className="size-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Direct Email</h3>
            <p className="text-sm text-muted-foreground">
              Send us an email directly and our team will get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@bigoprep.tech"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline pt-2"
            >
              support@bigoprep.tech <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="p-6 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:border-blue-500/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center">
              <MessageSquare className="size-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Submit Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Share suggestions, feature requests, or general thoughts on how we can improve BigO.
            </p>
            <button
              type="button"
              onClick={() => openFeedback('feedback')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2"
            >
              Open Feedback Dialog <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="p-6 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm hover:border-red-500/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 grid place-items-center">
              <Bug className="size-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">Report a Bug</h3>
            <p className="text-sm text-muted-foreground">
              Noticed a broken link, visual glitch, or incorrect question output? Let us know.
            </p>
            <button
              type="button"
              onClick={() => openFeedback('bug')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:underline pt-2"
            >
              Report Issue <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Form + Info / FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-3xl border-none bg-card/90 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-display font-bold text-foreground">Send Us a Message</h2>
              <p className="text-sm text-muted-foreground">
                Fill out the form below. Rate limit of 5 submissions per day applies.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-3xl bg-emerald-500/10 text-center space-y-3 animate-in-up">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. We have logged your request and will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-6 h-11 rounded-full text-sm font-medium bg-background text-foreground shadow-sm hover:bg-muted transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name" className="text-xs font-semibold px-2">Your Name *</Label>
                    <input
                      id="contact-name"
                      required
                      placeholder="Mayank Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-xs font-semibold px-2">Email Address *</Label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-subject" className="text-xs font-semibold px-2">Subject *</Label>
                  <input
                    id="contact-subject"
                    required
                    placeholder="How can we help you?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 px-5 rounded-full bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-xs font-semibold px-2">Message *</Label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Provide details about your query..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-muted/40 border-none outline-none text-sm text-foreground focus:bg-background focus:ring-2 focus:ring-rose-500/30 transition-all duration-200 resize-none placeholder:text-muted-foreground/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 h-11 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* FAQs & SLA Side */}
          <div className="lg:col-span-5 space-y-8">
            {/* SLA Card */}
            <div className="p-6 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                <Clock className="size-4" />
                <span>Response Time SLA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We monitor incoming queries continuously. Average response time is under 12 hours on weekdays.
              </p>
              <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground flex justify-between">
                <span>Support Hours:</span>
                <span className="font-semibold text-foreground">Mon – Sat (9am – 9pm IST)</span>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="size-5 text-rose-500" />
                Frequently Asked Questions
              </h3>

              <div className="space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`size-4 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-rose-500' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in-down">
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

      {/* Global Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BigO Prep. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors font-medium text-foreground">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        defaultType={feedbackModalType}
      />
    </div>
  );
}
