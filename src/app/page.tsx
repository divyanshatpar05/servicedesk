'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardMetrics from './components/DashboardMetrics';
import ActivityFeed from './components/ActivityFeed';
import AIInsightsPanel from './components/AIInsightsPanel';
import dynamic from 'next/dynamic';
import { Zap, Activity, Clock, CalendarCheck, Briefcase, RefreshCw } from 'lucide-react';

const DocketTrendChart = dynamic(() => import('./components/DocketTrendChart'), { ssr: false });
const TechnicianUtilizationChart = dynamic(() => import('./components/TechnicianUtilizationChart'), { ssr: false });
const StatusDistributionChart = dynamic(() => import('./components/StatusDistributionChart'), { ssr: false });
const JobStatusChart = dynamic(() => import('./components/JobStatusChart'), { ssr: false });
const AMCGraphs = dynamic(() => import('./components/AMCGraphs'), { ssr: false });

export default function DashboardPage() {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Last updated: 10 Jul 2026, 4:27 PM · Auto-refreshes every 5 minutes"
    >
      {/* KPI Bento Grid */}
      <section className="mb-6">
        <DashboardMetrics />
      </section>

      {/* Job Status + AMC Graphs Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Job Status Graph */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                <Briefcase size={15} className="text-primary" />
                Jobs by Status
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Completed · In Progress · Open · Hold</p>
            </div>
          </div>
          <JobStatusChart />
        </div>

        {/* AMC Graphs */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                <RefreshCw size={15} className="text-violet" />
                AMC Overview
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Renewals · Upcoming · Completed · Expired</p>
            </div>
          </div>
          <AMCGraphs />
        </div>
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mb-6">
        {/* Docket Trend — spans 2 cols */}
        <div className="bg-card rounded-xl shadow-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
                <Activity size={15} className="text-primary" />
                Docket Volume — Last 14 Days
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">New vs Completed vs Overdue</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">
              <Clock size={10} />
              14d
            </div>
          </div>
          <DocketTrendChart />
        </div>

        {/* Status Distribution */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-1">Dockets by Status</h2>
          <p className="text-[11px] text-muted-foreground mb-3">Current open docket breakdown</p>
          <StatusDistributionChart />
        </div>
      </section>

      {/* Technician + Activity + AI */}
      <section className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {/* Technician Utilization */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">Technician Load</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active vs capacity today</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger">1 overloaded</span>
          </div>
          <TechnicianUtilizationChart />
        </div>

        {/* Activity Feed */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
              <CalendarCheck size={15} className="text-primary" />
              Live Activity
            </h2>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" title="Live" />
          </div>
          <ActivityFeed />
        </div>

        {/* AI Insights */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-violet/10 flex items-center justify-center">
              <Zap size={13} className="text-violet" />
            </div>
            <h2 className="text-[14px] font-semibold text-foreground">AI Insights</h2>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet/10 text-violet">4 new</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">Smart diagnostics &amp; service pattern alerts</p>
          <AIInsightsPanel />
        </div>
      </section>
    </AppLayout>
  );
}