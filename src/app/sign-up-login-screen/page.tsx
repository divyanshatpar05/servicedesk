'use client';
import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import WorkflowDiagram from './components/WorkflowDiagram';
import { Wrench, Shield, Zap, BarChart3 } from 'lucide-react';

const features = [
  { id: 'feat-docket', icon: <Wrench size={14} />, label: 'End-to-end job card management' },
  { id: 'feat-warranty', icon: <Shield size={14} />, label: 'Warranty & AMC tracking' },
  { id: 'feat-ai', icon: <Zap size={14} />, label: 'AI-powered diagnostics & insights' },
  { id: 'feat-reports', icon: <BarChart3 size={14} />, label: 'Reports & performance analytics' },
];

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel — Brand + Workflow */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 bg-primary flex-col relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -right-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute bottom-20 -left-10 w-40 h-40 rounded-full bg-white/5" />
        </div>

        {/* Logo + Brand */}
        <div className="relative z-10 px-8 pt-8 pb-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <AppLogo size={28} />
            </div>
            <span className="text-white font-bold text-[18px] tracking-tight">Indo Sales and Service Desk</span>
          </div>
          <h1 className="text-white text-[22px] font-bold leading-snug mb-2">
            Complete Service Management for Your Repair Center
          </h1>
          <p className="text-white/70 text-[13px] leading-relaxed">
            From complaint registration to invoice — manage every step of your service workflow in one place.
          </p>

          {/* Feature pills */}
          <div className="mt-5 space-y-2">
            {features?.map(f => (
              <div key={f?.id} className="flex items-center gap-2.5 text-white/85 text-[12px] font-medium">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center flex-shrink-0">
                  {f?.icon}
                </div>
                {f?.label}
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="flex-1 relative z-10 overflow-hidden">
          <div className="px-6 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Service Workflow</p>
          </div>
          <div className="h-full overflow-hidden">
            <WorkflowDiagram />
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 px-8 py-5 border-t border-white/10 flex-shrink-0">
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'stat-dockets', val: '12K+', label: 'Dockets/month' },
              { id: 'stat-centers', val: '340+', label: 'Service centers' },
              { id: 'stat-sla', val: '94%', label: 'SLA compliance' },
            ]?.map(stat => (
              <div key={stat?.id} className="text-center">
                <p className="text-white font-bold text-[18px] tabular-nums">{stat?.val}</p>
                <p className="text-white/55 text-[10px] font-medium">{stat?.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto scrollbar-thin">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <AppLogo size={32} />
          <span className="font-bold text-[18px] text-foreground">Indo Sales and Service Desk</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Mode toggle tabs */}
          <div className="flex bg-muted rounded-lg p-1 mb-7">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-[12px] font-semibold transition-all duration-200 ${
                mode === 'login' ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-md text-[12px] font-semibold transition-all duration-200 ${
                mode === 'signup' ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="fade-in" key={mode}>
            {mode === 'login'
              ? <LoginForm onSwitchToSignup={() => setMode('signup')} />
              : <SignupForm onSwitchToLogin={() => setMode('login')} />
            }
          </div>
        </div>

        <p className="mt-8 text-[11px] text-muted-foreground text-center">
          © 2026 Indo Sales and Service Desk. All rights reserved.
        </p>
      </div>
    </div>
  );
}