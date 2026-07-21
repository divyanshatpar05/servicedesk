import React from 'react';
import { CheckCircle, Clock, AlertTriangle, UserCheck, FileText, Wrench } from 'lucide-react';

const activities = [
  {
    id: 'act-001',
    type: 'completed',
    icon: <CheckCircle size={14} className="text-success" />,
    bg: 'bg-success/10',
    message: 'Docket #SD-2407-0089 marked Completed',
    sub: 'Samsung Washing Machine · Rajan K.',
    time: '4 min ago',
  },
  {
    id: 'act-002',
    type: 'overdue',
    icon: <AlertTriangle size={14} className="text-danger" />,
    bg: 'bg-danger/10',
    message: 'SLA breached on #SD-2407-0074',
    sub: 'LG AC · No technician assigned',
    time: '18 min ago',
  },
  {
    id: 'act-003',
    type: 'assigned',
    icon: <UserCheck size={14} className="text-primary" />,
    bg: 'bg-primary/10',
    message: 'Technician assigned to #SD-2407-0091',
    sub: 'Arjun M. → Bosch Refrigerator · Andheri West',
    time: '32 min ago',
  },
  {
    id: 'act-004',
    type: 'new',
    icon: <FileText size={14} className="text-info" />,
    bg: 'bg-info/10',
    message: 'New docket created #SD-2407-0093',
    sub: 'Whirlpool Microwave · Priya Sharma · Bandra',
    time: '45 min ago',
  },
  {
    id: 'act-005',
    type: 'repair',
    icon: <Wrench size={14} className="text-warning" />,
    bg: 'bg-warning/10',
    message: 'Repair started on #SD-2407-0081',
    sub: 'Voltas Split AC · Sunil P. · Powai',
    time: '1h 12min ago',
  },
  {
    id: 'act-006',
    type: 'pending',
    icon: <Clock size={14} className="text-muted-foreground" />,
    bg: 'bg-muted',
    message: 'Invoice #INV-2407-042 sent to customer',
    sub: 'Rajesh Kumar · ₹2,850 · Pending payment',
    time: '2h ago',
  },
  {
    id: 'act-007',
    type: 'completed',
    icon: <CheckCircle size={14} className="text-success" />,
    bg: 'bg-success/10',
    message: 'Docket #SD-2407-0068 Closed',
    sub: 'Haier TV · Deepa V. · Payment received ₹1,200',
    time: '3h 20min ago',
  },
];

export default function ActivityFeed() {
  return (
    <div className="space-y-1">
      {activities?.map(item => (
        <div key={item?.id} className="flex items-start gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item?.bg}`}>
            {item?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground leading-snug">{item?.message}</p>
            <p className="text-[11px] text-muted-foreground truncate">{item?.sub}</p>
          </div>
          <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5 whitespace-nowrap">{item?.time}</span>
        </div>
      ))}
    </div>
  );
}