'use client';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const data = [
  { name: 'Rajan K.', active: 5, capacity: 8 },
  { name: 'Priya S.', active: 7, capacity: 8 },
  { name: 'Arjun M.', active: 3, capacity: 6 },
  { name: 'Deepa V.', active: 8, capacity: 8 },
  { name: 'Sunil P.', active: 2, capacity: 6 },
  { name: 'Kavitha R.', active: 6, capacity: 8 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-card-md px-4 py-3 text-[12px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <div key={`tt-util-${p.name}`} className="flex gap-2 items-center">
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.value} jobs</span>
        </div>
      ))}
    </div>
  );
};

export default function TechnicianUtilizationChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={14}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="active" name="Active Jobs" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-tech-${index}`}
              fill={entry.active >= entry.capacity ? 'var(--danger)' : entry.active >= entry.capacity * 0.75 ? 'var(--warning)' : 'var(--primary)'}
            />
          ))}
        </Bar>
        <Bar dataKey="capacity" name="Capacity" fill="var(--muted)" radius={[4, 4, 0, 0]} opacity={0.4} />
      </BarChart>
    </ResponsiveContainer>
  );
}