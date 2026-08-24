'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  BrainCircuit,
  BookOpen,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';

const fadeIn: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function LandingPage() {
  const [liveStats, setLiveStats] = useState({
    variations: '90+',
    problems: '500+',
    topics: '7',
  });

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLiveStats({
            variations: data.variationCount || '90+',
            problems: data.problemCount || '500+',
            topics: String(data.topicCount || 7),
          });
        }
      })
      .catch(() => {});
  }, []);

  const features = [
    {
      title: 'Pattern-Based DSA',
      description: 'Master Data Structures & Algorithms by learning reusable patterns like Two Pointers, Sliding Window, and Graph Traversals.',
      icon: Code2,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'CS Core Fundamentals',
      description: 'Comprehensive coverage of OS, DBMS, Computer Networks, and System Design concepts tailored for tech interviews.',
      icon: Terminal,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Smart Flashcard Engine',
      description: 'Spaced repetition system designed to retain crucial algorithms, time complexities, and core concepts effortlessly.',
      icon: BookOpen,
      color: 'from-rose-500 to-pink-500',
    },
    {
      title: 'OA & Mock Workspaces',
      description: 'Simulate real Online Assessments with integrated code execution environments and strict time limits.',
      icon: BrainCircuit,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const stats = [
    { label: 'Pattern Variations', value: liveStats.variations },
    { label: 'Curated Problems', value: liveStats.problems },
    { label: 'Core CS Topics', value: liveStats.topics },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* 1. Floating Navbar with Animated Theme Switcher */}
      <Navbar />

      {/* 2. Hero Geometric Section (21st.dev component style) */}
      <HeroGeometric
        badge="Next-Gen Placement Preparation"
        title1="Crack Your OA & Interview."
        title2="Zero Distractions."
        description="Structured DSA pattern roadmaps, interactive CS core modules, spaced-repetition flashcards, and real-time coding environments designed to help you land top engineering roles."
      />

      {/* 3. Stats Strip */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 -mt-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-3xl bg-background/80 dark:bg-background/40 backdrop-blur-xl border border-border/60 shadow-xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 relative max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" /> High-Yield Preparation
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Everything you need to excel in{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Technical Rounds
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Stop solving random problems. Follow a battle-tested roadmap designed by engineers who cracked FAANG and top product companies.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                className="group relative p-6 rounded-3xl bg-background/60 dark:bg-background/30 backdrop-blur-xl border border-border/50 hover:border-indigo-500/50 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="pt-6 flex items-center gap-1 text-xs font-semibold text-indigo-500 group-hover:text-indigo-400 transition-colors">
                  <span>Learn more</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 5. Interactive Code & Practice Workspace Section */}
      <section className="py-20 px-4 md:px-8 bg-foreground/[0.02] dark:bg-white/[0.02] border-y border-border/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Structured Problem Variation
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Master Variations, <br /> Not Just Single Problems
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Companies rarely ask textbook questions. BigO categorizes problems into core variations so you can adapt your approach during live interviews.
            </p>

            <ul className="space-y-3">
              {[
                'Handpicked problem sets mapped to top company OA patterns',
                'Detailed complexity breakdowns and intuition notes',
                'Integrated code playground with multi-language execution',
                'Personalized progress tracker and target goals',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link href="/dsa">
                <button className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-lg hover:shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all">
                  Browse DSA Roadmap
                </button>
              </Link>
            </div>
          </div>

          {/* Interactive Mock Code Window */}
          <div className="relative rounded-3xl bg-slate-950 p-6 shadow-2xl border border-slate-800 text-slate-100 font-mono text-sm overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-slate-400 font-sans">two_sum_variation.cpp</span>
            </div>
            <pre className="text-slate-300 leading-relaxed overflow-x-auto">
              <code>{`// Pattern: Two Pointers (Target Sum Pair)
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`}</code>
            </pre>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>All 15 test cases passed</span>
              </div>
              <span className="text-slate-500 font-sans">Runtime: 4ms · O(N)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Section */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
            Ready to Level Up Your Placement Game?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands of students who built structured interview prep habits and landed their dream roles.
          </p>
          <div className="pt-4">
            <Link href="/sign-up">
              <button className="group relative inline-flex items-center justify-center h-14 px-10 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_50px_rgba(225,29,72,0.7)] transition-all duration-300 hover:scale-105 active:scale-95">
                <span>Get Started Now — It's Free</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 px-6 border-t border-border/40 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-foreground">BigO</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/dsa" className="hover:text-foreground transition-colors">DSA Patterns</Link>
            <Link href="/subjects" className="hover:text-foreground transition-colors">CS Core</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
