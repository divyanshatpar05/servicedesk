'use client';
import React, { useEffect, useState, useCallback } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { FileText, AlertTriangle, Receipt, Wrench, TrendingUp, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  openDockets: number;
  runningDockets: number;
  completedToday: number;
  activeAMC: number;
  amcExpiringSoon: number;
  totalAllotments: number;
  pendingAllotments: number;
  spareTotal: number;
}

export default function DashboardMetrics() {
  const [stats, setStats] = useState<DashboardStats>({
    openDockets: 0,
    runningDockets: 0,
    completedToday: 0,
    activeAMC: 0,
    amcExpiringSoon: 0,
    totalAllotments: 0,
    pendingAllotments: 0,
    spareTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [docketsRes, amcRes, allotmentsRes, spareRes] = await Promise.all([
        supabase.from('service_dockets').select('docket_status, created_at'),
        supabase.from('amc_renewals').select('amc_status, end_date'),
        supabase.from('technician_allotments').select('work_status, total_amount'),
        supabase.from('spare_inward').select('spare_total'),
      ]);

      const dockets = docketsRes.data || [];
      const amcList = amcRes.data || [];
      const allotments = allotmentsRes.data || [];
      const spareInwards = spareRes.data || [];

      const openDockets = dockets.filter((d: Record<string, unknown>) =>
        ['RUNNING', 'PENDING'].includes(String(d.docket_status || ''))
      ).length;

      const completedToday = dockets.filter((d: Record<string, unknown>) => {
        const dDate = d.created_at ? String(d.created_at).split('T')[0] : '';
        return dDate === today && d.docket_status === 'COMPLETED';
      }).length;

      const activeAMC = amcList.filter((a: Record<string, unknown>) => a.amc_status === 'ACTIVE').length;
      const amcExpiringSoon = amcList.filter((a: Record<string, unknown>) => {
        const endDate = a.end_date ? String(a.end_date).split('T')[0] : '';
        return endDate >= today && endDate <= thirtyDaysLater && a.amc_status === 'ACTIVE';
      }).length;

      const pendingAllotments = allotments.filter((a: Record<string, unknown>) =>
        String(a.work_status || '').toUpperCase() === 'PENDING'
      ).length;

      const spareTotal = spareInwards.reduce((sum: number, s: Record<string, unknown>) => sum + Number(s.spare_total || 0), 0);

      setStats({
        openDockets,
        runningDockets: dockets.filter((d: Record<string, unknown>) => d.docket_status === 'RUNNING').length,
        completedToday,
        activeAMC,
        amcExpiringSoon,
        totalAllotments: allotments.length,
        pendingAllotments,
        spareTotal,
      });
    } catch {
      // silently fail — metrics will show 0
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const supabase = createClient();

    const docketsChannel = supabase
      .channel('realtime:dashboard:service_dockets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_dockets' }, () => {
        fetchStats();
      })
      .subscribe();

    const amcChannel = supabase
      .channel('realtime:dashboard:amc_renewals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'amc_renewals' }, () => {
        fetchStats();
      })
      .subscribe();

    const allotmentsChannel = supabase
      .channel('realtime:dashboard:technician_allotments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'technician_allotments' }, () => {
        fetchStats();
      })
      .subscribe();

    const spareChannel = supabase
      .channel('realtime:dashboard:spare_inward')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spare_inward' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(docketsChannel);
      supabase.removeChannel(amcChannel);
      supabase.removeChannel(allotmentsChannel);
      supabase.removeChannel(spareChannel);
    };
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {/* Open Dockets */}
      <MetricCard
        label="Open Dockets"
        value={loading ? '…' : String(stats.openDockets)}
        subValue="Running + Pending dockets"
        trend={{ direction: 'up', value: `${stats.runningDockets} currently running`, positive: false }}
        icon={<FileText size={20} className="text-primary" />}
        iconBg="bg-primary/10"
        className="lg:col-span-1"
      />

      {/* Completed Today */}
      <MetricCard
        label="Completed Today"
        value={loading ? '…' : String(stats.completedToday)}
        subValue="Dockets closed today"
        trend={{ direction: 'flat', value: 'Based on today\'s activity' }}
        icon={<AlertTriangle size={20} className="text-danger" />}
        iconBg="bg-danger/10"
        accent="danger"
      />

      {/* Spare Stock Value */}
      <MetricCard
        label="Spare Stock Value"
        value={loading ? '…' : `₹${stats.spareTotal.toLocaleString('en-IN')}`}
        subValue="Total inward spare value"
        trend={{ direction: 'up', value: 'From all inward records', positive: true }}
        icon={<Receipt size={20} className="text-warning" />}
        iconBg="bg-warning/10"
        accent="warning"
      />

      {/* Pending Allotments */}
      <MetricCard
        label="Pending Allotments"
        value={loading ? '…' : String(stats.pendingAllotments)}
        subValue={`of ${stats.totalAllotments} total allotments`}
        trend={{ direction: 'flat', value: 'Awaiting technician action' }}
        icon={<Wrench size={20} className="text-violet" />}
        iconBg="bg-violet/10"
      />

      {/* Active AMC */}
      <MetricCard
        label="Active AMC Contracts"
        value={loading ? '…' : String(stats.activeAMC)}
        subValue="Currently active contracts"
        trend={{ direction: 'up', value: `${stats.amcExpiringSoon} expiring in 30 days`, positive: false }}
        icon={<TrendingUp size={20} className="text-success" />}
        iconBg="bg-success/10"
        accent="success"
      />

      {/* AMC Renewals Due */}
      <MetricCard
        label="AMC Renewals Due"
        value={loading ? '…' : String(stats.amcExpiringSoon)}
        subValue="Expiring in next 30 days"
        trend={{ direction: 'up', value: 'Needs renewal action', positive: false }}
        icon={<RefreshCw size={20} className="text-info" />}
        iconBg="bg-info/10"
        accent="warning"
      />
    </div>
  );
}