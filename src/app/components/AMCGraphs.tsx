'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { createClient } from '@/lib/supabase/client';

interface AMCStatusEntry {
  name: string;
  value: number;
  color: string;
}

interface MonthEntry {
  month: string;
  renewals: number;
}

interface AMCRow {
  amc_status: string;
  end_date: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-card-md px-3 py-2 text-[12px]">
      <span className="font-semibold">{payload[0].name}: </span>
      <span className="font-bold">{payload[0].value}</span>
    </div>
  );
};

export default function AMCGraphs() {
  const [amcStatusData, setAmcStatusData] = useState<AMCStatusEntry[]>([
    { name: 'Active', value: 0, color: '#22c55e' },
    { name: 'Upcoming', value: 0, color: '#3b82f6' },
    { name: 'Completed', value: 0, color: '#8b5cf6' },
    { name: 'Expired', value: 0, color: '#ef4444' },
  ]);
  const [renewalMonthData, setRenewalMonthData] = useState<MonthEntry[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: amcList } = await supabase
        .from('amc_renewals')
        .select('amc_status, end_date');

      if (!amcList) return;

      const counts: Record<string, number> = { ACTIVE: 0, UPCOMING: 0, COMPLETED: 0, EXPIRED: 0 };
      const monthCounts: Record<number, number> = {};

      amcList.forEach((a: AMCRow) => {
        const s = String(a.amc_status || '').toUpperCase();
        if (s in counts) counts[s]++;

        if (a.end_date) {
          const month = new Date(a.end_date).getMonth();
          monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
      });

      setAmcStatusData([
        { name: 'Active', value: counts.ACTIVE, color: '#22c55e' },
        { name: 'Upcoming', value: counts.UPCOMING, color: '#3b82f6' },
        { name: 'Completed', value: counts.COMPLETED, color: '#8b5cf6' },
        { name: 'Expired', value: counts.EXPIRED, color: '#ef4444' },
      ]);

      // Show last 6 months of renewal end dates
      const now = new Date();
      const last6: MonthEntry[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6.push({
          month: MONTH_LABELS[d.getMonth()],
          renewals: monthCounts[d.getMonth()] || 0,
        });
      }
      setRenewalMonthData(last6);
    } catch {
      // keep previous data
    }
  }, []);

  useEffect(() => {
    fetchData();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime:amc_graphs:amc_renewals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'amc_renewals' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return (
    <div className="space-y-4">
      {/* AMC Status Summary */}
      <div className="grid grid-cols-4 gap-2">
        {amcStatusData.map(d => (
          <div key={d.name} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${d.color}15` }}>
            <div className="text-[20px] font-bold" style={{ color: d.color }}>{d.value}</div>
            <div className="text-[10px] font-semibold text-muted-foreground">{d.name}</div>
          </div>
        ))}
      </div>

      {/* AMC Status Pie */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-2">AMC Status Distribution</p>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={amcStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
              {amcStatusData.map((entry, index) => (
                <Cell key={`cell-amc-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Renewals Bar */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-2">Monthly AMC Renewals</p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={renewalMonthData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
            <Bar dataKey="renewals" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Renewals" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
