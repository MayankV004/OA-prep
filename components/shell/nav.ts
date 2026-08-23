import {
  Activity,
  BookOpen,
  Code2,
  FileText,
  FolderTree,
  HelpCircle,
  Layers,
  LayoutDashboard,
  ListChecks,
  Mail,
  Settings,
  Shield,
  Sparkles,
  Tags,
  Trophy,
  User,
  Users,
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
      { name: 'Non-standard', href: '/non-standard', icon: Layers },
      { name: 'Comp. Prog.', href: '/cp', icon: Trophy },
    ],
  },
  {
    label: 'Study',
    items: [
      { name: 'Subjects', href: '/subjects', icon: BookOpen },
      { name: 'Advanced Topics', href: '/advanced', icon: Sparkles },
      { name: 'Interview Q&A', href: '/interview', icon: HelpCircle },
      { name: 'Cheat Sheets', href: '/cheatsheets', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Profile & Progress', href: '/profile', icon: User, exact: true },
    ],
  },
];

/** Admin navigation. Same shape, rendered by the same shell. */
export const ADMIN_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true }],
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
      { name: 'Problems', href: '/admin/content/problems', icon: ListChecks },
      { name: 'Topics', href: '/admin/content/topics', icon: FolderTree },
      { name: 'Patterns', href: '/admin/content/patterns', icon: Code2 },
      { name: 'Cheat Sheets', href: '/admin/content/cheatsheets', icon: FileText },
      { name: 'Questions', href: '/admin/content/questions', icon: HelpCircle },
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
  cp: 'Competitive Programming',
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

/** Build breadcrumbs from a pathname, skipping dynamic-looking id segments. */
export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, i) => {
    const href = `/${segments.slice(0, i + 1).join('/')}`;
    // Mongo ObjectIds and similar opaque ids read badly in a breadcrumb.
    const isOpaqueId = /^[0-9a-f]{24}$/i.test(segment) || /^\d+$/.test(segment);

    return {
      label: isOpaqueId ? 'Detail' : humanizeSegment(segment),
      href,
      isLast: i === segments.length - 1,
    };
  });
}
