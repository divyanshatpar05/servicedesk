'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

function getUserRole(email: string | undefined): 'admin' | 'user' | 'technician' {
  if (!email) return 'admin';
  const lower = email.toLowerCase();
  if (lower.startsWith('tech') && lower.includes('@indosales.in')) return 'technician';
  if (lower.startsWith('user') && lower.includes('@indosales.in')) return 'user';
  return 'admin';
}

// Pages that are admin-only (hidden from users)
const adminOnlyPaths = [
  '/',
  '/invoice-template',
  '/spare-inward',
  '/spare-sale-report',
  '/spare-master-report',
  '/spare-stock-detail',
  '/master-setup',
  '/engineer-rate-set',
  '/service-subhead',
  '/user-management',
  '/user-group-manage',
  '/bulk-import',
];

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const role = getUserRole(user?.email);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    // Redirect technicians to their dedicated dashboard
    if (role === 'technician' && pathname !== '/technician-dashboard') {
      router.replace('/technician-dashboard');
      return;
    }

    // Redirect users away from admin-only pages
    if (role === 'user' && adminOnlyPaths.includes(pathname)) {
      router.replace('/service-docket-management');
    }
  }, [user, loading, role, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-[13px]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-6 py-6 xl:px-8 2xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}