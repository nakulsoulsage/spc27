'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Building2,
  BarChart3,
  Bell,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth';

const roleNavItems: Record<string, { label: string; href: string; icon: any }[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Opportunities', href: '/opportunities', icon: Briefcase },
    { label: 'Applications', href: '/applications', icon: FileText },
    { label: 'Profile', href: '/profile', icon: User },
  ],
  TPO: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Opportunities', href: '/admin/opportunities', icon: Briefcase },
    { label: 'Announcements', href: '/admin/announcements', icon: Bell },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ],
  SUPER_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Opportunities', href: '/admin/opportunities', icon: Briefcase },
    { label: 'Announcements', href: '/admin/announcements', icon: Bell },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Institutions', href: '/admin/institutions', icon: Building2 },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const navItems = roleNavItems[user?.role || 'STUDENT'] || [];

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </div>
          <span className="text-lg font-bold">SPC27</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
