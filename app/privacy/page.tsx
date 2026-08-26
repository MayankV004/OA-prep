'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, ArrowLeft, Clock, Eye, Database, Server } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/shell/Footer';

export default function PrivacyPage() {
  const lastUpdated = 'August 26, 2026';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-28 pb-16 space-y-10">
        {/* Header */}
        <div className="space-y-4 border-b border-border/60 pb-8 animate-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="outline" className="px-3 py-0.5 rounded-full border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5 text-2xs font-semibold gap-1">
                <Lock className="size-3" /> Data Protection
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground">
                Privacy Policy
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40">
              <Clock className="size-3.5" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            BigO (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) values your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website and application.
          </p>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2 m-0">
              <Eye className="size-5 text-blue-500" />
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground">We collect information to provide better services to our users:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1.5">
              <li>
                <strong>Account Information:</strong> When you register an account or sign in using OAuth (Google, GitHub), we collect your name, email address, profile avatar URL, and authentication identifiers.
              </li>
              <li>
                <strong>Practice & Activity Data:</strong> We track your problem completion status, revision logs, custom notes, practice streak counters, and time spent on DSA patterns.
              </li>
              <li>
                <strong>Feedback & Support Submissions:</strong> When you submit a bug report or feedback, we collect your title, description, category, severity rating, and current page URL.
              </li>
              <li>
                <strong>Technical & Device Data:</strong> For security and rate limiting purposes (such as limiting feedback submissions to 5 per day), we record IP addresses, browser user agent strings, and request timestamps.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2 m-0">
              <Database className="size-5 text-blue-500" />
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1.5">
              <li>To provide, operate, maintain, and personalize the BigO platform and dashboard analytics.</li>
              <li>To measure your learning progress, generate activity heatmaps, and save problem revision lists.</li>
              <li>To enforce rate limits (max 5 feedback/reports per 24 hours) and prevent system abuse.</li>
              <li>To notify platform administrators of bug reports and user feedback via automated emails.</li>
              <li>To send essential transactional notifications (such as OTP verification codes or password reset links).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              3. Cookies and Local Storage
            </h2>
            <p className="text-muted-foreground">
              We use session cookies and browser Local Storage to maintain your logged-in state, remember your theme preference (Dark/Light mode), and cache client-side query results for fast page loads. We do NOT use invasive third-party tracking cookies or sell your browsing history to advertising networks.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2 m-0">
              <Server className="size-5 text-blue-500" />
              4. Third-Party Infrastructure & Service Providers
            </h2>
            <p className="text-muted-foreground">We partner with reputable cloud infrastructure providers to run BigO securely:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1.5">
              <li><strong>MongoDB Atlas:</strong> Encrypted database storage for user profiles and progress logs.</li>
              <li><strong>Upstash Redis:</strong> High-performance rate limiting and transient caching.</li>
              <li><strong>Resend API:</strong> Transactional email delivery service for verification emails and admin notifications.</li>
              <li><strong>Google & GitHub OAuth:</strong> Secure single-sign-on authentication options.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              5. Data Security & Retention
            </h2>
            <p className="text-muted-foreground">
              We employ industry-standard encryption protocols (TLS/HTTPS in transit, AES encryption at rest) to safeguard your personal data. We retain your account information for as long as your account remains active.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              6. Your Rights & Data Export
            </h2>
            <p className="text-muted-foreground">You have full control over your personal data:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1.5">
              <li>
                <strong>Data Export:</strong> You can download a complete JSON export of all your profile data and progress logs anytime via the account menu or at <code className="text-foreground">/api/export</code>.
              </li>
              <li>
                <strong>Account Deletion:</strong> You can request complete deletion of your account and associated data by contacting our support team.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              7. Privacy Policy Updates & Contact
            </h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated timestamp.
            </p>
            <p className="text-muted-foreground">
              If you have any questions or privacy inquiries, please visit our{' '}
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 font-semibold underline">
                Contact Page
              </Link>{' '}
              or email us at <code className="text-foreground">support@bigoprep.tech</code>.
            </p>
          </section>
        </div>
      </main>

      {/* Global Footer */}
      <Footer variant="public" />
    </div>
  );
}
