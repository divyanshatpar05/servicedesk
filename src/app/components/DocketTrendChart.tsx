'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const data = [
  { date: 'Jun 27', new: 8, completed: 5, overdue: 1 },
  { date: 'Jun 28', new: 12, completed: 9, overdue: 2 },
  { date: 'Jun 29', new: 6, completed: 8, overdue: 1 },
  { date: 'Jun 30', new: 15, completed: 11, overdue: 3 },
  { date: 'Jul 1', new: 10, completed: 7, overdue: 2 },
  { date: 'Jul 2', new: 4, completed: 6, overdue: 1 },
  { date: 'Jul 3', new: 3, completed: 4, overdue: 0 },
  { date: 'Jul 4', new: 14, completed: 10, overdue: 2 },
  { date: 'Jul 5', new: 18, completed: 13, overdue: 4 },
  { date: 'Jul 6', new: 11, completed: 9, overdue: 3 },
  { date: 'Jul 7', new: 9, completed: 12, overdue: 2 },
  { date: 'Jul 8', new: 16, completed: 14, overdue: 1 },
  { date: 'Jul 9', new: 13, completed: 11, overdue: 2 },
  { date: 'Jul 10', new: 7, completed: 5, overdue: 1 },
];

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

export default function DocketTrendChart() {
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