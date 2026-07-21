import React from 'react';

type Priority = 'High' | 'Medium' | 'Low';

const config: Record<Priority, { bg: string; text: string }> = {
  High: { bg: 'bg-danger/10', text: 'text-danger' },
  Medium: { bg: 'bg-warning/10', text: 'text-warning' },
  Low: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = config[priority];
  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded ${cfg.bg} ${cfg.text} uppercase tracking-wide`}>
      {priority}
    </span>
  );
}