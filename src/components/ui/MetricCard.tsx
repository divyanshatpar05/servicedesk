import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; value: string; positive?: boolean };
  icon: React.ReactNode;
  iconBg: string;
  accent?: 'default' | 'danger' | 'warning' | 'success' | 'violet';
  className?: string;
  children?: React.ReactNode;
}

const accentMap = {
  default: '',
  danger: 'border-l-4 border-l-danger',
  warning: 'border-l-4 border-l-warning',
  success: 'border-l-4 border-l-success',
  violet: 'border-l-4 border-l-violet',
};

export default function MetricCard({
  label, value, subValue, trend, icon, iconBg, accent = 'default', className = '', children
}: MetricCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend?.positive === undefined
    ? 'text-muted-foreground'
    : trend.positive
      ? 'text-success' :'text-danger';

  return (
    <div className={`bg-card rounded-xl shadow-card p-5 card-hover ${accentMap[accent]} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
          <p className="text-hero-metric font-bold text-foreground tabular-nums leading-none">{value}</p>
          {subValue && <p className="text-[11px] text-muted-foreground mt-1">{subValue}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${trendColor}`}>
          <TrendIcon size={12} />
          <span>{trend.value}</span>
        </div>
      )}
      {children}
    </div>
  );
}