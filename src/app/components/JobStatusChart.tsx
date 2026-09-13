'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { createClient } from '@/lib/supabase/client';

interface StatusEntry {
  name: string;
  value: number;
  color: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Completed', color: '#22c55e' },
  RUNNING: { label: 'In Progress', color: '#3b82f6' },
  PENDING: { label: 'Open', color: '#f59e0b' },
  HOLD: { label: 'Hold', color: '#ef4444' },
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-card-md px-3 py-2 text-[12px]">
      <span className="font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].name}: </span>
      <span className="font-bold">{payload[0].value} jobs</span>
    </div>
  );
};

export default function JobStatusChart() {
  const [data, setData] = useState<StatusEntry[]>([
    { name: 'Completed', value: 0, color: '#22c55e' },
    { name: 'In Progress', value: 0, color: '#3b82f6' },
    { name: 'Open', value: 0, color: '#f59e0b' },
    { name: 'Hold', value: 0, color: '#ef4444' },
  ]);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: dockets } = await supabase
        .from('service_dockets')
        .select('docket_status');

      if (!dockets) return;

      const counts: Record<string, number> = { COMPLETED: 0, RUNNING: 0, PENDING: 0, HOLD: 0 };
      dockets.forEach((d: { docket_status: string }) => {
        const s = String(d.docket_status || '').toUpperCase();
        if (s in counts) counts[s]++;
      });

      setData(
        Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
          name: cfg.label,
          value: counts[key] || 0,
          color: cfg.color,
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
      .channel('realtime:job_status_chart:service_dockets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_dockets' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {data.map(d => (
          <div key={d.name} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${d.color}15` }}>
            <div className="text-[22px] font-bold" style={{ color: d.color }}>{d.value}</div>
            <div className="text-[10px] font-semibold text-muted-foreground">{d.name}</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
