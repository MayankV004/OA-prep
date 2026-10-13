'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Zap } from 'lucide-react';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';
import { Timer } from '@/components/animate-ui/icons/timer';
import { BadgeCheck } from '@/components/animate-ui/icons/badge-check';
import { ExternalLink } from '@/components/animate-ui/icons/external-link';
import { RotateCcw } from '@/components/animate-ui/icons/rotate-ccw';
import { cn } from '@/lib/utils';

// Real assessment problems directly from data/assessments/company-oa-seeds.ts
const REAL_HERO_ASSESSMENTS = [
  {
    id: 'amazon',
    company: 'Amazon',
    assessmentTitle: 'Amazon SDE-1 High-Frequency OA (2026)',
    assessmentSlug: 'amazon-sde1-oa-mock-1',
    durationMinutes: 90,
    problemTitle: 'Optimized Delivery Hub Parcel Grouping',
    patternTag: 'Sliding Window',
    difficulty: 'Medium',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    invariantRule:
      'Maintain running max and min within the sliding window. Expand right pointer while max - min <= k; contract left pointer when difference exceeds k.',
    sampleInput: 'weights = [8, 2, 4, 7], k = 4',
    expectedOutput: '2 (Valid Subarray: [2, 4] with max-min=2 <= 4)',
    code: {
      cpp: `// Amazon SDE-1 OA // Pattern: Sliding Window
#include <vector>
#include <deque>
#include <algorithm>

int longestSubarray(const std::vector<int>& weights, int k) {
    std::deque<int> maxDq, minDq;
    int left = 0, maxLen = 0;

    for (int right = 0; right < weights.size(); ++right) {
        while (!maxDq.empty() && weights[maxDq.back()] <= weights[right]) maxDq.pop_back();
        while (!minDq.empty() && weights[minDq.back()] >= weights[right]) minDq.pop_back();
        maxDq.push_back(right);
        minDq.push_back(right);

        while (weights[maxDq.front()] - weights[minDq.front()] > k) {
            left++;
            if (maxDq.front() < left) maxDq.pop_front();
            if (minDq.front() < left) minDq.pop_front();
        }
        maxLen = std::max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      python: `# Amazon SDE-1 OA // Pattern: Sliding Window
from collections import deque

def longestSubarray(weights: list[int], k: int) -> int:
    max_dq, min_dq = deque(), deque()
    left = 0
    max_len = 0
    
    for right, val in enumerate(weights):
        while max_dq and weights[max_dq[-1]] <= val:
            max_dq.pop()
        while min_dq and weights[min_dq[-1]] >= val:
            min_dq.pop()
        max_dq.append(right)
        min_dq.append(right)
        
        while weights[max_dq[0]] - weights[min_dq[0]] > k:
            left += 1
            if max_dq[0] < left:
                max_dq.popleft()
            if min_dq[0] < left:
                min_dq.popleft()
                
        max_len = max(max_len, right - left + 1)
    return max_len`,
    },
  },
  {
    id: 'google',
    company: 'Google',
    assessmentTitle: 'Google SWE Online Assessment Simulation',
    assessmentSlug: 'google-swe-oa-mock-1',
    durationMinutes: 60,
    problemTitle: 'Maximum Path Value in Grid with Obstacles',
    patternTag: 'Dynamic Programming',
    difficulty: 'Hard',
    timeComplexity: 'O(M * N)',
    spaceComplexity: 'O(N)',
    invariantRule:
      'Subproblem optimality: maxPath(i, j) = grid[i][j] + max(path(i-1, j), path(i, j-1)). Obstacle cells are pruned with negative infinity.',
    sampleInput: 'grid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]]',
    expectedOutput: '12 (Optimal path: 1 -> 3 -> 5 -> 2 -> 1)',
    code: {
      cpp: `// Google SWE OA // Pattern: 2D Dynamic Programming
#include <vector>
#include <algorithm>

int maxPathValue(const std::vector<std::vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    std::vector<int> dp(n, 0);

    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            if (grid[i][j] == -1) {
                dp[j] = -1; // Obstacle cell
                continue;
            }
            int fromTop = (i > 0 && dp[j] != -1) ? dp[j] : 0;
            int fromLeft = (j > 0 && dp[j - 1] != -1) ? dp[j - 1] : 0;
            dp[j] = grid[i][j] + std::max(fromTop, fromLeft);
        }
    }
    return dp[n - 1];
}`,
      python: `# Google SWE OA // Pattern: 2D Dynamic Programming
def maxPathValue(grid: list[list[int]]) -> int:
    m, n = len(grid), len(grid[0])
    dp = [0] * n
    
    for i in range(m):
        for j in range(n):
            if grid[i][j] == -1:
                dp[j] = -1 # Obstacle
                continue
            from_top = dp[j] if i > 0 and dp[j] != -1 else 0
            from_left = dp[j - 1] if j > 0 and dp[j - 1] != -1 else 0
            dp[j] = grid[i][j] + max(from_top, from_left)
            
    return dp[-1]`,
    },
  },
  {
    id: 'uber',
    company: 'Uber',
    assessmentTitle: 'Uber L3 Algorithmic Assessment',
    assessmentSlug: 'uber-l3-oa-mock-1',
    durationMinutes: 75,
    problemTitle: 'Ride Sharing Overlapping Interval Clustering',
    patternTag: 'Overlapping Intervals',
    difficulty: 'Medium',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    invariantRule:
      'Sort intervals by start time. If current.start <= previous.end, overlap exists: merge by setting previous.end = max(previous.end, current.end).',
    sampleInput: 'intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]',
    expectedOutput: '[[1, 6], [8, 10], [15, 18]] (Merged 1-3 & 2-6)',
    code: {
      cpp: `// Uber L3 OA // Pattern: Overlapping Intervals
#include <vector>
#include <algorithm>

std::vector<std::vector<int>> mergeIntervals(std::vector<std::vector<int>>& intervals) {
    if (intervals.empty()) return {};
    std::sort(intervals.begin(), intervals.end());
    
    std::vector<std::vector<int>> merged;
    merged.push_back(intervals[0]);

    for (size_t i = 1; i < intervals.size(); ++i) {
        auto& prev = merged.back();
        if (intervals[i][0] <= prev[1]) {
            prev[1] = std::max(prev[1], intervals[i][1]); // Extend interval
        } else {
            merged.push_back(intervals[i]); // Disjoint interval
        }
    }
    return merged;
}`,
      python: `# Uber L3 OA // Pattern: Overlapping Intervals
def mergeIntervals(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    
    for current in intervals[1:]:
        prev = merged[-1]
        if current[0] <= prev[1]:
            prev[1] = max(prev[1], current[1])
        else:
            merged.append(current)
            
    return merged`,
    },
  },
];

export function HeroExecutive() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lang, setLang] = useState<'cpp' | 'python'>('cpp');
  const [testVerified, setTestVerified] = useState(false);

  const current = REAL_HERO_ASSESSMENTS[activeIdx];

  const handleVerify = () => {
    setTestVerified(true);
  };

  const handleTabChange = (idx: number) => {
    setActiveIdx(idx);
    setTestVerified(false);
  };

  return (
    <section className="relative min-h-[92vh] w-full pt-28 pb-20 overflow-hidden bg-background">
      {/* Subtle Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[480px] w-[800px] max-w-full rounded-full bg-emerald-500/[0.06] dark:bg-emerald-500/[0.1] blur-[120px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Fold: High-Impact Typography & Action Group */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Real System Telemetry Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-sunken/80 dark:bg-white/[0.04] border border-border/80 dark:border-white/10 text-2xs sm:text-xs font-mono font-medium text-muted-foreground shadow-2xs backdrop-blur-md"
          >
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-foreground font-semibold">19 PATTERN ARCHETYPES</span>
            <span className="text-border dark:text-white/20">/</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">6 COMPANY OA SIMULATORS</span>
          </motion.div>

          {/* Master Headline in Sentence Case */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-[-0.04em] leading-[1.08] text-foreground text-balance"
          >
            Master the patterns behind <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              tier-1 online assessments.
            </span>
          </motion.h1>

          {/* Subtitle with Real Value Props */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed text-pretty"
          >
            Deconstruct technical rounds into 90+ reusable pattern variations. Simulate timed assessments for Amazon, Google, and Uber with hidden testcase verification, and lock core CS rounds.
          </motion.p>

          {/* High-Contrast Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link href="/dsa" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto inline-flex items-center justify-center h-12 sm:h-13 px-8 rounded-full font-bold text-sm sm:text-base text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/35 border-t border-white/30 transition-all duration-200 active:scale-[0.98] cursor-pointer">
                <span>Explore 19 Pattern Roadmaps</span>
                <ArrowRight size={18} animateOnHover className="ml-2" />
              </button>
            </Link>

            <Link href="/oa" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center h-12 sm:h-13 px-7 rounded-full font-semibold text-sm sm:text-base text-foreground bg-card hover:bg-muted/80 border border-border/80 dark:border-white/10 shadow-xs hover:border-emerald-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer">
                <Timer size={18} animateOnHover className="mr-2 text-emerald-500" />
                <span>Simulate Real Company OAs</span>
              </button>
            </Link>
          </motion.div>

          {/* Real Feature Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground font-medium"
          >
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck size={16} animateOnHover className="text-emerald-500" />
              <span>Free Forever Core Roadmaps</span>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck size={16} animateOnHover className="text-emerald-500" />
              <span>Zero Setup In-Browser Execution</span>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck size={16} animateOnHover className="text-emerald-500" />
              <span>Full Company Assessment Sets</span>
            </span>
          </motion.div>
        </div>

        {/* Flagship Hero Console: Live Preview of Real Company Assessment Questions */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 max-w-5xl mx-auto rounded-3xl border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#0c1017]/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden"
        >
          {/* Console Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-border/80 dark:border-white/10 bg-surface-sunken/60 dark:bg-white/[0.02]">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-rose-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-2xs font-mono font-semibold text-muted-foreground ml-2 hidden sm:inline">
                bigo://assessments/{current.assessmentSlug}
              </span>
            </div>

            {/* Assessment Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-card dark:bg-white/[0.04] border border-border/60">
              {REAL_HERO_ASSESSMENTS.map((item, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(idx)}
                    className={cn(
                      'px-2.5 sm:px-3 py-1 rounded-lg text-2xs sm:text-xs font-mono font-bold transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-emerald-500 text-black shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    {item.company} OA
                  </button>
                );
              })}
            </div>

            {/* Real Assessment Time */}
            <div className="flex items-center gap-2 text-2xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Timer size={14} animateOnHover className="size-3.5" />
              <span>TIMED: {current.durationMinutes} MIN</span>
            </div>
          </div>

          {/* Console Body: Split View (Problem Spec + Verified Invariant Code) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/80 dark:divide-white/10">
            {/* Left Column: Real Problem Spec & Mathematical Invariant */}
            <div className="lg:col-span-5 p-5 sm:p-6 space-y-4 flex flex-col justify-between bg-surface-sunken/20 dark:bg-white/[0.01]">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {current.assessmentTitle}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {current.problemTitle}
                </h3>

                {/* Complexity, Pattern and Difficulty Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-2xs font-mono font-semibold border',
                      current.difficulty === 'Hard'
                        ? 'bg-red-500/10 text-red-500 border-red-500/25'
                        : current.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                    )}
                  >
                    {current.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-2xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Pattern: {current.patternTag}
                  </span>
                  <span className="px-2 py-0.5 rounded text-2xs font-mono font-semibold bg-foreground/[0.04] dark:bg-white/[0.06] text-foreground border border-border/60">
                    Time: {current.timeComplexity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-2xs font-mono font-semibold bg-foreground/[0.04] dark:bg-white/[0.06] text-foreground border border-border/60">
                    Space: {current.spaceComplexity}
                  </span>
                </div>

                {/* Invariant Rule */}
                <div className="p-3.5 rounded-2xl bg-card dark:bg-white/[0.03] border border-border/80 dark:border-white/10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-2xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    <Zap className="size-3.5" />
                    <span>The Invariant Rule</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {current.invariantRule}
                  </p>
                </div>
              </div>

              {/* Real Sample Input & Expected Output */}
              <div className="pt-2 space-y-2">
                <div className="text-2xs font-mono text-muted-foreground uppercase">
                  Verified Sample Testcase:
                </div>
                <div className="p-3 rounded-xl bg-card/60 dark:bg-white/[0.02] border border-border/50 text-2xs font-mono space-y-1">
                  <div>
                    <span className="text-muted-foreground">Input: </span>
                    <span className="text-foreground font-semibold">{current.sampleInput}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected: </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{current.expectedOutput}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Code Template & Sample Verification */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-card dark:bg-[#090D13]">
              {/* Code Header with Real Language Selector */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 dark:border-white/10 bg-surface-sunken/40 dark:bg-white/[0.02] text-2xs font-mono">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Code2 className="size-3.5 text-emerald-500" />
                  <span className="text-foreground font-semibold">solution.{lang === 'cpp' ? 'cpp' : 'py'}</span>
                  <span>({lang === 'cpp' ? 'C++20' : 'Python 3.12'})</span>
                </div>

                <div className="flex items-center p-0.5 rounded-lg bg-surface-sunken dark:bg-white/[0.04] border border-border/60">
                  <button
                    type="button"
                    onClick={() => setLang('cpp')}
                    className={cn(
                      'px-2 py-0.5 rounded text-2xs font-mono font-semibold transition-all cursor-pointer',
                      lang === 'cpp' ? 'bg-emerald-500 text-black font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    C++
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('python')}
                    className={cn(
                      'px-2 py-0.5 rounded text-2xs font-mono font-semibold transition-all cursor-pointer',
                      lang === 'python' ? 'bg-emerald-500 text-black font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Python
                  </button>
                </div>
              </div>

              {/* Code Pre Container */}
              <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-foreground/90 max-h-[300px]">
                <pre className="text-emerald-400/90 whitespace-pre">
                  <code>{current.code[lang]}</code>
                </pre>
              </div>

              {/* Footer: Real Link to Actual Assessment in App */}
              <div className="p-4 border-t border-border/60 dark:border-white/10 bg-surface-sunken/40 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-surface-sunken hover:bg-muted dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-foreground border border-border/80 dark:border-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw size={14} animateOnHover className="size-3" />
                    <span>Verify Sample Output</span>
                  </button>

                  <AnimatePresence>
                    {testVerified && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-1.5 text-2xs font-mono text-emerald-600 dark:text-emerald-400 font-bold"
                      >
                        <BadgeCheck size={16} animate="default" className="size-3.5 text-emerald-500" />
                        <span>Matches Expected Output</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href={`/oa/${current.assessmentSlug}`}
                  className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Launch This OA in Full Screen</span>
                  <ExternalLink size={14} animateOnHover className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
