# DSA content data

Seven LaTeX study guides converted to JSON, one file per topic, all sharing the schema in
`_schema.json`. Nothing here is MDX — these are data files you feed to your own page
components.

```
content/dsa/
  _schema.json            annotated reference for the topic-file shape
  backtracking.json
  trees.json
  dynamic-programming.json
  binary-search.json
  graphs.json
  prefix-sum.json
  intervals.json
  index.json              topic list + per-topic counts
  all-problems.json       397 unique problems, de-duplicated across topics
  _parts/                 source fragments + build scripts (see "Rebuilding")
```

## Topic file shape

```jsonc
{
  "slug": "trees",
  "title": "...",
  "subtitle": "...",
  "author": "...",
  "overview": "markdown",
  "coreConcept": "markdown",
  "identify": { "triggerWords": [], "structureSignals": [] },
  "variationsSummary": [ { "variation", "keyIdea", "complexity" } ],
  "variations": [
    {
      "id": "level-order",          // unique within the topic — use as the anchor/route
      "name": "Standard Level Order (BFS)",
      "coreIdea": "markdown",
      "boxes":     [ /* callouts, see below */ ],
      "templates": [ { "label", "language", "code" } ],
      "problems":  [ /* practice list for this variation */ ],
      "solved":    [ /* fully worked problems */ ]
    }
  ],
  "commonMistakes": [], "interviewTips": [], "cheatsheets": [], "studyPlan": [],
  "masterProblemList": [],
  "notes": []                        // what I corrected during conversion
}
```

Some topics carry a few extra top-level keys where the source had them:
`foundationTemplates`, `foundationTricks`, `javaEssentials`, `priorityLegend`,
`targetAdvice`, `decisionGuide`, `universalTemplate`, `documentCovers`, `closingNote`.
Treat them as optional.

## Rendering notes

**Boxes** are the LaTeX `tcolorbox` callouts, kept typed rather than pre-rendered so you can
map each to your own component:

| `type` | Source box | Suggested UI |
|---|---|---|
| `intuition` | Intuition / Key Insight | blue |
| `observations` | Key Observations | green |
| `tricks` | Tricks & Patterns | orange |
| `keywords` | Keywords to Identify / How to Identify | purple |
| `warning` | Common Mistakes / Edge Cases | red |
| `summary` | Pattern Summary | cyan |
| `note` | dry runs, interview answers, misc | neutral |

A box has **either** `items` (array of markdown strings → render as a list) **or** `body`
(a markdown string → render as a paragraph), plus an optional `title`.

**Code** is raw Java source, no fences. Wrap it yourself:

```tsx
<CodeBlock language={t.language}>{t.code}</CodeBlock>
```

**Prose** is light markdown — `**bold**`, `` `inline code` ``, occasional lists. No LaTeX,
no KaTeX needed. Math was flattened to plain text: `$O(n \log n)$` → `O(n log n)`,
`$2^n$` → `2^n`, `$\leq$` → `<=`.

**Complexity** on a solved problem is `{ time, timeNote, space, spaceNote }` — the notes are
the "why" clause the source put after the dash, and are frequently `null`.

## Problem entries

Every problem — in `variations[].problems`, `variations[].solved`, `masterProblemList`, and
`all-problems.json` — carries a link:

```jsonc
{
  "title": "Binary Tree Right Side View",
  "difficulty": "Medium",
  "platform": "leetcode",      // leetcode | gfg | spoj | codeforces | other
  "platformId": "199",         // LeetCode number where applicable
  "url": "https://leetcode.com/problems/binary-tree-right-side-view/",
  "urlVerified": true,         // false = search fallback / unconfirmed
  "premium": false,            // LeetCode only: subscription required
  "priority": null,            // binary-search only: MUST | GOOD | SKIP
  "note": null
}
```

All 363 LeetCode links were checked against LeetCode's own `/api/problems/all/` catalog —
every slug resolves, and 23 are premium-only (`premium: true`), which is worth surfacing in
the UI so nobody clicks into a paywall. The 32 entries with `urlVerified: false` are
GeeksforGeeks / SPOJ / Codeforces links plus a handful the source pointed at problems that
don't exist; style those differently or hide them.

`all-problems.json` de-duplicates by (platform, id) and records every place a problem shows
up, so you can build a cross-topic problem index:

```jsonc
{ "title": "Binary Tree Maximum Path Sum", "platformId": "124",
  "appearsIn": [ { "topic": "trees", "variation": "Root-to-Leaf Path Problems" },
                 { "topic": "dynamic-programming", "variation": "DP on Trees" } ] }
```

## Corrections made during conversion

Each topic file lists these in its `notes` array. The substantive ones:

- **Kth Ancestor of a Tree Node** was labelled LC 1696 in the Trees doc — that id is Jump
  Game VI. Corrected to **LC 1483**.
- **Number of Music Playlists** was labelled LC 1040 in the DP doc — corrected to **LC 920**.
- **Regular Expression Matching** (LC 10) lost its literal `*` characters in the paste
  (`p.charAt(j-1) == ''`); restored to `'*'`.
- **Minimum Deletions to Make Palindrome** (DP) is titled *Minimum Insertion Steps to Make a
  String Palindrome* on LeetCode; title kept, canonical slug used.
- Three Prefix Sum links in the source pointed at slugs that don't exist. Where a real
  equivalent exists (Longest Subarray Sum = K → LC 325) it's used; otherwise the entry is
  marked `urlVerified: false` with a note.
- Table row separators and curly quotes were mangled throughout the paste; rows were
  reconstructed from cell content and quotes normalised.
- The Minimum Size Subarray Sum snippet in the Binary Search doc contains a half-corrected
  inner search with contradictory comments. It is reproduced verbatim and flagged with a
  `warning` box pointing at the sliding-window solution.

## Rebuilding

Topic files are assembled from fragments so they stay editable in reasonable chunks.

```bash
cd content/dsa/_parts
python3 merge.py trees dynamic-programming        # rebuild specific topics
python3 annotate_premium.py                       # refresh premium flags from LeetCode
python3 build_index.py                            # validate + rebuild index/all-problems
```

`build_index.py` checks required problem fields, flags solved problems missing code, and
scans for leftover LaTeX. It currently reports one hit in `dynamic-programming` — that is the
conversion note quoting the corrupted regex snippet, and is intentional.
