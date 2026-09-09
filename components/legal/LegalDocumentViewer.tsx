'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Clock,
  Eye,
  Database,
  Server,
  FileText,
  UserCheck,
  CheckCircle2,
  Cpu,
  Mail,
  AlertTriangle,
  AlertCircle,
  Scale,
  BookOpen,
  Terminal,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/shell/Footer';

const PRIVACY_SECTIONS = [
  { id: 'summary', label: 'Executive Summary', icon: CheckCircle2 },
  { id: 'collection', label: '1. Information We Collect', icon: Eye },
  { id: 'code-privacy', label: '2. Candidate Code & Sandbox', icon: Cpu },
  { id: 'proctoring', label: '3. Proctoring & Telemetry', icon: Shield },
  { id: 'usage', label: '4. How We Use Data', icon: Database },
  { id: 'cookies', label: '5. Cookies & Local Storage', icon: Lock },
  { id: 'infrastructure', label: '6. Sub-processors & Cloud', icon: Server },
  { id: 'security', label: '7. Encryption & Security', icon: Lock },
  { id: 'rights', label: '8. Candidate Rights & Erasure', icon: UserCheck },
  { id: 'contact', label: '9. Contact & Privacy Office', icon: Mail },
];

const TERMS_SECTIONS = [
  { id: 'summary', label: 'Executive Summary', icon: CheckCircle2 },
  { id: 'acceptance', label: '1. Acceptance & Eligibility', icon: UserCheck },
  { id: 'accounts', label: '2. Accounts & Security', icon: ShieldCheck },
  { id: 'license', label: '3. Intellectual Property', icon: BookOpen },
  { id: 'assessments', label: '4. Assessments & Proctoring', icon: Terminal },
  { id: 'code-sandbox', label: '5. Sandbox & Fair Compute', icon: Cpu },
  { id: 'conduct', label: '6. Prohibited Activities', icon: AlertTriangle },
  { id: 'availability', label: '7. Service Availability', icon: Clock },
  { id: 'liability', label: '8. Limitation of Liability', icon: Scale },
  { id: 'termination', label: '9. Suspension & Termination', icon: Shield },
  { id: 'contact', label: '10. Legal Inquiries & Contact', icon: Mail },
];

interface LegalDocumentViewerProps {
  initialDoc?: 'privacy' | 'terms';
}

export function LegalDocumentViewer({ initialDoc = 'privacy' }: LegalDocumentViewerProps) {
  const [activeDoc, setActiveDoc] = useState<'privacy' | 'terms'>(initialDoc);
  const [activeSection, setActiveSection] = useState('summary');

  const privacyDate = 'September 10, 2026';
  const termsDate = 'September 10, 2026';

  const currentSections = activeDoc === 'privacy' ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('terms')) {
        setActiveDoc('terms');
      } else {
        setActiveDoc('privacy');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track active scroll-spy section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (let i = currentSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(currentSections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(currentSections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSections, activeDoc]);

  // Smooth switch function with address bar update
  const handleDocSwitch = (doc: 'privacy' | 'terms') => {
    if (doc === activeDoc) return;
    setActiveDoc(doc);
    setActiveSection('summary');
    const targetUrl = doc === 'privacy' ? '/privacy' : '/terms';
    window.history.pushState(null, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20 selection:text-emerald-400">
      <Navbar />

      {/* ── Top Ambient Lighting Glow ── */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-500/[0.07] via-emerald-500/[0.02] to-transparent blur-3xl z-0" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20 relative z-10">
        
        {/* ── Breadcrumb & Smooth Animated Toggle ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border/60">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>

          {/* Document Switcher Toggle with Framer Motion Spring Pill */}
          <div className="inline-flex p-1 rounded-full bg-muted/70 dark:bg-white/[0.05] border border-border/80 dark:border-white/10 relative items-center self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => handleDocSwitch('privacy')}
              className={`relative z-10 inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none outline-none ${
                activeDoc === 'privacy' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeDoc === 'privacy' && (
                <motion.div
                  layoutId="legal-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-emerald-400 shadow-sm -z-10"
                />
              )}
              <Shield className="size-3.5" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => handleDocSwitch('terms')}
              className={`relative z-10 inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none outline-none ${
                activeDoc === 'terms' ? 'text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeDoc === 'terms' && (
                <motion.div
                  layoutId="legal-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-emerald-400 shadow-sm -z-10"
                />
              )}
              <FileText className="size-3.5" />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>

        {/* ── Page Hero Header with Animated Transitions ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDoc + '-header'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="py-10 sm:py-12 space-y-4 max-w-3xl"
          >
            {activeDoc === 'privacy' ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Data Protection & Privacy Architecture</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-foreground">
                  Privacy Policy
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                  At BigO, we believe your interview preparation data, algorithmic practice, and written code belong solely to you. We do not sell your personal data or run intrusive third-party advertising trackers.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/60 border border-border/60 font-mono">
                    <Clock className="size-3.5 text-emerald-500" />
                    Last updated: {privacyDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/60 border border-border/60 font-mono">
                    Version: 2.4 Enterprise
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Candidate Agreement & Terms of Service</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-foreground">
                  Terms and Conditions
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                  Welcome to BigO. These Terms and Conditions govern your access to and use of our assessment simulations, algorithmic curriculum, code execution sandboxes, and learning tools.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/60 border border-border/60 font-mono">
                    <Clock className="size-3.5 text-emerald-500" />
                    Last updated: {termsDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/60 border border-border/60 font-mono">
                    Contract Version: 2.4
                  </span>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Two Column Architecture: Sticky ToC & Animated Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
          
          {/* ── Sticky Sidebar (Desktop) ── */}
          <aside className="hidden lg:block sticky top-28 space-y-3">
            <div className="p-4 rounded-2xl bg-card/60 dark:bg-[#0E131F]/60 border border-border/70 backdrop-blur-xl space-y-1">
              <div className="px-3 py-2 text-2xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {activeDoc === 'privacy' ? 'Privacy Sections' : 'Terms Sections'}
              </div>
              <nav className="space-y-0.5">
                {currentSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                      <span className="truncate">{sec.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Context Callout */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>{activeDoc === 'privacy' ? 'Data Privacy Pledge' : 'Fair Play Promise'}</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {activeDoc === 'privacy'
                  ? 'We never monetize your code submissions, sell candidate lists to third parties, or run invasive ad trackers.'
                  : 'BigO is built to legitimately boost your engineering skills. Honor code enforcement protects honest candidate scorecards.'}
              </p>
              <Link
                href={activeDoc === 'privacy' ? '/contact' : '/oa'}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {activeDoc === 'privacy' ? 'Contact Privacy Desk' : 'View OA Library'}{' '}
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </aside>

          {/* ── Document Body Content with AnimatePresence Transitions ── */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {activeDoc === 'privacy' ? (
                <motion.div
                  key="privacy-body"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-8"
                >
                  {/* Section 0: Executive Summary Cards */}
                  <section id="summary" className="scroll-mt-28 space-y-4">
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-card/70 to-card/40 border border-emerald-500/20 backdrop-blur-xl shadow-xs space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-display font-bold text-foreground">
                            Privacy at a Glance (TL;DR)
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Key commitments on how we safeguard candidate information
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Zero Data Brokerage
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            We never sell, rent, or trade your personal email, code submissions, or metrics to advertisers.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Ephemeral Code Runtimes
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Your test-room code runs in isolated, throwaway sandbox cgroups and is not fed into external LLM training pools.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            On-Device Proctoring
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Gaze tracking and anti-cheat models execute locally in your browser. Raw webcam feeds are never permanently stored on servers.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Candidate Account Control
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            You retain full control over your profile, with permanent account deletion and data removal available upon request.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 1: Information We Collect */}
                  <section id="collection" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Eye className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        1. Information We Collect
                      </h2>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To power your algorithmic dashboard, simulate real-world technical assessments, and measure your placement readiness, we collect the following categories of information:
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          A. Identity & Authentication Credentials
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          When registering via email or OAuth (Google, GitHub), we receive your primary name, verified email address, avatar thumbnail URL, and secure provider account tokens. Passwords hashed with state-of-the-art hashing algorithms are stored securely and are never retrievable in plaintext.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          B. Curriculum & Algorithmic Practice History
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          We persist your solved DSA variations, spaced repetition schedules, custom problem notes, bookmarks, quiz answers, and activity heatmaps so your preparation state is restored seamlessly across devices.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          C. Technical Metadata & Security Logs
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          To prevent malicious abuse, execute Upstash Redis rate limiting, and protect candidate scorecards, we log standard HTTP request metadata: client IP address, user-agent string, operating system type, and timestamp telemetry.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Code Privacy & Sandbox */}
                  <section id="code-privacy" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Cpu className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        2. Candidate Code & Execution Sandbox
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When you click &quot;Run Code&quot; or &quot;Submit Assessment&quot; in our Monaco-powered test cockpit:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <div className="text-xs font-mono font-bold uppercase text-emerald-500">
                          Ephemeral Cgroups
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Code compiles inside short-lived Linux cgroups (via Docker Piston) with 2000ms CPU hard execution caps.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <div className="text-xs font-mono font-bold uppercase text-emerald-500">
                          Zero LLM Ingestion
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your code solutions are not syndicated or sold to foundation models or third-party AI training corpuses.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <div className="text-xs font-mono font-bold uppercase text-emerald-500">
                          Local Auto-Saving
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Unsubmitted test drafts are cached locally in your browser storage and wiped upon final submission.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Proctoring & Telemetry */}
                  <section id="proctoring" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Shield className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        3. Anti-Cheat & Proctoring Telemetry
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      During simulated and institutional Online Assessments (OAs), proctoring mechanisms ensure scorecard integrity:
                    </p>

                    <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Gaze Deviation Detection:</strong> FaceMesh models run via WebAssembly directly inside your browser client. Raw camera streams are evaluated frame-by-frame on your device, and no video files are streamed or uploaded to our servers.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Window Focus Auditing:</strong> The browser Page Visibility API logs window blur events when a candidate switches tabs or changes applications during an active test room session.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Clipboard Integrity:</strong> In production mode, paste interceptors log copy-paste frequency into your assessment audit log for recruiter review.</span>
                      </li>
                    </ul>
                  </section>

                  {/* Section 4: How We Use Data */}
                  <section id="usage" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Database className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        4. How We Use Your Information
                      </h2>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <p>We process information strictly for operational and educational purposes:</p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>To provide personalized performance dashboards, company readiness ratings, and dynamic quiz reviews.</li>
                        <li>To verify eligibility and send one-time password (OTP) verification emails via Resend.</li>
                        <li>To safeguard server infrastructure against denial-of-service (DoS) attempts and brute-force attacks via Upstash Redis.</li>
                        <li>To deliver platform product updates and critical security advisories (only to subscribed users).</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 5: Cookies & Local Storage */}
                  <section id="cookies" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Lock className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        5. Cookies and Local Storage
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      BigO relies exclusively on strictly necessary functional storage mechanisms:
                    </p>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-start justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs">
                        <div>
                          <span className="font-semibold text-foreground">Authentication Cookie (`better-auth`)</span>
                          <p className="text-muted-foreground pt-0.5">Secure, HttpOnly session cookie maintaining active login state.</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-2xs font-semibold">
                          Essential
                        </span>
                      </div>

                      <div className="flex items-start justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs">
                        <div>
                          <span className="font-semibold text-foreground">Theme Preference (`theme`)</span>
                          <p className="text-muted-foreground pt-0.5">Remembers whether you selected Dark Mode, Light Mode, or System default.</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-2xs font-semibold">
                          Preferences
                        </span>
                      </div>

                      <div className="flex items-start justify-between p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs">
                        <div>
                          <span className="font-semibold text-foreground">Local Test Drafts (`oa_draft_*`)</span>
                          <p className="text-muted-foreground pt-0.5">Prevents data loss during accidental browser tab crashes while typing code.</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-2xs font-semibold">
                          Transient
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Section 6: Infrastructure & Sub-processors */}
                  <section id="infrastructure" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Server className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        6. Sub-processors and Cloud Infrastructure
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We work exclusively with enterprise cloud partners that maintain SOC 2, ISO 27001, and GDPR compliance certifications:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <div className="font-semibold text-foreground text-xs flex items-center justify-between">
                          <span>MongoDB Atlas</span>
                          <span className="text-2xs text-muted-foreground font-mono">Database</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          AES-256 encrypted database cluster hosting user profiles and progress documents.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <div className="font-semibold text-foreground text-xs flex items-center justify-between">
                          <span>Upstash Redis</span>
                          <span className="text-2xs text-muted-foreground font-mono">Edge Memory</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Low-latency rate limiting and temporary token verification cache with automated TTL eviction.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <div className="font-semibold text-foreground text-xs flex items-center justify-between">
                          <span>Resend Inc.</span>
                          <span className="text-2xs text-muted-foreground font-mono">Transactional Email</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Delivers cryptographic OTP security codes and account verification messages.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <div className="font-semibold text-foreground text-xs flex items-center justify-between">
                          <span>Google & GitHub OAuth</span>
                          <span className="text-2xs text-muted-foreground font-mono">Single Sign-On</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Secure federated authentication protocols preventing credential re-use vulnerabilities.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 7: Security & Encryption */}
                  <section id="security" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Lock className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        7. Encryption and Data Security
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <p>
                        All network communication between your browser and BigO services is strictly enforced over <strong>TLS 1.3 encryption</strong> with HTTP Strict Transport Security (HSTS).
                      </p>
                      <p>
                        Databases are encrypted at rest using industry standard <strong>AES-256</strong>. Secrets, environment keys, and signing secrets are managed through isolated vault injection at build time.
                      </p>
                    </div>
                  </section>

                  {/* Section 8: Candidate Rights & Account Deletion */}
                  <section id="rights" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <UserCheck className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        8. Candidate Rights & Account Deletion
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Regardless of your geographic location, we extend full global privacy protections aligned with GDPR and CCPA standards:
                    </p>

                    <div className="space-y-3 pt-1">
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          Profile Management & Accuracy
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          You can view, manage, and correct your primary account details (name, email address, and OAuth authentication connections) anytime through your candidate profile settings.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          Right to Erasure (&quot;Right to be Forgotten&quot;)
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          You may request complete and permanent deletion of your profile, verified email, practice statistics, and assessment attempts from our active databases by contacting our support team.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 9: Contact & Privacy Office */}
                  <section id="contact" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/80 to-emerald-500/5 border border-border/80 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Mail className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        9. Contact & Privacy Inquiries
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      If you have questions, feedback, or wish to exercise your data privacy rights, our engineering and compliance teams are available:
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <a
                        href="mailto:support@bigoprep.tech"
                        className="flex-1 p-4 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 hover:border-emerald-500/40 transition-colors flex items-center gap-3 group"
                      >
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Mail className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                            Email Privacy Officer
                          </div>
                          <div className="text-2xs text-muted-foreground font-mono">
                            support@bigoprep.tech
                          </div>
                        </div>
                      </a>

                      <Link
                        href="/contact"
                        className="flex-1 p-4 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 hover:border-emerald-500/40 transition-colors flex items-center gap-3 group"
                      >
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <ExternalLink className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                            Contact & Feedback Desk
                          </div>
                          <div className="text-2xs text-muted-foreground">
                            Submit directly via platform
                          </div>
                        </div>
                      </Link>
                    </div>
                  </section>
                </motion.div>
              ) : (
                <motion.div
                  key="terms-body"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-8"
                >
                  {/* Section 0: Executive Summary */}
                  <section id="summary" className="scroll-mt-28 space-y-4">
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-card/70 to-card/40 border border-emerald-500/20 backdrop-blur-xl shadow-xs space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-display font-bold text-foreground">
                            Terms at a Glance (TL;DR)
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Key principles governing your use of the BigO platform
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Individual Learning License
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Your account grants personal access to practice 90+ algorithmic patterns and test simulations. Reselling or bulk scraping content is strictly prohibited.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Assessment Room Honor Code
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Candidates must complete diagnostic assessments without unauthorized external scripting or proctoring evasion techniques.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Fair Sandbox Compute
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Code execution sandboxes are provided for legitimate algorithm testing. Infinite forks, crypto-mining, or DoS payloads trigger instant IP bans.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 space-y-1">
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Your Code Stays Yours
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            You retain full intellectual property ownership of all custom algorithm code, comments, and notes written within our editor.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 1: Acceptance & Eligibility */}
                  <section id="acceptance" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <UserCheck className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        1. Acceptance of Terms & Eligibility
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <p>
                        By creating an account, browsing our website, or launching an assessment in our sandbox environment, you legally agree to be bound by these Terms and our Privacy Policy.
                      </p>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">Age & Competency Requirements</h3>
                        <p className="text-xs text-muted-foreground">
                          You must be at least 13 years of age (or the minimum legal age for digital service consent in your jurisdiction). If you are accessing BigO on behalf of a university or enterprise recruitment partner, you confirm you possess the authority to bind that entity to these Terms.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Accounts & Security */}
                  <section id="accounts" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <ShieldCheck className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        2. Candidate Accounts & Credential Security
                      </h2>
                    </div>

                    <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Accurate Registration:</strong> You agree to provide current and authentic contact details. Impersonating other candidates or recruiters violates our service terms.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Account Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of your session cookies and authentication credentials. Sharing logins across candidate pools is prohibited.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Compromise Reporting:</strong> If you suspect unauthorized access to your account or verified email, you must notify BigO support immediately.</span>
                      </li>
                    </ul>
                  </section>

                  {/* Section 3: Intellectual Property */}
                  <section id="license" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <BookOpen className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        3. Platform License & Curriculum Intellectual Property
                      </h2>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <p>
                        All software code, visual styling, algorithmic taxonomy, pattern breakdowns, proctoring architectures, test harnesses, and documentation on BigO are proprietary property of BigO.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                          <span className="text-xs font-semibold text-foreground">What You Can Do</span>
                          <p className="text-xs text-muted-foreground">
                            Access, solve, test, and reference curricula for personal learning and technical placement preparation.
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                          <span className="text-xs font-semibold text-foreground">What Is Prohibited</span>
                          <p className="text-xs text-muted-foreground">
                            Automated scraping, bulk mirroring, commercial redistribution, or republishing proprietary problem explanations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 4: Assessments & Proctoring */}
                  <section id="assessments" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Terminal className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        4. Assessment Cockpit & Proctoring Rules
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When entering an assessment room (`/oa/[slug]/test`), specific rules govern session integrity:
                    </p>

                    <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <span className="font-semibold text-foreground">A. Single-Session Locking</span>
                        <p className="text-muted-foreground">Once launched, the timer runs continuously based on server timestamps. Browser overscroll gestures and history back actions are trapped to prevent accidental test departure.</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                        <span className="font-semibold text-foreground">B. Forensic Audit Trail</span>
                        <p className="text-muted-foreground">Tab blurs, window minimizes, and clipboard operations may be logged into your assessment report. Tampering with proctoring WebAssembly harnesses invalidates your submission scorecard.</p>
                      </div>
                    </div>
                  </section>

                  {/* Section 5: Sandbox & Fair Compute */}
                  <section id="code-sandbox" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Cpu className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        5. Code Execution Sandbox & Fair Compute Policy
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      BigO provisions dedicated Linux sandbox runners (supporting C++20, Java, Python 3) for algorithmic verification:
                    </p>

                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>Execution Limits per Run</span>
                      </div>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                        <li>Maximum CPU runtime: <strong>3,000 milliseconds</strong> (3 seconds)</li>
                        <li>Maximum Memory cap: <strong>256 megabytes</strong> (cgroup isolated)</li>
                        <li>Network socket access: <strong>Hard blocked</strong> (no external internet requests)</li>
                        <li>Interactive rate limit: <strong>12 runs per minute</strong> per user</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 6: Prohibited Activities */}
                  <section id="conduct" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <AlertTriangle className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        6. Prohibited Activities & Abuse
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You agree not to engage in any of the following activities:
                    </p>

                    <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <li className="flex items-start gap-2.5">
                        <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Injecting memory fork-bombs, root exploits, or denial-of-service scripts into compiler harnesses.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Spamming the automated feedback desk or bug report APIs beyond reasonable limits (max 5 submissions / 24 hrs).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Reverse-engineering, decompiling, or disassembling any portion of the proctoring or platform software.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>Using artificial intelligence bots or proxy test-takers during institutional assessment evaluations.</span>
                      </li>
                    </ul>
                  </section>

                  {/* Section 7: Service Availability */}
                  <section id="availability" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Clock className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        7. Service Availability & Maintenance
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      While we target 99.9% platform uptime, BigO does not guarantee uninterrupted operation. Periodic maintenance, compiler updates, and cloud infrastructure changes may cause brief maintenance windows. We are not liable for transient network disruptions originating from local candidate ISPs.
                    </p>
                  </section>

                  {/* Section 8: Limitation of Liability */}
                  <section id="liability" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Scale className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        8. Disclaimers & Limitation of Liability
                      </h2>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs sm:text-sm text-muted-foreground space-y-2 leading-relaxed">
                      <p className="font-mono text-2xs uppercase text-foreground font-bold tracking-wider">
                        Important Legal Notice
                      </p>
                      <p>
                        THE BINGO PLATFORM AND ALL CURRICULA ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT EXPRESS OR IMPLIED WARRANTIES OF ANY KIND. BINGO DOES NOT GUARANTEE EMPLOYMENT OR SUCCESSFUL PLACEMENT OUTCOMES AT ANY SPECIFIC TECH COMPANY.
                      </p>
                      <p>
                        UNDER NO CIRCUMSTANCES SHALL BINGO BE LIABLE FOR INDIRECT, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF THE SERVICE.
                      </p>
                    </div>
                  </section>

                  {/* Section 9: Suspension & Termination */}
                  <section id="termination" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-card/60 dark:bg-[#0C101A]/60 border border-border/70 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Shield className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        9. Account Suspension and Termination
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We reserve the right to suspend, rate-limit, or terminate access to any account that violates these Terms, initiates malicious sandbox attacks, or circumvents proctoring rules. You may delete your account at any time via your profile settings or by reaching out to support.
                    </p>
                  </section>

                  {/* Section 10: Legal Inquiries & Contact */}
                  <section id="contact" className="scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card/80 to-emerald-500/5 border border-border/80 backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Mail className="size-4" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">
                        10. Legal Inquiries & Contact
                      </h2>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      For questions regarding these Terms, institutional licensing agreements, or dispute inquiries:
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <a
                        href="mailto:support@bigoprep.tech"
                        className="flex-1 p-4 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 hover:border-emerald-500/40 transition-colors flex items-center gap-3 group"
                      >
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Mail className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                            Email Legal Team
                          </div>
                          <div className="text-2xs text-muted-foreground font-mono">
                            support@bigoprep.tech
                          </div>
                        </div>
                      </a>

                      <Link
                        href="/contact"
                        className="flex-1 p-4 rounded-2xl bg-background/80 dark:bg-black/30 border border-border/70 hover:border-emerald-500/40 transition-colors flex items-center gap-3 group"
                      >
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <ExternalLink className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                            Help & Support Center
                          </div>
                          <div className="text-2xs text-muted-foreground">
                            Submit feedback or inquiries
                          </div>
                        </div>
                      </Link>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── Glassmorphic Public Footer ── */}
      <Footer variant="public" />
    </div>
  );
}
