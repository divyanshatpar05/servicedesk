'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';

const insights = [
  {
    id: 'ai-001',
    type: 'pattern',
    icon: <AlertTriangle size={14} className="text-danger" />,
    bg: 'bg-danger/10',
    title: 'Recurring fault pattern detected',
    detail: 'Samsung front-load washing machines (WW65R22EKSS) have 6 repeat complaints for E3 error in the last 30 days. Likely PCB issue — suggest stocking PCB-SAM-WW65 spare part.',
    tag: 'Diagnostic Pattern',
    tagColor: 'bg-danger/10 text-danger',
  },
  {
    id: 'ai-002',
    type: 'overdue',
    icon: <TrendingUp size={14} className="text-warning" />,
    bg: 'bg-warning/10',
    title: 'Technician overload risk',
    detail: 'Deepa V. has 8/8 jobs assigned (100% capacity). 3 new dockets in Andheri area are unassigned. Recommend redistributing to Priya S. who has 1 open slot.',
    tag: 'Workload Alert',
    tagColor: 'bg-warning/10 text-warning',
  },
  {
    id: 'ai-003',
    type: 'insight',
    icon: <Lightbulb size={14} className="text-violet" />,
    bg: 'bg-violet/10',
    title: 'Service area efficiency insight',
    detail: 'Powai area dockets have avg resolution time of 4.2 days vs 2.1 days city-wide. Consider assigning a dedicated technician or reviewing travel routing for this zone.',
    tag: 'Area Insight',
    tagColor: 'bg-violet/10 text-violet',
  },
  {
    id: 'ai-004',
    type: 'renewal',
    icon: <RefreshCw size={14} className="text-info" />,
    bg: 'bg-info/10',
    title: 'AMC renewal opportunity',
    detail: '8 high-value customers with AMC expiring in next 14 days have not been contacted. Combined renewal value: ₹38,400. Auto-draft renewal notices?',
    tag: 'Revenue Opportunity',
    tagColor: 'bg-info/10 text-info',
  },
];

export default function AIInsightsPanel() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['ai-001']));

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {insights.map(item => {
        const isOpen = expanded.has(item.id);
        return (
          <div key={item.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-semibold text-foreground">{item.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.tagColor}`}>{item.tag}</span>
                </div>
              </div>
              {isOpen ? <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-3 pt-0 ai-gradient">
                <p className="text-[12px] text-foreground/80 leading-relaxed">{item.detail}</p>
                <button className="mt-2 text-[11px] font-semibold text-violet hover:underline">
                  Take action →
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}