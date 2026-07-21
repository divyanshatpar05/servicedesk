'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Clock, AlertTriangle, UserCheck, FileText, Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  sub: string;
  time: string;
  bg: string;
  icon: React.ReactNode;
}

interface DocketRow {
  id: string;
  docket_no: string;
  customer_name: string;
  model_name: string;
  docket_status: string;
  created_at: string;
  updated_at?: string;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ${diffMin % 60}min ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function mapDocketToActivity(d: DocketRow): ActivityItem {
  const status = String(d.docket_status || '').toUpperCase();
  const timeStr = getRelativeTime(d.updated_at || d.created_at);
  const sub = `${d.model_name || 'Unknown Model'} · ${d.customer_name || 'Unknown Customer'}`;

  if (status === 'COMPLETED') {
    return {
      id: d.id,
      type: 'completed',
      icon: <CheckCircle size={14} className="text-success" />,
      bg: 'bg-success/10',
      message: `Docket #${d.docket_no} marked Completed`,
      sub,
      time: timeStr,
    };
  }
  if (status === 'RUNNING') {
    return {
      id: d.id,
      type: 'repair',
      icon: <Wrench size={14} className="text-warning" />,
      bg: 'bg-warning/10',
      message: `Repair in progress on #${d.docket_no}`,
      sub,
      time: timeStr,
    };
  }
  if (status === 'ASSIGNED') {
    return {
      id: d.id,
      type: 'assigned',
      icon: <UserCheck size={14} className="text-primary" />,
      bg: 'bg-primary/10',
      message: `Technician assigned to #${d.docket_no}`,
      sub,
      time: timeStr,
    };
  }
  if (status === 'OVERDUE') {
    return {
      id: d.id,
      type: 'overdue',
      icon: <AlertTriangle size={14} className="text-danger" />,
      bg: 'bg-danger/10',
      message: `SLA breached on #${d.docket_no}`,
      sub,
      time: timeStr,
    };
  }
  if (status === 'PENDING' || status === 'NEW') {
    return {
      id: d.id,
      type: 'new',
      icon: <FileText size={14} className="text-info" />,
      bg: 'bg-info/10',
      message: `New docket created #${d.docket_no}`,
      sub,
      time: timeStr,
    };
  }
  return {
    id: d.id,
    type: 'pending',
    icon: <Clock size={14} className="text-muted-foreground" />,
    bg: 'bg-muted',
    message: `Docket #${d.docket_no} — ${d.docket_status}`,
    sub,
    time: timeStr,
  };
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('service_dockets')
        .select('id, docket_no, customer_name, model_name, docket_status, created_at, updated_at')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(10);

      if (data && data.length > 0) {
        setActivities(data.map((d: DocketRow) => mapDocketToActivity(d)));
      } else {
        setActivities([]);
      }
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime:activity_feed:service_dockets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_dockets' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  if (loading) {
    return (
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-2.5 px-1 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock size={28} className="text-muted-foreground mb-2" />
        <p className="text-[12px] text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map(item => (
        <div key={item.id} className="flex items-start gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.bg}`}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground leading-snug">{item.message}</p>
            <p className="text-[11px] text-muted-foreground truncate">{item.sub}</p>
          </div>
          <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5 whitespace-nowrap">{item.time}</span>
        </div>
      ))}
    </div>
  );
}