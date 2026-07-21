import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { FileText, AlertTriangle, Receipt, Wrench, TrendingUp, RefreshCw } from 'lucide-react';

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {/* Hero: Open Dockets */}
      <MetricCard
        label="Open Dockets"
        value="72"
        subValue="Across all service areas"
        trend={{ direction: 'up', value: '+8 since yesterday', positive: false }}
        icon={<FileText size={20} className="text-primary" />}
        iconBg="bg-primary/10"
        className="lg:col-span-1"
      />

      {/* Overdue — Alert State */}
      <MetricCard
        label="Overdue Dockets"
        value="11"
        subValue="SLA breached > 48h"
        trend={{ direction: 'up', value: '+3 since yesterday', positive: false }}
        icon={<AlertTriangle size={20} className="text-danger" />}
        iconBg="bg-danger/10"
        accent="danger"
      />

      {/* Pending Invoices */}
      <MetricCard
        label="Pending Invoices"
        value="₹1,24,500"
        subValue="18 invoices awaiting payment"
        trend={{ direction: 'down', value: '-₹12,000 collected today', positive: true }}
        icon={<Receipt size={20} className="text-warning" />}
        iconBg="bg-warning/10"
        accent="warning"
      />

      {/* Today's Visits */}
      <MetricCard
        label="Today's Visits"
        value="23"
        subValue="6 pending, 17 completed"
        trend={{ direction: 'flat', value: 'On track with schedule' }}
        icon={<Wrench size={20} className="text-violet" />}
        iconBg="bg-violet/10"
      />

      {/* First-Visit Resolution */}
      <MetricCard
        label="First-Visit Resolution"
        value="68%"
        subValue="Target: 75%"
        trend={{ direction: 'up', value: '+4% vs last week', positive: true }}
        icon={<TrendingUp size={20} className="text-success" />}
        iconBg="bg-success/10"
        accent="success"
      />

      {/* AMC Renewals */}
      <MetricCard
        label="AMC Renewals Due"
        value="14"
        subValue="Expiring in next 30 days"
        trend={{ direction: 'up', value: '3 expire this week', positive: false }}
        icon={<RefreshCw size={20} className="text-info" />}
        iconBg="bg-info/10"
        accent="warning"
      />
    </div>
  );
}