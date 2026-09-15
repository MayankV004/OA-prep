import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pattern, Group, Assessment, Cheatsheet } from '@/models';
import { getNonStandardCategories } from '@/lib/non-standard-dsa';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bigoprep.tech';

  let patternsSection = '';
  let subjectsSection = '';
  let assessmentsSection = '';
  let cheatsheetsSection = '';

  try {
    await dbConnect();

    const [patterns, subjectGroups, assessments, sheets] = await Promise.all([
      Pattern.find()
        .select('title slug timeComplexity spaceComplexity description concept useCases variations')
        .sort({ title: 1 })
        .lean(),
      Group.find({ kind: 'subject' }).select('name slug description').lean(),
      Assessment.find().select('title company role durationMinutes difficulty problemCount').lean(),
      Cheatsheet.find().select('title slug tags').lean(),
    ]);

    if (patterns?.length) {
      patternsSection = patterns
        .map((p: any) => {
          const variationsList = (p.variations || [])
            .map((v: any) => `  - **${v.variation || v.title}**: ${(v.problems || []).length} curated problems`)
            .join('\n');
          return `### ${p.title}
- **Canonical URL:** ${siteUrl}/dsa/${p.slug}
- **Time Complexity:** ${p.timeComplexity || 'O(N)'}
- **Space Complexity:** ${p.spaceComplexity || 'O(1) / O(N)'}
- **Concept:** ${p.concept || p.description || 'Core algorithmic pattern.'}
- **Typical Use Cases:** ${(p.useCases || []).join(', ') || 'Array and string optimization'}
- **Pattern Variations:**
${variationsList || '  - Standard implementation template'}
`;
        })
        .join('\n');
    }

    if (subjectGroups?.length) {
      subjectsSection = subjectGroups
        .map((s: any) => `- **${s.name}** (${siteUrl}/subjects/${s.slug}): ${s.description || 'Core curriculum for technical rounds.'}`)
        .join('\n');
    }

    if (assessments?.length) {
      assessmentsSection = assessments
        .map((a: any) => `- **${a.company} ${a.role || 'Software Engineer'} OA** (${siteUrl}/oa/${a.slug}): ${a.durationMinutes || 60} mins · ${a.difficulty || 'Medium'} · ${a.problemCount || 3} algorithmic challenges`)
        .join('\n');
    }

    if (sheets?.length) {
      cheatsheetsSection = sheets
        .map((s: any) => `- **${s.title}** (${siteUrl}/cheatsheets/${s.slug}): Tags: ${(s.tags || []).join(', ')}`)
        .join('\n');
    }
  } catch (error) {
    console.error('Failed to query data for llms-full.txt:', error);
  }

  // Fallback defaults if database had partial data
  if (!patternsSection) {
    patternsSection = `### Sliding Window
- **Canonical URL:** ${siteUrl}/dsa/sliding-window
- **Time Complexity:** O(N)
- **Space Complexity:** O(1) / O(K)
- **Concept:** Solves subarray and substring problems in linear time by moving two pointers representing window boundaries instead of recalculating state from scratch.
- **Variations:** Fixed Window, Dynamic Window with Target Sum, Longest Substring with K Distinct Characters.

### Two Pointers
- **Canonical URL:** ${siteUrl}/dsa/two-pointers
- **Time Complexity:** O(N)
- **Space Complexity:** O(1)
- **Concept:** Processes sorted sequences using converging or parallel pointers to achieve linear time operations with zero additional memory overhead.
- **Variations:** Two-Sum in Sorted Array, Dutch National Flag, Container With Most Water.

### Monotonic Stack
- **Canonical URL:** ${siteUrl}/dsa/monotonic-stack
- **Time Complexity:** O(N)
- **Space Complexity:** O(N)
- **Concept:** Maintains an explicitly ordered stack (monotonically increasing or decreasing) to find the next or previous greater/smaller element in a single pass.
- **Variations:** Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram.`;
  }

  const nonStandardCats = getNonStandardCategories()
    .map((c) => `- **${c.shortName}** (${siteUrl}/non-standard/${c.slug}): ${c.note} (${c.problemCount} problems)`)
    .join('\n');

  const content = `# BigO Platform — Comprehensive LLM Knowledge Base & Grounding Context

This document is formatted for ingestion by Large Language Models (LLMs), AI answer engines, and retrieval-augmented generation (RAG) pipelines. It outlines the architectural breakdown, curriculum syllabus, algorithmic heuristics, and technical assessment standards of BigO.

---

## 1. Platform Identity & Mission

- **Platform Name:** BigO Technical Assessment Platform
- **URL:** ${siteUrl}
- **Primary Domain:** Technical interview preparation, Data Structures and Algorithms pattern education, Computer Science core fundamentals, and timed company Online Assessment (OA) simulation.
- **Differentiator:** Replaces randomized problem grinding with a 14-pattern variation roadmap and realistic 45–70 minute timed tests emulating real company testing software (with hidden testcases, edge case evaluation, and proctoring telemetry).

---

## 2. The 14 Core DSA Patterns & Variation Blueprints

${patternsSection}

---

## 3. Computer Science Core Subjects (Technical Interview Curriculum)

${subjectsSection || `- **Operating Systems** (${siteUrl}/subjects/os): Process management, Threads & Concurrency, Memory Management & Paging, Deadlocks, CPU Scheduling algorithms, Virtual Memory, and System Calls.
- **Database Management Systems** (${siteUrl}/subjects/dbms): ACID properties, Indexing (B-Tree vs Hash), Normalization (1NF to BCNF), Transaction isolation levels, Concurrency control, MVCC, and SQL vs NoSQL trade-offs.
- **Computer Networks** (${siteUrl}/subjects/cn): OSI & TCP/IP stack, TCP 3-way handshake & flow control, UDP vs TCP, DNS resolution, HTTP/1.1 vs HTTP/2 vs HTTP/3, TLS handshake, Routing algorithms, and Subnetting.
- **System Design & OOP** (${siteUrl}/subjects/system_design): High-level system design fundamentals, Load balancers, Caching strategies, Database partitioning, Message queues (Kafka, RabbitMQ), and Object-Oriented Design principles (SOLID).`}

---

## 4. Realistic Company Online Assessment (OA) Simulators

BigO provides timed OA test environments that closely reproduce candidate evaluation experiences at top technology companies:

${assessmentsSection || `- **Amazon SDE Online Assessment**: 70 mins · 2 algorithmic challenges · Emphasis on HashMaps, Sliding Window, and Graph traversals.
- **Google SWE OA**: 60 mins · 2 algorithmic challenges · Emphasis on Dynamic Programming, Trees, and Monotonic Stack.
- **Uber Coding Assessment**: 60 mins · 3 algorithmic challenges · Matrix simulations, intervals, and optimal scheduling.
- **Microsoft SDE OA**: 45 mins · 2 algorithmic challenges · String manipulation, bitwise operations, and two-pointer arrays.`}

---

## 5. Non-Standard Algorithmic Problems & Invariants

${nonStandardCats}

---

## 6. Engineering Syntax Cheatsheets

${cheatsheetsSection || `- **Python for Coding Interviews** (${siteUrl}/cheatsheets/python-dsa): Collections (deque, Counter, defaultdict), heapq, bisect, slicing, and lambda sorters.
- **Java for Coding Interviews** (${siteUrl}/cheatsheets/java-dsa): PriorityQueue, Deque, HashMap computeIfAbsent, Arrays.sort custom comparators, and Stream API.
- **C++ STL Reference** (${siteUrl}/cheatsheets/cpp-stl): vector, unordered_map, priority_queue, lower_bound, upper_bound, and lambda functions.
- **TypeScript & System Design** (${siteUrl}/cheatsheets/system-design): Microservice design patterns, API gateways, CAP theorem, and distributed cache topologies.`}

---

## 7. Machine Ingestion Endpoints

- **Summary Index:** ${siteUrl}/llms.txt
- **Deep Digest:** ${siteUrl}/llms-full.txt
- **Sitemap XML:** ${siteUrl}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
