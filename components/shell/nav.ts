import {
  Activity,
  BookOpen,
  Calendar,
  Code2,
  FileText,
  FolderTree,
  HelpCircle,
  Layers,
  LayoutDashboard,
  ListChecks,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Tags,
  Timer,
  Trophy,
  User,
  Users,
  Terminal,
  CreditCard,
  Percent,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Exact-match only — for hrefs that are prefixes of their children. */
  exact?: boolean;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

/** Main application navigation. Mirrors the pre-existing route structure. */
export const APP_NAV: NavSection[] = [
  {
    label: 'Practice',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
      { name: 'Pattern DSA', href: '/dsa', icon: Code2 },
      { name: 'OA Simulator', href: '/oa', icon: Timer },
      { name: 'Non-standard', href: '/non-standard', icon: Layers },
      { name: 'Comp. Prog.', href: '/cp', icon: Trophy, exact: true },
      { name: 'Contest Radar', href: '/cp/contests', icon: Calendar },
    ],
  },
  {
    label: 'Study',
    items: [
      { name: 'Subjects', href: '/subjects', icon: BookOpen },
      { name: 'Advanced Topics', href: '/advanced', icon: Terminal },
      { name: 'Interview Q&A', href: '/interview', icon: HelpCircle },
      { name: 'Cheat Sheets', href: '/cheatsheets', icon: FileText },
    ],
  },
  {
    label: 'Account & Plans',
    items: [
      { name: 'Pricing & Pro', href: '/pricing', icon: CreditCard },
      { name: 'Profile & Progress', href: '/profile', icon: User, exact: true },
      { name: 'Contact Us', href: '/contact', icon: HelpCircle },
    ],
  },
];

/** Admin navigation. Same shape, rendered by the same shell. */
export const ADMIN_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
      { name: 'Feedback & Bugs', href: '/admin/feedback', icon: MessageSquare },
    ],
  },
  {
    label: 'Users',
    items: [
      { name: 'All Users', href: '/admin/users', icon: Users },
      { name: 'Invites', href: '/admin/invites', icon: Mail },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Company OAs', href: '/admin/content/assessments', icon: Timer },
      { name: 'Problems', href: '/admin/content/problems', icon: ListChecks },
      { name: 'Topics', href: '/admin/content/topics', icon: FolderTree },
      { name: 'Patterns', href: '/admin/content/patterns', icon: Code2 },
      { name: 'Cheat Sheets', href: '/admin/content/cheatsheets', icon: FileText },
      { name: 'Questions', href: '/admin/content/questions', icon: HelpCircle },
    ],
  },
  {
    label: 'Billing & Growth',
    items: [
      { name: 'Subscriptions', href: '/admin/billing', icon: CreditCard },
      { name: 'Pricing & Plans', href: '/admin/billing/pricing', icon: Tags },
      { name: 'Promo Codes', href: '/admin/billing/promos', icon: Percent },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Taxonomies', href: '/admin/taxonomies', icon: Tags },
      { name: 'Activity Log', href: '/admin/activity', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export const ADMIN_ENTRY: NavItem = {
  name: 'Admin Panel',
  href: '/admin',
  icon: Shield,
};

/** Whether a nav href should read as active for the current pathname. */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const LABEL_OVERRIDES: Record<string, string> = {
  dsa: 'Pattern DSA',
  oa: 'OA Simulator',
  cp: 'Competitive Programming',
  contests: 'Contests Radar',
  'non-standard': 'Non-standard',
  admin: 'Admin',
  qa: 'Q&A',
};

/** Turn a URL segment into readable breadcrumb text. */
export function humanizeSegment(segment: string): string {
  const decoded = decodeURIComponent(segment);
  if (LABEL_OVERRIDES[decoded]) return LABEL_OVERRIDES[decoded];

  return decoded
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export type Crumb = { label: string; href: string; isLast: boolean };

/** Detect Mongo ObjectIds, UUIDs, or numeric identifiers that read badly in breadcrumbs. */
export function isOpaqueId(segment: string): boolean {
  return (
    /^[0-9a-f]{24}$/i.test(segment) ||
    /^\d+$/.test(segment) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
  );
}

/** Action/view segments that already identify the current view when followed by an ID. */
const VIEW_ACTION_SEGMENTS = new Set(['report', 'test', 'review', 'result', 'results']);

/** Build breadcrumbs from a pathname, skipping dynamic-looking id segments that are not standalone routes. */
export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    const isId = isOpaqueId(segment);

    // If this is an opaque ID:
    if (isId) {
      if (!isLast) {
        // Intermediate ID segments (e.g. /dsa/[pattern]/[variationId]/practice)
        // are internal routing parameters and not standalone pages. Skip them.
        continue;
      }

      // If it's the last segment and preceded by an action/view segment (e.g. /oa/[slug]/report/[id]),
      // the previous segment already identifies this view. Update its href to the full path.
      const prevSegment = i > 0 ? segments[i - 1].toLowerCase() : '';
      if (VIEW_ACTION_SEGMENTS.has(prevSegment) && crumbs.length > 0) {
        crumbs[crumbs.length - 1].href = pathname;
        continue;
      }

      // Otherwise, it represents an item detail under a collection (e.g. /admin/users/[id]).
      crumbs.push({
        label: 'Detail',
        href: pathname,
      });
      continue;
    }

    // Normal segment
    const href = `/${segments.slice(0, i + 1).join('/')}`;
    crumbs.push({
      label: humanizeSegment(segment),
      href,
    });
  }

  // Ensure the last crumb points to the full pathname
  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1].href = pathname;
  }

  return crumbs.map((crumb, idx) => ({
    ...crumb,
    isLast: idx === crumbs.length - 1,
  }));
}
