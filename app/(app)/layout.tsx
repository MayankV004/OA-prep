'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { 
  LayoutDashboard, 
  Code2, 
  Layers,
  Trophy,
  BookOpen, 
  FileText, 
  HelpCircle,
  Search,
  LogOut,
  Menu,
  X,
  Shield,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV_SECTIONS = [
  {
    label: 'Practice',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Pattern DSA', href: '/dsa', icon: Code2 },
      { name: 'Non-standard', href: '/non-standard', icon: Layers },
      { name: 'Comp. Prog.', href: '/cp', icon: Trophy },
    ],
  },
  {
    label: 'Study',
    items: [
      { name: 'Subjects', href: '/subjects', icon: BookOpen },
      { name: 'Advanced Topics', href: '/advanced', icon: FileText },
      { name: 'Interview Q&A', href: '/interview', icon: HelpCircle },
      { name: 'Cheat Sheets', href: '/cheatsheets', icon: FileText },
    ],
  },
];

function NavLinks({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-4">
      {NAV_SECTIONS.map(section => (
        <div key={section.label}>
          <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} onClick={onNav}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-sm">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/sign-in');
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Code2 className="h-5 w-5 text-primary" />
              <span>PlacementDeck</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto px-3 py-4">
            <NavLinks />
          </div>
          <div className="p-3 border-t space-y-1">
            <Link href="/search">
              <Button variant="ghost" className="w-full justify-start h-8 text-sm group">
                <Search className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">Search</span>
                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start h-8 text-sm">
                  <Shield className="mr-2 h-4 w-4" />Admin Panel
                </Button>
              </Link>
            )}
            <a href="/api/export" download>
              <Button variant="ghost" className="w-full justify-start h-8 text-sm">
                <Download className="mr-2 h-4 w-4" />Export Data
              </Button>
            </a>
            <Button variant="ghost" className="w-full justify-start h-8 text-sm text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />Sign Out
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-background border-r flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold flex items-center gap-2"><Code2 className="h-5 w-5" />PlacementDeck</span>
                <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex flex-col gap-3 p-3 flex-1 overflow-auto">
                <NavLinks onNav={() => setMobileOpen(false)} />
              </nav>
              <div className="p-2 border-t flex flex-col gap-1">
                <a href="/api/export" download>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    <Download className="mr-2 h-4 w-4" />Export Data
                  </Button>
                </a>
                <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="w-full flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
