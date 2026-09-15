import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  const content = `# BigO

> BigO is a zero-distraction technical assessment and interview preparation platform for software engineering candidates. It replaces random LeetCode grinding with a structured pattern-based curriculum (14 algorithmic patterns across 90+ variations), authentic timed company Online Assessment (OA) simulators, interactive CS core modules (OS, DBMS, CN, System Design), spaced-repetition flashcards, and competitive programming tracking.

## Core Modules & Canonical Roadmaps

- [DSA Patterns Catalog](${siteUrl}/dsa): Master 14 fundamental algorithmic patterns (Sliding Window, Two Pointers, Monotonic Stack, Fast & Slow Pointers, Merge Intervals, Top K Elements, Dynamic Programming, Graphs) with universal implementation templates and problem variations.
- [Company Online Assessment (OA) Simulators](${siteUrl}/oa): Realistic 45 to 70-minute timed mock tests emulating authentic technical assessments from top technology companies (Google, Amazon, Uber, Microsoft) with comprehensive test cases and edge-case suites.
- [Computer Science Core Subjects](${siteUrl}/subjects): High-yield revision curricula, notes, and technical round interview questions covering Operating Systems, Database Management Systems (DBMS), Computer Networks (CN), and Object-Oriented Programming (OOP).
- [Technical Interview Flashcards](${siteUrl}/interview): Spaced-repetition question-and-answer decks designed for rapid concept recall prior to Round 2 & Round 3 technical interviews.
- [Engineering Cheatsheets](${siteUrl}/cheatsheets): Quick-reference syntax and idiomatic usage cheat sheets for Python, Java, C++, TypeScript, Git, Docker, and System Design.
- [Competitive Programming Radar](${siteUrl}/cp/contests): Live multi-platform contest schedule, countdowns, and rating synchronization across Codeforces, LeetCode, CodeChef, and AtCoder.
- [Non-Standard Algorithmic Problems](${siteUrl}/non-standard): Curated ad-hoc, constructive, geometric, and math-insight problems requiring specific algorithmic invariants rather than standard templates.
- [Advanced Engineering Specializations](${siteUrl}/advanced): Specialized curricula in DevOps, Cloud Architecture, Distributed Systems, and Application Security.
- [Pro Membership & Pricing](${siteUrl}/pricing): Detailed feature comparison and subscription options for full-length timed OA simulations and AI testcase debugging.

## Key Algorithmic Decision Heuristics

1. **Sliding Window:** Use when processing contiguous sub-arrays or sub-strings where window bounds expand or shrink based on a monotonic condition (e.g. at most K distinct elements, maximum sum of length K).
2. **Two Pointers:** Use on sorted arrays or palindromic strings where two indices converge or diverge based on target comparisons (O(N) time, O(1) auxiliary space).
3. **Monotonic Stack:** Use when searching for the Next Greater Element, Previous Greater Element, or finding maximum histogram rectangles in linear O(N) time.
4. **Fast & Slow Pointers (Floyd's Cycle):** Use for detecting cycles in linked lists or state sequences, and finding midpoints in single passes.
5. **Merge Intervals:** Use whenever dealing with overlapping time intervals, calendar scheduling, or range coalescing.
6. **Top 'K' Elements:** Use a Min-Heap (size K) for finding K largest elements or Max-Heap for K smallest elements in O(N log K) time.

## Supplementary Machine-Readable Feeds

- [Full LLM Knowledge Digest](${siteUrl}/llms-full.txt): Comprehensive deep-dive document containing complete pattern blueprints, time/space complexities, topic outlines, and assessment specifications for AI model context ingestion.
- [XML Sitemap](${siteUrl}/sitemap.xml): Complete URL index of all public educational pages.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
