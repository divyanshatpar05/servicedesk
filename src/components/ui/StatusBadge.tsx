import React from 'react';

export type DocketStatus =
  | 'New' |'Assigned' |'Visited' |'Diagnosed' |'In-Repair' |'Completed' |'Invoiced' |'Closed' |'Cancelled';

const statusConfig: Record<DocketStatus, { bg: string; text: string; dot: string }> = {
  New: { bg: 'bg-info/10', text: 'text-info', dot: 'bg-info' },
  Assigned: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  Visited: { bg: 'bg-violet/10', text: 'text-violet', dot: 'bg-violet' },
  Diagnosed: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  'In-Repair': { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  Completed: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  Invoiced: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  Closed: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  Cancelled: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
};

interface StatusBadgeProps {
  status: DocketStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = statusConfig[status] || statusConfig['New'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cfg.bg} ${cfg.text} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}