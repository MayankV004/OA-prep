'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft, Clock } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Badge } from '@/components/ui/badge';

export default function TermsPage() {
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
              <Badge variant="outline" className="px-3 py-0.5 rounded-full border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5 text-2xs font-semibold gap-1">
                <ShieldCheck className="size-3" /> Legal Agreement
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground">
                Terms and Conditions
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40">
              <Clock className="size-3.5" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please read these Terms and Conditions (&quot;Terms&quot;) carefully before using the BigO application, website, and services (&quot;Service&quot;).
          </p>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2 m-0">
              <FileText className="size-5 text-rose-500" />
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing or using BigO (accessible via web applications and related APIs), you agree to be bound by these Terms and our Privacy Policy. If you do not agree to all of these terms, you must not access or use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              2. User Accounts & Eligibility
            </h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1.5">
              <li>
                <strong>Eligibility:</strong> You must be at least 13 years old (or legal age in your jurisdiction) to create an account.
              </li>
              <li>
                <strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your authentication credentials (including OAuth logins via Google or GitHub) and for all activities occurring under your account.
              </li>
              <li>
                <strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during registration.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              3. Code of Conduct & Acceptable Use
            </h2>
            <p className="text-muted-foreground">When using BigO, you agree NOT to:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1.5">
              <li>Use the Service for any unlawful or unauthorized purpose.</li>
              <li>Attempt to bypass rate limits, probe, scan, or reverse engineer any part of the application infrastructure.</li>
              <li>Use automated scripts, bots, scrapers, or crawlers to extract content, problem sets, or user data without written permission.</li>
              <li>Submit malicious code, spam, abusive feedback, or false bug reports.</li>
              <li>Share account access with third parties or engage in credential sharing.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              4. Intellectual Property Rights
            </h2>
            <p className="text-muted-foreground">
              All materials on BigO — including software code, UI design, DSA pattern curricula, CS core guides, graphics, logos, and trademarks — are owned by or licensed to BigO and protected under applicable copyright and intellectual property laws.
            </p>
            <p className="text-muted-foreground">
              You are granted a personal, non-exclusive, non-transferable, revocable license to access and use the Service strictly for personal learning and interview preparation purposes.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              5. Service Modifications & Termination
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any feature or aspect of the Service at any time without prior notice. We may terminate or suspend access to your account immediately if you violate these Terms.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              6. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. BINGO DOES NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR ENTIRELY SECURE.
            </p>
            <p className="text-muted-foreground">
              IN NO EVENT SHALL BINGO BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OR INABILITY TO USE THE SERVICE.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              7. Feedback & Submissions
            </h2>
            <p className="text-muted-foreground">
              Any feedback, bug reports, or feature suggestions you submit to BigO through our feedback system or contact forms become non-confidential and non-proprietary property of BigO. We reserve the right to use such feedback to improve our platform without obligation or compensation to you.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 p-6 rounded-2xl border border-border/50 bg-card/40">
            <h2 className="text-xl font-display font-bold text-foreground m-0">
              8. Contact Us
            </h2>
            <p className="text-muted-foreground">
              If you have any questions or concerns regarding these Terms, please reach out to us via our{' '}
              <Link href="/contact" className="text-rose-600 dark:text-rose-400 font-semibold underline">
                Contact Page
              </Link>{' '}
              or email us at <code className="text-foreground">support@bigoprep.tech</code>.
            </p>
          </section>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BigO Prep. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors font-medium text-foreground">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
