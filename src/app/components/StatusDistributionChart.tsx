'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'New', value: 14, color: 'var(--info)' },
  { name: 'Assigned', value: 18, color: 'var(--primary)' },
  { name: 'In-Repair', value: 11, color: 'var(--warning)' },
  { name: 'Completed', value: 23, color: 'var(--success)' },
  { name: 'Overdue', value: 6, color: 'var(--danger)' },
];

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