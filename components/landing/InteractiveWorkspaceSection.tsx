'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, CheckCircle2 } from 'lucide-react';
import { ScrollReveal, Scroll3DCard } from '@/components/ui/scroll-reveal';
import { CODE_SNIPPETS, WORKSPACE_HIGHLIGHTS } from './landing-data';

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
    <section className="py-24 px-4 md:px-8 bg-foreground/[0.02] dark:bg-white/[0.015] border-y border-border/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <ScrollReveal direction="right" delay={0.2}>
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Master Variations, <br />
              <span className="text-primary">
                Not Single Problems
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-light">
              Companies test adaptability under pressure. BigO categorizes problems into core variations so you can quickly identify patterns and write optimal code in timed interview environments.
            </p>

            <ul className="space-y-3.5">
              {WORKSPACE_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link href="/dsa">
                <button className="px-8 py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-95 transition-all cursor-pointer border-0">
                  Browse DSA Roadmap
                </button>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Code Window with 3D Tilt Scroll Effect */}
        <ScrollReveal direction="left" delay={0.3}>
          <Scroll3DCard>
            <div className="relative rounded-3xl bg-[#0c0c0e] p-6 shadow-2xl border border-border text-foreground font-mono text-sm overflow-hidden">
              {/* Code Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-primary/80" />
                  <span className="ml-2 text-xs text-muted-foreground font-sans font-medium">
                    {CODE_SNIPPETS[activeTab].file}
                  </span>
                </div>

                {/* Language Selector Tabs */}
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
                  {(['cpp', 'python', 'java'] as const).map((langKey) => (
                    <button
                      key={langKey}
                      onClick={() => setActiveTab(langKey)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer border-0 ${
                        activeTab === langKey
                          ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent'
                      }`}
                    >
                      {CODE_SNIPPETS[langKey].lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Body */}
              <div className="relative min-h-[220px]">
                <pre className="text-foreground/90 leading-relaxed overflow-x-auto text-xs sm:text-sm">
                  <code>{CODE_SNIPPETS[activeTab].code}</code>
                </pre>
              </div>

              {/* Code Action Footer */}
              <div className="mt-4 pt-4 border-t border-border/80 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors font-semibold cursor-pointer"
                  >
                    <Play className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                  </button>
                </div>

                {showPassMessage && (
                  <div className="flex items-center gap-2 text-primary animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {CODE_SNIPPETS[activeTab].stats}
                    </span>
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
