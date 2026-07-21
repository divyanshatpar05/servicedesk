'use client';
import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronDown, Zap } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className={`relative hidden md:flex items-center transition-all duration-200 ${searchFocused ? 'w-72' : 'w-52'}`}>
        <Search size={14} className="absolute left-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search dockets, customers…"
          className="w-full pl-9 pr-3 py-1.5 bg-input border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="absolute right-2.5 text-[10px] text-muted-foreground bg-muted px-1 rounded hidden xl:block">⌘K</kbd>
      </div>

      {/* AI Button */}
      <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-violet/10 text-violet border border-violet/20 rounded-md text-[12px] font-semibold hover:bg-violet/20 transition-all duration-150 active:scale-95">
        <Zap size={13} />
        AI Insights
      </button>

      {/* New Docket */}
      <Link
        href="/service-docket-management"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[12px] font-semibold hover:bg-primary/90 transition-all duration-150 active:scale-95"
      >
        <Plus size={14} />
        <span className="hidden sm:inline">New Docket</span>
      </Link>

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors">
        <Bell size={16} className="text-muted-foreground" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
      </button>

      {/* User */}
      <button className="flex items-center gap-2 pl-2 hover:bg-secondary rounded-md px-2 py-1 transition-colors">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px]">
          SM
        </div>
        <span className="text-[12px] font-medium text-foreground hidden lg:block">Suresh Mehta</span>
        <ChevronDown size={12} className="text-muted-foreground hidden lg:block" />
      </button>
    </header>
  );
}