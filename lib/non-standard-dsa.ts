import rawData from '@/data/non-standard-dsa/non-standard-problems.json';

export interface RawNonStandardProblem {
  name: string;
  platform: string;
  description: string;
  why_nonstandard: string;
  source?: string;
}

export interface RawNonStandardCategory {
  category: string;
  note: string;
  problems: RawNonStandardProblem[];
}

export interface NonStandardCategoryInfo {
  category: string;
  slug: string;
  shortName: string;
  note: string;
  iconName: string;
  problemCount: number;
  problems: RawNonStandardProblem[];
}

const CATEGORY_SLUG_MAP: Record<string, { slug: string; shortName: string; iconName: string }> = {
  'Ad-hoc / Simulation / State-Machine (no fixed algorithm)': {
    slug: 'ad-hoc-simulation-state-machine',
    shortName: 'Ad-hoc & Simulation',
    iconName: 'Layers',
  },
  'Geometry & Physical-Simulation Problems': {
    slug: 'geometry-physical-simulation',
    shortName: 'Geometry & Physical Sim',
    iconName: 'Compass',
  },
  'Math-Insight / \'Single Trick Observation\' Problems': {
    slug: 'math-insight-single-trick',
    shortName: 'Math Insight & Tricks',
    iconName: 'Lightbulb',
  },
  'Contest Q3/Q4 Problems Needing Rare Techniques': {
    slug: 'contest-q3-q4-rare-techniques',
    shortName: 'Contest Q3/Q4 Hard',
    iconName: 'Trophy',
  },
  'Puzzle-Style Problems (Quant Firms: Jane Street, Optiver, Akuna, DE Shaw, Citadel)': {
    slug: 'puzzle-style-quant',
    shortName: 'Quant Firm Puzzles',
    iconName: 'Puzzle',
  },
  'Design / Data-Structure Problems With No Standard Blueprint': {
    slug: 'design-ds-no-blueprint',
    shortName: 'Custom DS & Design',
    iconName: 'Boxes',
  },
  'Graph & Union-Find Curveballs': {
    slug: 'graph-union-find-curveballs',
    shortName: 'Graph & Union-Find Curveballs',
    iconName: 'Network',
  },
  'String / Parsing Edge-Case Problems': {
    slug: 'string-parsing-edge-cases',
    shortName: 'String & Parsing Edge Cases',
    iconName: 'Binary',
  },
  'Number Theory & Combinatorics Curveballs': {
    slug: 'number-theory-combinatorics',
    shortName: 'Number Theory & Combinatorics',
    iconName: 'Sigma',
  },
};

export function getNonStandardCategories(): NonStandardCategoryInfo[] {
  const categories = (rawData.categories || []) as RawNonStandardCategory[];
  return categories.map((cat) => {
    const meta = CATEGORY_SLUG_MAP[cat.category] || {
      slug: slugify(cat.category),
      shortName: cat.category.split('/')[0].trim(),
      iconName: 'Layers',
    };
    return {
      category: cat.category,
      slug: meta.slug,
      shortName: meta.shortName,
      note: cat.note,
      iconName: meta.iconName,
      problemCount: cat.problems?.length || 0,
      problems: cat.problems || [],
    };
  });
}

export function getNonStandardCategoryBySlug(slug: string): NonStandardCategoryInfo | undefined {
  const categories = getNonStandardCategories();
  return categories.find((c) => c.slug === slug || slugify(c.category) === slug);
}

export function slugToBucketName(slug: string): string {
  const categories = getNonStandardCategories();
  const found = categories.find((c) => c.slug === slug || slugify(c.category) === slug);
  if (found) return found.category;

  // Fallback map for legacy buckets
  const legacyMap: Record<string, string> = {
    'ad-hoc': 'Ad-hoc / Simulation / State-Machine (no fixed algorithm)',
    constructive: 'Design / Data-Structure Problems With No Standard Blueprint',
    math: 'Math-Insight / \'Single Trick Observation\' Problems',
  };
  return legacyMap[slug] || slug;
}

export function parseProblemDifficulty(platform: string): 'Easy' | 'Medium' | 'Hard' {
  const p = platform.toLowerCase();
  if (p.includes('easy')) return 'Easy';
  if (p.includes('medium')) return 'Medium';
  if (p.includes('hard')) return 'Hard';
  // Default to Hard for non-standard/quant/contest questions if unspecified
  return 'Hard';
}

export function generateProblemUrl(name: string, source?: string, platform?: string): string {
  if (source && source.startsWith('http')) return source;

  if (platform && platform.toLowerCase().includes('leetcode')) {
    const lcSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `https://leetcode.com/problems/${lcSlug}/`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${name} ${platform || ''} problem`)}`;
}

export function formatProblemNotes(problem: RawNonStandardProblem): string {
  const parts: string[] = [];
  if (problem.description) {
    parts.push(`**Description:**\n${problem.description}`);
  }
  if (problem.why_nonstandard) {
    parts.push(`**Why Non-Standard:**\n${problem.why_nonstandard}`);
  }
  if (problem.source) {
    parts.push(`**Source:**\n[${problem.source}](${problem.source})`);
  }
  return parts.join('\n\n');
}


function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

