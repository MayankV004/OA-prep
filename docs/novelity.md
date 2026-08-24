## Novelty angles for BigO

### 1. Failure forensics, not just progress %
Every prep tool shows streaks and completion bars. None diagnose *why* you're failing — they just track *that* you failed.
- Cluster wrong submissions by root cause (off-by-one, wrong base case, misread constraints, TLE from wrong complexity)
- Surface a dashboard like "you fail binary search boundary conditions 60% of the time" instead of a generic accuracy %
- Auto-suggest the next 3 problems that specifically drill the failure mode, not just the next problem in the pattern list

### 2. OA environment fidelity
Real OAs have fullscreen lock, tab-switch detection, copy-paste restrictions, and countdown pressure — most prep tools skip this.
- Replicate actual constraints companies use: tab-switch warnings/logging, disabled copy-paste, fullscreen enforcement
- Time-boxed sessions with no pause, matching real proctoring stress
- Crowdsource actual reported OA questions per company/drive cycle instead of generic problem banks

### 3. Reasoning capture, not just code correctness
Interviews grade how you explain your approach, not just whether the code passes.
- Voice or text "explain your approach before coding" step, timestamped and reviewable later
- Flag when your stated approach and your actual code diverge — a real interview red flag
- Build a personal library of your own past explanations to reuse/refine before real interviews

### 4. Drive-date-driven prep plans
Generic roadmaps ignore that placement prep is a countdown against real dates.
- Let users input their actual campus drive schedule and auto-generate a week-by-week plan working backward from each date
- Weight the plan toward the pattern/CS-core mix historically asked by that specific company
- Send a "you're behind pace for the TCS drive on X date" nudge instead of a passive streak counter

### 5. Live competitive mock rooms
Real OA day has social/time pressure from sitting in a hall with classmates. Solo practice never replicates that.
- Timed head-to-head rooms where classmates solve the same OA set simultaneously, scores compared live
- Optional shared session before a real drive so a batch preps together under real pressure
- Post-session leaderboard by accuracy + time, not just completion

### 6. Crowdsourced recent-OA intel
Company OA patterns shift year to year. A dated intel feed beats a static curated bank that goes stale.
- Let users submit "this exact question came up in X company's OA on Y date" after their drive
- Tag and surface these to juniors prepping for the same company's next cycle
- Auto-weight upcoming prep plans toward patterns that showed up most recently for that company

### 7. AI follow-up interrogation after correct answers
Passing test cases isn't the bar in a real interview — handling follow-up questions is.
- After code passes, ask 1-2 follow-ups like "what if input size was 10x larger" or "can you avoid the extra space"
- Score follow-up answers separately from the original solution
- Flag when someone clearly memorized a pattern but can't reason about edge-case variations

### 8. Post-OA session replay & debrief
The OA workspace currently only tells you pass/fail. The real learning is in *how* you got there.
- Auto-generate a per-session report: time spent per question, where you got stuck, how your path diverged from the optimal approach
- Show a replay of your own edit history on a problem, not just the final diff
- Highlight the specific moment you went down a wrong path, so you can recognize that instinct next time

**Highest leverage first:** #1 and #8 use data you're already capturing (submissions, code, pass/fail) — mostly analysis layer, no new infra. #2 and #7 are cheap-ish and close real gaps competitors ignore. #5 and #6 need real user traffic to be worth anything, so they're better once you have users.