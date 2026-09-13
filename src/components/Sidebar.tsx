'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, FileText, Users, Wrench, Package, ClipboardList, BarChart3, Settings, ChevronLeft, ChevronRight, Bell, Shield, Truck, Receipt, RefreshCw, History, ChevronDown, MapPin, PackageOpen, UserCog, FileEdit, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  children?: { id: string; label: string; href: string }[];
  adminOnly?: boolean;
  technicianHidden?: boolean;
  userHidden?: boolean;
}

const navGroups: { group: string; items: NavItem[]; adminOnly?: boolean; technicianHidden?: boolean; userHidden?: boolean }[] = [
  {
    group: 'Operations',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/', adminOnly: false, userHidden: true },
      { id: 'nav-dockets', label: 'Service Dockets', icon: <FileText size={18} />, href: '/service-docket-management', badge: 7 },
      { id: 'nav-notifications', label: 'Notifications', icon: <Bell size={18} />, href: '/notifications' },
      { id: 'nav-technician', label: 'Technician Allotment', icon: <Wrench size={18} />, href: '/technician-allotment' },
      { id: 'nav-visits', label: 'Technician Visits', icon: <Truck size={18} />, href: '#' },
      { id: 'nav-geotag', label: 'Geo Tracking Live', icon: <MapPin size={18} />, href: '/geo-tracking' },
    ],
  },
  {
    group: 'Customers',
    items: [
      { id: 'nav-customers', label: 'Customers', icon: <Users size={18} />, href: '#' },
      { id: 'nav-products', label: 'Customer Products', icon: <Package size={18} />, href: '#' },
      { id: 'nav-warranty', label: 'Warranty', icon: <Shield size={18} />, href: '#' },
      { id: 'nav-amc', label: 'AMC Renewal', icon: <RefreshCw size={18} />, href: '/amc-renewal', badge: 2 },
    ],
  },
  {
    group: 'Finance',
    items: [
      { id: 'nav-invoices', label: 'Invoices & Payments', icon: <Receipt size={18} />, href: '#', badge: 4 },
      { id: 'nav-invoice-template', label: 'Invoice Template', icon: <FileEdit size={18} />, href: '/invoice-template', adminOnly: true },
    ],
  },
  {
    group: 'Spare Parts',
    items: [
      {
        id: 'nav-spares',
        label: 'Spare Parts',
        icon: <PackageOpen size={18} />,
        adminOnly: true,
        children: [
          { id: 'nav-spare-inward', label: 'Spare Inward', href: '/spare-inward' },
          { id: 'nav-spare-sale-report', label: 'Spare Sale Report', href: '/spare-sale-report' },
          { id: 'nav-spare-master-report', label: 'Spare Master Report', href: '/spare-master-report' },
          { id: 'nav-spare-stock-detail', label: 'Spare Stock Detail', href: '/spare-stock-detail' },
        ],
      },
    ],
  },
  {
    group: 'Analytics',
    items: [
      { id: 'nav-history', label: 'Service History', icon: <History size={18} />, href: '#' },
      { id: 'nav-reports', label: 'Reports', icon: <BarChart3 size={18} />, href: '#' },
    ],
  },
  {
    group: 'Data',
    items: [
      { id: 'nav-bulk-import', label: 'Bulk Data Import', icon: <Upload size={18} />, href: '/bulk-import', adminOnly: true },
    ],
  },
  {
    group: 'Setup',
    items: [
      {
        id: 'nav-master',
        label: 'Master Setup',
        icon: <ClipboardList size={18} />,
        href: '/master-setup',
        adminOnly: true,
        children: [
          { id: 'nav-engineers', label: 'Service Engineers', href: '/master-setup' },
          { id: 'nav-servicemodes', label: 'Service Modes', href: '/master-setup' },
          { id: 'nav-paymentmodes', label: 'Payment Modes', href: '/master-setup' },
          { id: 'nav-spareparts', label: 'Spare Parts', href: '/master-setup' },
          { id: 'nav-amctypes', label: 'AMC Types', href: '/master-setup' },
          { id: 'nav-naturedocket', label: 'Nature of Docket', href: '/master-setup' },
          { id: 'nav-salepoints', label: 'Sale Points', href: '/master-setup' },
          { id: 'nav-salesexec', label: 'Sales Executives', href: '/master-setup' },
          { id: 'nav-engineer-rate', label: 'Engineer Rate Set', href: '/engineer-rate-set' },
          { id: 'nav-service-subhead', label: 'Service Subhead', href: '/service-subhead' },
        ],
      },
      {
        id: 'nav-user-admin',
        label: 'User Administration',
        icon: <UserCog size={18} />,
        adminOnly: true,
        children: [
          { id: 'nav-user-group', label: 'User Group Manage', href: '/user-group-manage' },
          { id: 'nav-users', label: 'User Manage', href: '/user-management' },
        ],
      },
      { id: 'nav-settings', label: 'Company Setup', icon: <Settings size={18} />, href: '#', adminOnly: true },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function getUserRole(email: string | undefined): 'admin' | 'user' | 'technician' {
  if (!email) return 'admin';
  const lower = email.toLowerCase();
  if (lower.startsWith('tech') && lower.includes('@indosales.in')) return 'technician';
  if (lower.startsWith('user') && lower.includes('@indosales.in')) return 'user';
  return 'admin';
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['nav-master', 'nav-spares']));
  const { user } = useAuth();
  const role = getUserRole(user?.email);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isActive = (href?: string) => {
    if (!href || href === '#') return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isItemVisible = (item: NavItem): boolean => {
    if (role === 'technician') return false; // technicians use a separate view
    if (role === 'user') {
      if (item.adminOnly) return false;
      if (item.userHidden) return false;
    }
    return true;
  };

  const isGroupVisible = (group: typeof navGroups[0]): boolean => {
    if (role === 'technician') return false;
    const visibleItems = group.items.filter(item => isItemVisible(item));
    return visibleItems.length > 0;
  };

  // Technician view — only show assigned jobs link
  if (role === 'technician') {
    return (
      <aside className={`relative flex flex-col bg-card border-r border-border sidebar-transition h-screen sticky top-0 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className={`flex items-center border-b border-border h-16 px-3 gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <AppLogo size={32} />
          {!collapsed && <span className="font-bold text-[15px] text-foreground tracking-tight">Indo Sales</span>}
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          <div className="mb-4">
            {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1">My Jobs</p>}
            <Link href="/technician-allotment" className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium transition-all duration-150 mb-0.5 ${collapsed ? 'justify-center' : ''} ${isActive('/technician-allotment') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} title={collapsed ? 'My Assigned Jobs' : undefined}>
              <Wrench size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1">My Assigned Jobs</span>}
            </Link>
          </div>
        </nav>
        {!collapsed && (
          <div className="border-t border-border px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">T</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{user?.email?.split('@')[0] || 'Technician'}</p>
                <p className="text-[10px] text-muted-foreground truncate">Service Technician</p>
              </div>
            </div>
          </div>
        )}
        <button onClick={onToggle} className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-card hover:bg-secondary transition-colors z-10" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`relative flex flex-col bg-card border-r border-border sidebar-transition h-screen sticky top-0 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-border h-16 px-3 gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-bold text-[15px] text-foreground tracking-tight">Indo Sales and Service Desk</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navGroups.filter(g => isGroupVisible(g)).map(group => (
          <div key={`group-${group.group}`} className="mb-4">
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1">
                {group.group}
              </p>
            )}
            {group.items.filter(item => isItemVisible(item)).map(item => {
              if (item.children) {
                const expanded = expandedItems.has(item.id);
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => !collapsed && toggleExpand(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium transition-all duration-150 group
                        ${collapsed ? 'justify-center' : 'justify-between'}
                        ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!collapsed && item.label}
                      </span>
                      {!collapsed && (
                        <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {!collapsed && expanded && (
                      <div className="ml-6 mt-0.5 border-l border-border pl-3 space-y-0.5">
                        {item.children.map(child => (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={`block text-[12px] py-1.5 px-2 rounded transition-colors duration-100 ${
                              isActive(child.href) && child.href !== '/master-setup' ? 'text-primary font-semibold bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium transition-all duration-150 mb-0.5
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive(item.href)
                      ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user */}
      {!collapsed && (
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
              {role === 'admin' ? 'A' : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-foreground truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate capitalize">{role}</p>
            </div>
            <Bell size={15} className="text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-card hover:bg-secondary transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}