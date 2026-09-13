'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, AlertTriangle, UserX, ClipboardList, CheckCircle2, Clock, X, Settings, BellOff } from 'lucide-react';

type AlertType = 'docket_assigned' | 'sla_breach' | 'technician_offline';
type AlertSeverity = 'info' | 'warning' | 'critical';

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  docketNo?: string;
  technicianName?: string;
}

interface NotificationPreferences {
  docket_assigned: boolean;
  sla_breach: boolean;
  technician_offline: boolean;
  emailNotifications: boolean;
  soundAlerts: boolean;
}

const ALERT_TYPE_META: Record<AlertType, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  docket_assigned: {
    label: 'New Docket Assigned',
    icon: <ClipboardList size={16} />,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  sla_breach: {
    label: 'SLA Breach Warning',
    icon: <AlertTriangle size={16} />,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  technician_offline: {
    label: 'Technician Offline',
    icon: <UserX size={16} />,
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
  },
};

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
  info: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  critical: 'bg-danger/10 text-danger',
};

// Simulated real-time alerts
const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'docket_assigned',
    severity: 'info',
    title: 'New docket assigned to Rajesh Kumar',
    description: 'Docket #DKT-2026-0412 for customer Priya Sharma (AC repair) has been assigned to Rajesh Kumar.',
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
    read: false,
    docketNo: 'DKT-2026-0412',
    technicianName: 'Rajesh Kumar',
  },
  {
    id: 'a2',
    type: 'sla_breach',
    severity: 'warning',
    title: 'SLA breach in 1 hour — Docket #DKT-2026-0398',
    description: 'Docket #DKT-2026-0398 (Washing Machine — Amit Verma) is due in 58 minutes. Assign a technician immediately.',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    read: false,
    docketNo: 'DKT-2026-0398',
  },
  {
    id: 'a3',
    type: 'technician_offline',
    severity: 'critical',
    title: 'Technician Suresh Patel went offline',
    description: 'Suresh Patel has been offline for 45 minutes with 3 active dockets pending. Consider reassigning.',
    timestamp: new Date(Date.now() - 47 * 60 * 1000),
    read: false,
    technicianName: 'Suresh Patel',
  },
  {
    id: 'a4',
    type: 'docket_assigned',
    severity: 'info',
    title: 'New docket assigned to Meena Devi',
    description: 'Docket #DKT-2026-0405 for customer Rohit Singh (Refrigerator repair) has been assigned to Meena Devi.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    docketNo: 'DKT-2026-0405',
    technicianName: 'Meena Devi',
  },
  {
    id: 'a5',
    type: 'sla_breach',
    severity: 'critical',
    title: 'SLA breached — Docket #DKT-2026-0381',
    description: 'Docket #DKT-2026-0381 (Microwave — Sunita Gupta) has exceeded the SLA deadline by 2 hours.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
    docketNo: 'DKT-2026-0381',
  },
  {
    id: 'a6',
    type: 'technician_offline',
    severity: 'warning',
    title: 'Technician Vikram Singh went offline',
    description: 'Vikram Singh has been offline for 20 minutes. 1 active docket is pending.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    technicianName: 'Vikram Singh',
  },
];

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    docket_assigned: true,
    sla_breach: true,
    technician_offline: true,
    emailNotifications: false,
    soundAlerts: true,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [showPrefs, setShowPrefs] = useState(false);
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
  const [now, setNow] = useState(new Date());

  // Tick for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const togglePref = (key: keyof NotificationPreferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleAlerts = alerts.filter(a => {
    if (!prefs[a.type]) return false;
    if (activeTab === 'unread' && a.read) return false;
    if (filterType !== 'all' && a.type !== filterType) return false;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read && prefs[a.type]).length;

  return (
    <AppLayout
      title="Notifications"
      subtitle="Real-time alerts for dockets, SLA breaches, and technician status"
    >
      <div className="flex gap-5 items-start">
        {/* Main alerts panel */}
        <div className="flex-1 min-w-0">
          {/* Header bar */}
          <div className="bg-card rounded-xl shadow-card mb-4">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-primary" />
                  <span className="font-semibold text-[14px] text-foreground">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-1 ml-4">
                  {(['all', 'unread'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                        activeTab === tab ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {tab === 'all' ? 'All' : 'Unread'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
                  >
                    <CheckCircle2 size={13} /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowPrefs(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border rounded-md transition-colors ${
                    showPrefs ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground border-border hover:bg-secondary'
                  }`}
                >
                  <Settings size={13} /> Preferences
                </button>
              </div>
            </div>

            {/* Type filter chips */}
            <div className="flex items-center gap-2 px-5 py-3 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                  filterType === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                All Types
              </button>
              {(Object.keys(ALERT_TYPE_META) as AlertType[]).map(type => {
                const meta = ALERT_TYPE_META[type];
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
                      filterType === type
                        ? `${meta.bg} ${meta.color} ${meta.border}`
                        : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                    }`}
                  >
                    {meta.icon}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert list */}
          <div className="space-y-2">
            {visibleAlerts.length === 0 ? (
              <div className="bg-card rounded-xl shadow-card p-12 flex flex-col items-center justify-center gap-3">
                <BellOff size={32} className="text-muted-foreground" />
                <p className="text-[13px] text-muted-foreground font-medium">No alerts to show</p>
                <p className="text-[12px] text-muted-foreground">
                  {activeTab === 'unread' ? 'All caught up! No unread alerts.' : 'Adjust your filters or preferences to see alerts.'}
                </p>
              </div>
            ) : (
              visibleAlerts.map(alert => {
                const meta = ALERT_TYPE_META[alert.type];
                return (
                  <div
                    key={alert.id}
                    onClick={() => markRead(alert.id)}
                    className={`bg-card rounded-xl shadow-card border transition-all duration-200 cursor-pointer hover:shadow-md ${
                      alert.read ? 'border-border opacity-75' : `border-l-4 ${meta.border.replace('border-', 'border-l-')} border-border`
                    }`}
                  >
                    <div className="flex items-start gap-4 px-5 py-4">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              {!alert.read && (
                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                              <p className={`text-[13px] font-semibold ${alert.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {alert.title}
                              </p>
                            </div>
                            <p className="text-[12px] text-muted-foreground leading-relaxed">{alert.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEVERITY_BADGE[alert.severity]}`}>
                                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                              </span>
                              {alert.docketNo && (
                                <span className="text-[11px] font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
                                  {alert.docketNo}
                                </span>
                              )}
                              {alert.technicianName && (
                                <span className="text-[11px] text-muted-foreground">
                                  👤 {alert.technicianName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
                              <Clock size={11} />
                              {timeAgo(alert.timestamp)}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); dismissAlert(alert.id); }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Dismiss"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Preferences sidebar */}
        {showPrefs && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-card rounded-xl shadow-card border border-border">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Settings size={15} className="text-primary" />
                  <span className="font-semibold text-[13px] text-foreground">Notification Preferences</span>
                </div>
                <button onClick={() => setShowPrefs(false)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground">
                  <X size={13} />
                </button>
              </div>

              <div className="px-4 py-4 space-y-5">
                {/* Alert type toggles */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Alert Types</p>
                  <div className="space-y-3">
                    {(Object.keys(ALERT_TYPE_META) as AlertType[]).map(type => {
                      const meta = ALERT_TYPE_META[type];
                      return (
                        <div key={type} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.bg} ${meta.color}`}>
                              {meta.icon}
                            </div>
                            <span className="text-[12px] font-medium text-foreground">{meta.label}</span>
                          </div>
                          <button
                            onClick={() => togglePref(type)}
                            className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                              prefs[type] ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}
                            style={{ height: '22px', width: '40px' }}
                            aria-label={`Toggle ${meta.label}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                prefs[type] ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Delivery Options</p>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive alerts via email' },
                      { key: 'soundAlerts' as const, label: 'Sound Alerts', desc: 'Play sound for new alerts' },
                    ].map(opt => (
                      <div key={opt.key} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-medium text-foreground">{opt.label}</p>
                          <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                        </div>
                        <button
                          onClick={() => togglePref(opt.key)}
                          className={`relative flex-shrink-0 rounded-full transition-colors duration-200 ${
                            prefs[opt.key] ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                          style={{ height: '22px', width: '40px' }}
                          aria-label={`Toggle ${opt.label}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                              prefs[opt.key] ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/40 rounded-lg px-3 py-3 border border-border">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">
                      {Object.values({ docket_assigned: prefs.docket_assigned, sla_breach: prefs.sla_breach, technician_offline: prefs.technician_offline }).filter(Boolean).length}
                    </span> of 3 alert types enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
