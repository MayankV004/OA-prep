'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  CheckCircle2,
  Code2,
  ArrowRight,
  Layers,
  Zap,
  Terminal,
  Activity,
} from 'lucide-react';
import { ScrollReveal, Scroll3DCard } from '@/components/ui/scroll-reveal';
import { CODE_SNIPPETS } from './landing-data';

// Lightweight token highlighter for crystal-clear code in both light & dark modes
function highlightCodeLine(line: string) {
  // Comments
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span className="text-zinc-500 italic font-mono">{line}</span>;
  }

  // Preprocessor / Imports
  if (line.trim().startsWith('#include') || line.trim().startsWith('import ')) {
    const parts = line.split(/(#include|import)/);
    return (
      <span className="font-mono">
        <span className="text-emerald-400 font-semibold">{parts[1]}</span>
        <span className="text-amber-300">{parts[2]}</span>
      </span>
    );
  }

  // Tokenize keywords, builtins, functions, numbers, and operators
  const tokens = line.split(
    /(\b(?:int|const|return|for|while|if|else|def|public|class|boolean|new|continue|size_t|void)\b|\b(?:std|vector|list|Queue|LinkedList|Solution|accumulate|max|min|len)\b|\b(?:maxSumSubarray|maxArea|isBipartite)\b|\b\d+\b|[-+*\/=<>!&|?:;,.(){}\[\]]+|[ \t]+|[A-Za-z_][A-Za-z0-9_]*)/g
  );

  return (
    <span className="font-mono">
      {tokens.map((token, idx) => {
        if (!token) return null;
        if (/^(int|const|return|for|while|if|else|def|public|class|boolean|new|continue|size_t|void)$/.test(token)) {
          return <span key={idx} className="text-emerald-400 font-semibold">{token}</span>;
        }
        if (/^(std|vector|list|Queue|LinkedList|Solution|accumulate|max|min|len)$/.test(token)) {
          return <span key={idx} className="text-cyan-300">{token}</span>;
        }
        if (/^(maxSumSubarray|maxArea|isBipartite)$/.test(token)) {
          return <span key={idx} className="text-indigo-300 font-semibold">{token}</span>;
        }
        if (/^\d+$/.test(token)) {
          return <span key={idx} className="text-purple-300">{token}</span>;
        }
        if (/^[-+*\/=<>!&|?:;,.(){}\[\]]+$/.test(token)) {
          return <span key={idx} className="text-zinc-400">{token}</span>;
        }
        return <span key={idx} className="text-zinc-200">{token}</span>;
      })}
    </span>
  );
}

const FEATURE_PILLS = [
  {
    icon: Layers,
    title: 'Company OA Variations',
    desc: 'Handpicked problem sets categorized into 20+ core recurring patterns.',
  },
  {
    icon: Zap,
    title: 'Complexity & Intuition',
    desc: 'Visual mental models with Big-O trade-offs and trigger conditions.',
  },
  {
    icon: Terminal,
    title: 'Sub-ms Judge Sandbox',
    desc: 'Containerized execution for C++20, Java, and Python 3 with test harnesses.',
  },
  {
    icon: Activity,
    title: 'Readiness Analytics',
    desc: 'Placement preparedness scoring with automated spaced-repetition prompts.',
  },
];

export function InteractiveWorkspaceSection() {
  const [activeTab, setActiveTab] = useState<'cpp' | 'python' | 'java'>('cpp');
  const [isRunning, setIsRunning] = useState(false);
  const [showPassMessage, setShowPassMessage] = useState(true);

  const handleRunCode = () => {
    setIsRunning(true);
    setShowPassMessage(false);
    setTimeout(() => {
      setIsRunning(false);
      setShowPassMessage(true);
    }, 600);
  };

  return (
    <section className="py-24 sm:py-32 px-4 md:px-8 relative overflow-hidden bg-gradient-to-b from-muted/20 via-emerald-500/[0.03] to-background border-y border-border/70 dark:border-white/10 transition-colors">
      
      {/* ── Background Depth Grid & Ambient Emerald Aura ── */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 size-[650px] rounded-full bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-[400px] rounded-full bg-teal-500/[0.04] dark:bg-teal-500/[0.06] blur-3xl" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1.15fr] gap-12 lg:gap-16 items-center relative z-10">
        
        {/* ── Left Column: Pattern Philosophy & Highlights ── */}
        <ScrollReveal direction="right" delay={0.2}>
          <div className="space-y-6 sm:space-y-8">
            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-[1.12] text-foreground">
                Master Variations, <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                  Not Single Problems
                </span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
                Companies test adaptability under pressure. BigO categorizes problems into core variations so you can quickly identify patterns and write optimal code in timed interview environments.
              </p>
            </div>

            {/* 4 Rich Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {FEATURE_PILLS.map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.title}
                    className="p-4 rounded-2xl bg-card/80 dark:bg-surface-elevated/40 border border-border/70 dark:border-white/10 hover:border-emerald-500/40 backdrop-blur-md shadow-xs transition-all duration-200 space-y-1.5 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="size-3.5" />
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                        {pill.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-9.5">
                      {pill.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons & Live Stats */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dsa">
                <button className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 cursor-pointer border-0 active:scale-[0.98] text-sm">
                  <span>Explore DSA Roadmap</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/50 dark:bg-white/[0.04] px-3.5 py-2 rounded-full border border-border/60 dark:border-white/10">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>90+ Variations Ready</span>
              </div>
            </div>

          </div>
        </ScrollReveal>

        {/* ── Right Column: High-Contrast macOS Developer Cockpit ── */}
        <ScrollReveal direction="left" delay={0.3}>
          <Scroll3DCard>
            <div className="relative rounded-3xl bg-[#090D16] p-5 sm:p-7 shadow-2xl border border-border/80 dark:border-white/10 text-white font-mono text-xs sm:text-sm overflow-hidden ring-1 ring-black/10 dark:ring-white/5">
              
              {/* Top Specular Emerald Beam */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

              {/* Code Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                {/* macOS Controls + Filename */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="size-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 inline-block" />
                    <span className="size-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 inline-block" />
                    <span className="size-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 inline-block" />
                  </div>
                  <div className="h-3.5 w-px bg-white/10 mx-1 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-300 font-sans font-medium">
                    <Code2 className="size-3.5 text-emerald-400" />
                    <span>{CODE_SNIPPETS[activeTab].file}</span>
                  </div>
                </div>

                {/* Language Switcher Pill Toggle with Framer Motion */}
                <div className="flex items-center p-1 rounded-full bg-black/60 border border-white/10 shadow-inner">
                  {(['cpp', 'python', 'java'] as const).map((langKey) => (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => setActiveTab(langKey)}
                      className={`relative z-10 px-3 py-1 rounded-full text-xs font-semibold font-sans transition-colors cursor-pointer outline-none select-none ${
                        activeTab === langKey
                          ? 'text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {activeTab === langKey && (
                        <motion.div
                          layoutId="workspace-lang-pill"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          className="absolute inset-0 rounded-full bg-emerald-400 shadow-xs -z-10"
                        />
                      )}
                      <span>{CODE_SNIPPETS[langKey].lang}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Body with Line Numbers & Vibrant Syntax Colors */}
              <div className="relative min-h-[250px] max-h-[360px] overflow-y-auto overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
                <div className="font-mono text-xs sm:text-[13px] leading-relaxed select-text">
                  {CODE_SNIPPETS[activeTab].code.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex} className="flex hover:bg-white/[0.03] px-1 rounded-sm">
                      <span className="w-7 shrink-0 text-right pr-4 text-zinc-600 select-none text-[11px] font-mono">
                        {lineIndex + 1}
                      </span>
                      <span className="flex-1 whitespace-pre">
                        {highlightCodeLine(line)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Action Footer */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95 transition-all font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Play className={`size-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Compiling in Sandbox...' : 'Run Code'}</span>
                  </button>

                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Docker Piston</span>
                  </span>
                </div>

                {showPassMessage && (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    <span>{CODE_SNIPPETS[activeTab].stats}</span>
                  </div>
                )}
              </div>

            </div>
          </Scroll3DCard>
        </ScrollReveal>

      </div>
    </section>
  );
}
