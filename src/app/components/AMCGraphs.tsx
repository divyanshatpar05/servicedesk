'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const amcStatusData = [
  { name: 'Active', value: 34, color: '#22c55e' },
  { name: 'Upcoming', value: 18, color: '#3b82f6' },
  { name: 'Completed', value: 27, color: '#8b5cf6' },
  { name: 'Expired', value: 8, color: '#ef4444' },
];

const renewalMonthData = [
  { month: 'Feb', renewals: 4 },
  { month: 'Mar', renewals: 7 },
  { month: 'Apr', renewals: 5 },
  { month: 'May', renewals: 9 },
  { month: 'Jun', renewals: 6 },
  { month: 'Jul', renewals: 11 },
];

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
