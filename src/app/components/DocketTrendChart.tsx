'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';

interface TrendEntry {
  date: string;
  new: number;
  completed: number;
  overdue: number;
}

interface DocketRow {
  docket_status: string;
  created_at: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-card-md px-4 py-3 text-[12px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map(p => (
        <div key={`tt-${p.name}`} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

export default function DocketTrendChart() {
  const [data, setData] = useState<TrendEntry[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const { data: dockets } = await supabase
        .from('service_dockets')
        .select('docket_status, created_at')
        .gte('created_at', since);

      if (!dockets) return;

      // Build last 14 days map
      const dayMap: Record<string, { new: number; completed: number; overdue: number }> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split('T')[0];
        dayMap[key] = { new: 0, completed: 0, overdue: 0 };
      }

      dockets.forEach((d: DocketRow) => {
        const day = String(d.created_at || '').split('T')[0];
        if (!dayMap[day]) return;
        const s = String(d.docket_status || '').toUpperCase();
        dayMap[day].new++;
        if (s === 'COMPLETED') dayMap[day].completed++;
        if (s === 'OVERDUE') dayMap[day].overdue++;
      });

      setData(
        Object.entries(dayMap).map(([dateKey, counts]) => ({
          date: formatDateLabel(dateKey),
          ...counts,
        }))
      );
    } catch {
      // keep previous data
    }
  }, []);

  useEffect(() => {
    fetchData();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime:docket_trend_chart:service_dockets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_dockets' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradOverdue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        <Area type="monotone" dataKey="new" stroke="var(--primary)" strokeWidth={2} fill="url(#gradNew)" name="New" />
        <Area type="monotone" dataKey="completed" stroke="var(--success)" strokeWidth={2} fill="url(#gradCompleted)" name="Completed" />
        <Area type="monotone" dataKey="overdue" stroke="var(--danger)" strokeWidth={2} fill="url(#gradOverdue)" name="Overdue" />
      </AreaChart>
    </ResponsiveContainer>
  );
}