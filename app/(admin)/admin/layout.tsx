import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Users, Mail, Database, Settings, Activity, FileText } from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Users', href: '/admin', icon: Users },
  { name: 'Invites', href: '/admin/invites', icon: Mail },
  { name: 'Problems', href: '/admin/content/problems', icon: Database },
  { name: 'Topics', href: '/admin/content/topics', icon: FileText },
  { name: 'Cheat Sheets', href: '/admin/content/cheatsheets', icon: FileText },
  { name: 'Questions', href: '/admin/content/questions', icon: FileText },
  { name: 'Taxonomies', href: '/admin/taxonomies', icon: Settings },
  { name: 'Activity', href: '/admin/activity', icon: Activity },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as any;

  if (!session || user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex">
      {/* Admin sidebar */}
      <div className="w-56 border-r bg-muted/30 flex flex-col shrink-0">
        <div className="px-4 py-3.5 border-b">
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to app
          </Link>
          <h2 className="font-semibold mt-1 text-sm">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {ADMIN_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user?.email}</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
