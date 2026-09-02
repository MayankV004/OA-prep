# BigO — Monetization Strategy & Feature Specification

> **Document Status:** Draft / Strategic Proposal  
> **Author:** Senior Technical Lead / Engineering  
> **Target Audience:** Engineering, Product, Stakeholders  

---

## 1. Executive Summary & Market Mechanics

Engineering candidates and college students preparing for technical placements operate under extreme time pressure and high emotional stakes. A successful placement changes an engineer's lifetime earnings trajectory ($20k–$150k+ initial salary). 

However, tech candidates will **not** pay for:
- Basic problem lists or progress checkboxes (readily available on LeetCode / NeetCode / Striver for free).
- Static notes that can be found in free documentation or YouTube videos.

Tech candidates **will readily pay** for:
1. **Eliminating test-day surprises** (real-world simulation of company OAs with exact timers, platform interfaces, and hidden testcases).
2. **Instant feedback loops on failing code** (discovering why code passed 11/15 testcases with TLE/WA without spending 3 hours stuck).
3. **Recent, high-probability test questions** (questions asked by target companies in campus/off-campus drives in the last 30–60 days).
4. **Placement readiness guarantees** (custom crash roadmaps based on weakness diagnosis).

This document outlines the **Freemium + OA Season Pass + B2B Campus** monetization architecture for BigO.

---

## 2. Product Tier Structure & Entitlement Matrix

```mermaid
flowchart TD
    subgraph Free ["Free Tier"]
        F1["Core DSA Patterns (12+)"]
        F2["Standard Problem Tracker"]
        F3["Community Notes & Flashcards"]
        F4["CP Contest Radar"]
    end

    subgraph Pro ["BigO Pro ($14/mo or $89/yr)"]
        P1["Full Company Tagged Question Bank"]
        P2["AI Edge-Case Debugger (50 runs/mo)"]
        P3["In-Browser Code Execution Engine"]
        P4["System Design & Advanced Modules"]
        P5["All Company OA Mock Sims"]
    end

    subgraph Pass ["OA Season Pass ($39 One-time / 75 Days)"]
        O1["Targeted for Placement Semester"]
        O2["All Pro Features for 75 Days"]
        O3["Target Company Crash Curricula"]
    end

    subgraph B2B ["BigO Campus (Institutional License)"]
        C1["Bulk Student Seats ($1,500 - $6,000/yr)"]
        C2["Placement Cell (TPO) Admin Dashboard"]
        C3["Batch Readiness Analytics & Heatmaps"]
        C4["Host Custom Campus Mock Assessments"]
    end

    Free --> Pro
    Free --> Pass
    Free --> B2B
```

### Entitlement Comparison Table

| Feature / Capability | Free Tier | BigO Pro (Subscription) | OA Season Pass (One-off) | BigO Campus (B2B) |
|---|:---:|:---:|:---:|:---:|
| **DSA Patterns & Core CS Notes** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Personal Heatmap & Progress** | ✅ Standard | ✅ Advanced Analytics | ✅ Advanced Analytics | ✅ Advanced + TPO Synced |
| **Curated Recent OA Questions (Last 60 Days)** | 🔒 Locked (Preview 2) | ✅ Full Library | ✅ Full Library | ✅ Full Library |
| **Company-Specific Mock OA Simulator** | 🔒 1 Free Demo Test | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited + Custom Tests |
| **AI Edge-Case & Failing Input Generator** | 3 queries / day | 100 queries / mo | 250 queries / pass | Custom Campus Quota |
| **In-Browser Code Execution Sandbox** | 🔒 External Link only | ✅ Unlimited Executions | ✅ Unlimited Executions | ✅ Unlimited Executions |
| **Advanced System Design & DevOps** | 🔒 Summary only | ✅ Full Deep Dives | ✅ Full Deep Dives | ✅ Full Deep Dives |
| **TPO / Cohort Performance Dashboard** | ❌ None | ❌ None | ❌ None | ✅ Institutional Dashboard |

---

## 3. Core Monetization Feature Specifications

### 3.1 Feature: Real-World Timed OA Simulator

The #1 reason candidates fail Online Assessments (HackerRank, CodeSignal, Mercer Mettl, Glider) is **test environment anxiety** and **harsh time constraints**.

#### Key Capabilities:
- **Platform Emulation Modes**: Toggle interface layouts to emulate HackerRank, CodeSignal, and LeetCode contest UIs.
- **Strict Proctoring Emulation**:
  - Fullscreen lock toggle with exit warnings.
  - Tab-switching detection counter (simulates strict corporate OAs).
  - Copy-paste blocking and timed section cut-offs.
- **Company Packs**: Pre-configured tests matching current hiring patterns:
  - *Amazon SDE-1*: 2 Problems (Medium-Hard) + 15 min Leadership Principles questionnaire (90 mins).
  - *Uber / Atlassian*: 3 Problems with high-volume testcases and strict memory limits (75 mins).
  - *Fintech / HFT (Tower, DE Shaw, Optiver)*: 2 Fast Algorithmic + 1 Concurrency/SQL (60 mins).
- **Post-Assessment Performance Diagnostic**:
  - Percentile score vs. other BigO candidates.
  - Time spent per problem breakdown.
  - Space/time complexity estimation and hidden edge cases missed.

---

### 3.2 Feature: "Why Did My Code Fail?" AI Edge-Case Debugger

When students get `11/15 testcases passed` in a test run, standard platforms hide the testcases. Candidates waste hours guessing or looking at editorial spoilers.

#### Workflow:
1. Candidate pastes their failing code and selects the problem.
2. The AI Engine analyzes the AST and algorithmic constraints using a structured LLM prompt.
3. Instead of giving the full solution, it returns:
   - **The exact minimal failing input** (e.g., `nums = [0, 0, -1]`, `k = 0`).
   - **The failure category**: Off-by-one boundary, 32-bit integer overflow, recursion depth limit, or non-optimal $O(N^2)$ inner loop causing TLE.
   - **A Socratic guiding hint** to fix the issue independently.
4. **Token Control**: Metered via Redis token bucket and stored in `AiCreditLog`.

---

### 3.3 Feature: Fresh 30–60 Day Company OA Question Bank

Placement drives run in seasonal waves (July–November for campus placements; Jan–April for off-campus/internships).

#### Architecture:
- A new section under `/oa` or `/company`:
  - Filter by Company, Role (Intern / New Grad / SDE-1), and Date Verified.
  - Problem difficulty distribution and most recurring pattern variations (e.g., "70% of recent Google India OAs tested Graph Dijkstra + Bitmask DP").
  - Premium paywall lock on questions less than 90 days old.

---

### 3.4 Feature: Native In-Browser Code Runner (Judge0 / Piston)

Allowing candidates to compile and execute their code directly inside BigO without switching to external sites dramatically increases session retention and perceived platform value.

#### Architecture:
- Code Editor: `@monaco-editor/react` with Vim/Sublime keybindings and theme synchronization.
- Backend Execution Engine:
  - Self-hosted **Judge0 CE** (or managed API) or **Piston**.
  - Multi-language support: C++20, Java 21, Python 3.12, TypeScript/JavaScript.
  - Resource isolation: Dockerized container execution with 2s CPU timeout and 256MB RAM constraints.

---

### 3.5 Feature: B2B Campus Placement Cell (TPO) Dashboard

Selling institutional licenses to engineering colleges and coding academies provides predictable, lump-sum annual revenue ($1,500 – $6,000 per college per year).

#### Capabilities:
- **Multi-Tenant College Organization Model**: Unique college subdomain or invite portal (e.g., `bigoprep.tech/campus/mit`).
- **Batch Leaderboard & Readiness Score**: TPOs can see which students are placement-ready (80%+ pattern mastery) and which need remedial training.
- **Custom Internal Contests**: TPOs can curate tests from BigO's problem bank and conduct college-wide mock selection rounds with automated scoring.

---

## 4. Technical Architecture & Database Schema Additions

### 4.1 Schema Extensions

#### 1. `Subscription` Collection (`models/subscription.ts`)
```typescript
import { Schema, model, models, Types } from 'mongoose';

export type PlanType = 'free' | 'pro_monthly' | 'pro_annual' | 'oa_pass' | 'campus';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing';

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' }, // Optional B2B link
    plan: {
      type: String,
      enum: ['free', 'pro_monthly', 'pro_annual', 'oa_pass', 'campus'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'expired', 'trialing'],
      default: 'active',
      required: true,
    },
    provider: { type: String, enum: ['stripe', 'razorpay', 'lemonsqueezy', 'manual'], required: true },
    customerId: { type: String, required: true },
    subscriptionId: { type: String }, // Gateway subscription reference ID
    orderId: { type: String },        // For one-time payments (OA Pass)
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    aiCreditsQuota: { type: Number, default: 10 },
    aiCreditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, status: 1 });
export const Subscription = models.Subscription || model('Subscription', subscriptionSchema);
```

#### 2. `MockAssessment` Collection (`models/mockAssessment.ts`)
```typescript
const mockAssessmentSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    company: { type: String, required: true, index: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    durationMinutes: { type: Number, required: true, default: 90 },
    problemIds: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    instructions: { type: String, default: '' },
    isProOnly: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
```

#### 3. `AssessmentSubmission` Collection (`models/assessmentSubmission.ts`)
```typescript
const assessmentSubmissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'MockAssessment', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    tabSwitchCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 100 },
    results: [
      {
        problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
        code: { type: String },
        language: { type: String },
        passedCases: { type: Number },
        totalCases: { type: Number },
        timeTakenSeconds: { type: Number },
      },
    ],
    status: { type: String, enum: ['in_progress', 'completed', 'timed_out', 'abandoned'], default: 'in_progress' },
  },
  { timestamps: true }
);
```

---

### 4.2 Payment Gateway Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js App
    participant API as /api/checkout
    participant Gateway as Stripe / Razorpay
    participant Webhook as /api/webhooks/payment
    participant DB as MongoDB (Subscription)
    participant Redis as Upstash Cache

    User->>Frontend: Selects "BigO Pro" or "OA Season Pass"
    Frontend->>API: POST /api/checkout (plan, currency)
    API->>Gateway: Create Checkout Session / Order
    Gateway-->>API: Return Checkout URL or Order ID
    API-->>Frontend: Redirect / Open Gateway Modal
    User->>Gateway: Complete Payment (Card, UPI, NetBanking)
    Gateway-->>User: Success Receipt
    Gateway->>Webhook: Webhook: checkout.session.completed / payment.captured
    Note over Webhook: Verify HMAC Signature
    Webhook->>DB: Upsert Subscription (status='active', currentPeriodEnd)
    Webhook->>Redis: Invalidate user entitlement cache
    Webhook-->>Gateway: HTTP 200 OK
    User->>Frontend: Redirect to /dashboard?payment=success
```

#### Multi-Gateway Strategy:
- **International Users (USD / EUR / GBP)**: Stripe or Lemon Squeezy (acts as Merchant of Record handling sales tax / VAT compliance).
- **Indian Market (INR)**: Razorpay or Cashfree (critical for UPI, domestic debit cards, and net banking support where global credit card checkout conversion drops by >60%).

---

### 4.3 Entitlement Guard Layer

Create a reusable entitlement verification helper to wrap API routes and Server Actions:

```typescript
// lib/entitlements.ts
import { Subscription } from '@/models/subscription';
import { ApiError } from '@/lib/errors';

export async function checkUserEntitlement(userId: string) {
  const sub = await Subscription.findOne({
    userId,
    status: 'active',
    currentPeriodEnd: { $gt: new Date() },
  }).lean();

  const isPro = Boolean(sub && ['pro_monthly', 'pro_annual', 'oa_pass', 'campus'].includes(sub.plan));
  return { isPro, plan: sub?.plan || 'free', creditsRemaining: (sub?.aiCreditsQuota || 10) - (sub?.aiCreditsUsed || 0) };
}

export async function requirePro(userId: string) {
  const entitlement = await checkUserEntitlement(userId);
  if (!entitlement.isPro) {
    throw new ApiError(403, 'UPGRADE_REQUIRED: This feature is only available on BigO Pro.');
  }
  return entitlement;
}
```

---

## 5. Phase-Wise Implementation Roadmap

```mermaid
gantt
    title Monetization Rollout Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Billing
    Subscription Schema & DB Design       :p1_1, 2026-09-05, 4d
    Stripe & Razorpay Checkout Routes     :p1_2, after p1_1, 5d
    Webhook Listeners & Signature Verify   :p1_3, after p1_2, 4d
    Pricing Page & Paywall Modal UI       :p1_4, after p1_2, 5d
    section Phase 2: OA Simulator
    Mock Assessment Schema & Seeding      :p2_1, after p1_4, 4d
    Timed Proctor Simulation UI           :p2_2, after p2_1, 7d
    Scorecard & Diagnostic Report         :p2_3, after p2_2, 5d
    section Phase 3: AI Engine & Code Runner
    In-Browser Monaco Code Runner         :p3_1, after p2_3, 6d
    AI Failing Testcase Generator         :p3_2, after p3_1, 5d
    Credit Metering & Usage Dashboard     :p3_3, after p3_2, 3d
    section Phase 4: B2B Campus
    Multi-tenant Organization Model       :p4_1, after p3_3, 6d
    TPO Cohort Analytics Dashboard        :p4_2, after p4_1, 7d
```

### Phase 1: Billing Foundation & Entitlement Layer (P0)
- Add `Subscription` collection and indexes.
- Integrate Stripe & Razorpay checkout and webhook handlers with idempotency keys.
- Build clean `/pricing` page with feature matrix and FAQs.
- Implement UI paywall locks (e.g., pro badges, locked question previews).

### Phase 2: Company OA Simulator & Recent Question Bank (P0)
- Build assessment runner engine with countdown timers, fullscreen proctoring, and section transitions.
- Seed 15 top company OA sets (Amazon, Google, Microsoft, Uber, Goldman Sachs, Atlassian).
- Implement post-OA scorecard and percentile calculation against active users.

### Phase 3: In-Browser Code Runner & AI Edge-Case Debugger (P1)
- Embed Monaco code editor with testcase tab runner.
- Connect code execution backend (Judge0 or Dockerized runner API).
- Deploy AI Edge-case counter-example generator route with token-bucket credit deduction.

### Phase 4: B2B Campus & Institutional Licensing (P2)
- Multi-tenant college support with customized onboarding URLs.
- Admin portal for Training & Placement Officers (TPO) to view batch readiness heatmaps.
- Capability for colleges to run campus-wide mock tests on BigO infrastructure.

---

## 6. Unit Economics & Infrastructure Cost Estimation

| Component | Cost Structure | Mitigation Strategy |
|---|---|---|
| **LLM Edge-Case Debugger** | ~$0.003 – $0.01 per query (Claude 3.5 Haiku / GPT-4o-mini) | Strict credit allowance (100/month on Pro). Cache identical code AST submissions in Redis. |
| **Code Execution (Judge0)** | $15–$30/month (Fly.io / AWS ECS container) | Client-side test filtering; rate-limit consecutive runs to 1 per 5 seconds. |
| **Payment Gateway Fees** | 2% + ₹3 (Razorpay UPI/Cards) / 2.9% + $0.30 (Stripe) | Passed as standard cost of doing business. Annual plans reduce per-transaction fee impact. |
| **Gross Margin Target** | **85% – 92%** | High gross margins typical of pure software SaaS platforms. |

---

## 7. Next Steps

To begin Phase 1 execution:
1. Review and freeze the pricing tiers ($14/mo, $39/pass, $89/yr).
2. Create Phase 1 Implementation Plan for Payment Gateway and Entitlements.
