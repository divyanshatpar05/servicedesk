'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Completed', value: 47, color: '#22c55e' },
  { name: 'In Progress', value: 23, color: '#3b82f6' },
  { name: 'Open', value: 18, color: '#f59e0b' },
  { name: 'Hold', value: 9, color: '#ef4444' },
];

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
