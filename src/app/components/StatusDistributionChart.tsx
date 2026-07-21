'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { createClient } from '@/lib/supabase/client';

interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'var(--info)',
  ASSIGNED: 'var(--primary)',
  RUNNING: 'var(--warning)',
  COMPLETED: 'var(--success)',
  OVERDUE: 'var(--danger)',
  PENDING: 'var(--muted-foreground)',
  HOLD: '#ef4444',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-card-md px-3 py-2 text-[12px]">
      <span className="font-semibold">{payload[0].name}: </span>
      <span>{payload[0].value} dockets</span>
    </div>
  );
};

export default function StatusDistributionChart() {
  const [data, setData] = useState<StatusSlice[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: dockets } = await supabase
        .from('service_dockets')
        .select('docket_status');

      if (!dockets) return;

      const counts: Record<string, number> = {};
      dockets.forEach((d: { docket_status: string }) => {
        const s = String(d.docket_status || 'UNKNOWN').toUpperCase();
        counts[s] = (counts[s] || 0) + 1;
      });

      const slices: StatusSlice[] = Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: key.charAt(0) + key.slice(1).toLowerCase(),
          value,
          color: STATUS_COLORS[key] || 'var(--muted-foreground)',
        }));

      setData(slices);
    } catch {
      // keep previous data
    }
  }, []);

  useEffect(() => {
    fetchData();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime:status_dist_chart:service_dockets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_dockets' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-[12px] text-muted-foreground">
        No docket data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-status-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}