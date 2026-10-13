# OA Prep — Design System Specification

> **Focus Route Reference**: `/dsa` (Data Structures & Algorithmic Patterns)  
> **Aesthetic Direction**: Executive Frosted Glassmorphism with Modern LMS Course-Card Architecture  
> **Brand Accent**: Vibrant Emerald (`#059669`) with Solar Amber & Emerald Semantic States

---

## 1. Design Philosophy & Visual Language

The `/dsa` interface is crafted around an **Executive Frosted Glassmorphism** design language. It moves away from flat generic dashboards and candy pastel tones, favoring translucent depth, high typographic hierarchy, and purpose-driven micro-components.

### Core Tenets
1. **Glass-First Elevation**: Surfaces feel like polished frosted crystal panels using backdrop blurs (`backdrop-blur-2xl`), subtle border definitions, and specular top edge highlights.
2. **Purpose-Driven Data (Zero Arbitrary Clutter)**: Every visual element directly represents live student progress (e.g., circular mastery gauges rather than arbitrary decorative icons).
3. **Breathing Room & Generous Radii**: Cards employ generous `rounded-[28px] sm:rounded-3xl` corners, creating a welcoming, modern feel balanced by crisp monospace accents.
4. **Frameless Separation**: Section transitions (such as the Active Session banner) use border-y dividers rather than heavy boxed container cards.

---

## 2. Design Tokens & Color Palette

### 2.1 Surfaces & Glass Tokens
| Token Role | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| **Glass Card Background** | `bg-card/70` (`rgba(255, 255, 255, 0.70)`) | `dark:bg-card/35` (`rgba(17, 24, 39, 0.35)`) | Pattern cards, search bar |
| **Glass Backdrop Blur** | `backdrop-blur-2xl` | `backdrop-blur-2xl` | All floating glass cards |
| **Card Border** | `border-border/80` | `dark:border-white/10` | Default card boundaries |
| **Interactive Border** | `hover:border-foreground/20` | `dark:hover:border-white/20` | Card hover state |
| **Top Specular Sheen** | `via-white/70` | `dark:via-white/15` | Ambient 1px top highlight line |
| **Frameless Strip** | `bg-foreground/[0.02]` | `dark:bg-white/[0.02]` | Active session banner |
| **Divider Lines** | `border-foreground/20` | `dark:border-white/20` | Banner top & bottom separation |

### 2.2 Brand & Semantic State Palette
| State / Role | Background | Text Color | Border | Indicator Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Primary (CTA)** | `bg-primary` (`#059669`) | `text-primary-foreground` (`#ffffff`) | None | Main interactive pill buttons |
| **Primary Hover** | `hover:bg-primary-hover` (`#047857`) | `text-primary-foreground` | None | Active / hovered buttons |
| **Mastered (100%)** | `bg-emerald-500/10` | `text-emerald-600 dark:text-emerald-400` | `border-emerald-500/25` | 100% completed pattern |
| **In Progress (1-99%)** | `bg-amber-500/10` | `text-amber-600 dark:text-amber-400` | `border-amber-500/25` | Partially solved pattern |
| **Roadmap (0%)** | `bg-foreground/[0.04]` | `text-muted-foreground` | `border-border/70 dark:border-white/10` | Unstarted pattern |

---

## 3. Typography Hierarchy

| Element | Classes | Sample Usage |
| :--- | :--- | :--- |
| **Page Title** | `text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]` | "DSA Patterns" |
| **Heading Gradient Accent** | `bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent` | `Patterns`, `Schedule`, `Mock Simulator` |
| **Page Subtitle** | `text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal` | Intro summary text |
| **Card Pattern Title** | `font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors` | "Two Pointers", "Sliding Window" |
| **Card Description** | `text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 font-normal` | 2-line pattern concept snippet |
| **Metadata & Counters** | `text-xs font-medium text-foreground/80` + `font-mono text-xs` | "12 variations", "4 / 12 solved" |
| **Complexity Pills** | `font-mono text-[11px] text-muted-foreground` | `Time: O(N)`, `Space: O(1)` |
| **Pill Buttons** | `text-xs font-semibold tracking-normal` | "Continue", "Practice", "Review" |

---

## 4. Component Patterns

### 4.1 Page Cockpit Header
- **Structure**: Clean, bold typography without decorative pre-title badges or superfluous metric strips.
- **Title**: Giant display heading for impact, with accent words wrapped in the emerald-to-teal gradient.
- **Description**: Compact paragraph constrained to `max-w-2xl`.

```tsx
<div className="space-y-3">
  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-[1.08]">
    Algorithmic{' '}
    <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
      Patterns
    </span>
  </h1>
  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-normal">
    Master algorithmic blueprints by learning recurring templates, variation archetypes, and real OA problem sets.
  </p>
</div>
```

---

### 4.2 Active Session Banner (Frameless Divider Architecture)
- Replaces generic boxed cards with a seamless, full-width section framed solely by top and bottom borders.
- **Top & Bottom Separation**: `border-y border-foreground/20 dark:border-white/20`.
- **Background**: Subtle tint `bg-foreground/[0.02] dark:bg-white/[0.02]`.

```tsx
<div className="w-full py-5 px-1 sm:px-2 border-y border-foreground/20 dark:border-white/20 bg-foreground/[0.02] dark:bg-white/[0.02] transition-colors">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
    <div className="space-y-1">
      <span className="text-2xs font-mono font-semibold tracking-wider text-muted-foreground uppercase">
        Continue from last session
      </span>
      <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
        {session.title}
      </h2>
    </div>

    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
      <span className="text-xs font-mono text-muted-foreground">
        <strong className="text-foreground">{session.completed}</strong> of {session.total} solved
      </span>
      <Link
        href={`/dsa/${session.slug}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover group"
      >
        <span>Resume Pattern</span>
        <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
</div>
```

---

### 4.3 Control Toolbar (Search, Filter Tabs & Category Scroll)
- **Search Capsule**: Frosted container with inline search icon, keyboard shortcut indicator (`/`), and clear button.
- **Segmented Status Tabs**: Compact button strip for `All`, `Unstarted`, `In Progress`, `Mastered`.
- **Horizontal Category Strip**: Overflow scrollable filter chips (`CATEGORY_FILTERS`).

```tsx
{/* Search and Status Toolbar */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md shadow-xs">
  {/* Search input */}
  <div className="relative flex-1">
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
    <input
      type="text"
      placeholder="Search patterns by concept, trigger keyword, or complexity..."
      className="w-full pl-10 pr-10 py-2 rounded-xl bg-background/50 border border-border/50 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-sans"
    />
  </div>

  {/* Status Filter Tabs */}
  <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/40 shrink-0">
    {STATUS_TABS.map((tab) => (
      <button
        key={tab.id}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
          activeTab === tab.id
            ? 'bg-card text-foreground font-semibold shadow-2xs'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

---

### 4.4 The Pattern Card (Anatomy & Layout)
The flagship component on the `/dsa` route combines modern course-card proportions with frosted glassmorphism:

```
┌─────────────────────────────────────────────────────────────┐
│  [Status Pill Badge]           [Circular Mastery Ring %/✓]  │
│                                                             │
│  Pattern Title (Bold Display)                               │
│  2-Line Concept Summary Snippet                             │
│                                                             │
│  [Layers] X variations  •  [Code2] Y/Z solved               │
│  [Time: O(N)]  [Space: O(1)]                                │
├─────────────────────────────────────────────────────────────┤
│  X / Y solved                        [Action Pill Button →] │
└─────────────────────────────────────────────────────────────┘
```

#### Code Specification
```tsx
<div
  className={cn(
    'h-full flex flex-col justify-between p-6 sm:p-7 rounded-[28px] sm:rounded-3xl border transition-all duration-300 relative overflow-hidden',
    // Frosted glass styling
    'bg-card/70 dark:bg-card/35 backdrop-blur-2xl',
    'border-border/80 dark:border-white/10',
    'hover:border-foreground/20 dark:hover:border-white/20',
    'shadow-xs hover:shadow-xl hover:-translate-y-0.5',
    // Top specular sheen line
    'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent'
  )}
>
  <div className="space-y-3.5">
    {/* 1. Header Row */}
    <div className="flex items-start justify-between gap-3">
      {/* Status Badge */}
      <span
        className={cn(
          'px-3.5 py-1 rounded-full text-xs font-semibold border shadow-2xs backdrop-blur-md',
          isMastered
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
            : isInProgress
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
            : 'bg-foreground/[0.04] dark:bg-white/[0.06] text-muted-foreground border-border/70 dark:border-white/10'
        )}
      >
        {isMastered ? 'Mastered' : isInProgress ? 'In Progress' : 'Roadmap'}
      </span>

      {/* Circular Mastery Ring */}
      <CircularMasteryRing pct={pct} isMastered={isMastered} />
    </div>

    {/* 2. Title & Description */}
    <div>
      <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
        {pattern.title}
      </h3>
      {cleanDesc && (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1.5 font-normal">
          {cleanDesc}
        </p>
      )}
    </div>

    {/* 3. Variations & Tasks Meta */}
    <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-foreground/80 pt-1">
      <span className="flex items-center gap-1.5">
        <Layers className="size-3.5 text-muted-foreground" />
        {variationsCount} variations
      </span>
      <span className="text-muted-foreground/40">•</span>
      <span className="flex items-center gap-1.5">
        <Code2 className="size-3.5 text-muted-foreground" />
        <strong className="text-foreground">{stat.completed}</strong>/{stat.total} solved
      </span>
    </div>

    {/* 4. Complexity Tags */}
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {pattern.timeComplexity && (
        <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
          Time: {pattern.timeComplexity}
        </span>
      )}
      {pattern.spaceComplexity && (
        <span className="px-2.5 py-0.5 rounded-lg bg-foreground/[0.03] dark:bg-white/[0.04] border border-border/60 dark:border-white/10 font-mono text-[11px] text-muted-foreground backdrop-blur-xs">
          Space: {pattern.spaceComplexity}
        </span>
      )}
    </div>
  </div>

  {/* 5. Clean Single-Line Footer Action Row */}
  <div className="pt-4 mt-4 border-t border-border/50 dark:border-white/10 flex items-center justify-between gap-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
      <span className="font-bold text-foreground">{stat.completed}</span>
      <span>/</span>
      <span>{stat.total} solved</span>
    </div>

    <div className="px-4 py-2 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0">
      <span>{isMastered ? 'Review' : isInProgress ? 'Continue' : 'Practice'}</span>
      <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
    </div>
  </div>
</div>
```

---

### 4.5 The Circular Mastery Progress Ring
Replaces decorative or arbitrary icons with a functional, high-density progress indicator.

- **Squircle Anchor**: `size-11 sm:size-12 rounded-2xl` with frosted backdrop blur and interactive hover scale.
- **Track**: SVG circle radius `r=13`, circumference `~81.68px`, stroke width `2.75`.
- **Center Readout**:
  - `0% – 99%`: Displays percentage readout in bold monospace font (`text-[10px] font-mono font-bold`).
  - `100% (Mastered)`: Full emerald stroke and a bold checkmark icon (`Check`).

```tsx
function CircularMasteryRing({ pct, isMastered }: { pct: number; isMastered: boolean }) {
  const radius = 13;
  const circumference = 2 * Math.PI * radius; // ~81.68
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={cn(
        'size-11 sm:size-12 rounded-2xl flex items-center justify-center border shadow-2xs backdrop-blur-md transition-all duration-300 group-hover:scale-105 shrink-0 relative',
        'bg-foreground/[0.03] dark:bg-white/[0.06] border-border/70 dark:border-white/10',
        isMastered
          ? 'group-hover:border-emerald-500/40 group-hover:bg-emerald-500/[0.05]'
          : 'group-hover:border-primary/40 group-hover:bg-primary/[0.05]'
      )}
      title={`${pct}% mastered`}
    >
      <svg className="size-8 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        {/* Track */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="stroke-foreground/10 dark:stroke-white/10 fill-none"
          strokeWidth="2.75"
        />
        {/* Progress fill */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          className={cn(
            'fill-none transition-all duration-500 ease-out',
            isMastered ? 'stroke-emerald-500' : 'stroke-primary'
          )}
          strokeWidth="2.75"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Center readout */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isMastered ? (
          <Check className="size-3.5 text-emerald-500 stroke-[3]" />
        ) : (
          <span className="text-[10px] font-mono font-bold text-foreground/90">
            {pct}%
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Responsive Grid & Layout Rules

1. **Card Grid Configuration**:
   - Mobile (`< 640px`): `grid-cols-1`
   - Tablet (`sm: 640px` to `lg: 1024px`): `sm:grid-cols-2`
   - Desktop (`xl: 1280px+`): `xl:grid-cols-3`
   - Gap: `gap-6` (24px) providing comfortable separation between frosted glass surfaces.
2. **Skeleton Synchronization**:
   - Every modification to card geometry or footer elements in `DSAPageClient.tsx` must be mirrored in `loading.tsx` to prevent cumulative layout shift (CLS) during server hydration.

---

## 6. Implementation Checklist for New Cards / Routes

When applying this pattern to other sections (e.g. `/cp`, `/subjects`, `/non-standard`):
- [ ] Use `rounded-[28px] sm:rounded-3xl` for high-level entity cards.
- [ ] Apply `bg-card/70 dark:bg-card/35 backdrop-blur-2xl` for the frosted glass substrate.
- [ ] Add the 1px specular top highlight line (`before:bg-gradient-to-r before:from-transparent before:via-white/70 dark:before:via-white/15 before:to-transparent`).
- [ ] Top row must pair a semantic status pill on the left with a metric/gauge squircle on the right.
- [ ] Avoid duplicate progress bars; use a single-line footer row (`items-center justify-between`) with metrics on the left and an emerald pill button on the right.
- [ ] Preserve dark mode compatibility with `dark:border-white/10` and `dark:hover:border-white/20`.
