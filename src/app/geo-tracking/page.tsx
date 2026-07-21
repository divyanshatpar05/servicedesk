'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { MapPin, RefreshCw, Users, Clock, Navigation, Crosshair, CheckCircle } from 'lucide-react';

interface TechnicianLocation {
  id: string;
  name: string;
  docketNo: string;
  customerName: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'idle' | 'completed';
  startTime: string;
  lastUpdated: string;
  capturedAt?: string;
  capturedLat?: number;
  capturedLng?: number;
}

interface CaptureRecord {
  techId: string;
  techName: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  docketNo: string;
}

const MOCK_TECHNICIANS: TechnicianLocation[] = [
  { id: 'tech-1', name: 'PRITAM SARKAR', docketNo: '100000001', customerName: 'Priya Sharma', latitude: 22.5726, longitude: 88.3639, status: 'active', startTime: '09:30 AM', lastUpdated: '2 min ago' },
  { id: 'tech-2', name: 'RAJAN K.', docketNo: '100000002', customerName: 'Amit Bose', latitude: 22.5800, longitude: 88.3700, status: 'active', startTime: '10:15 AM', lastUpdated: '5 min ago' },
  { id: 'tech-3', name: 'ARJUN M.', docketNo: '100000003', customerName: 'Sunita Dey', latitude: 22.5650, longitude: 88.3580, status: 'idle', startTime: '—', lastUpdated: '15 min ago' },
  { id: 'tech-4', name: 'DEEPA V.', docketNo: '100000004', customerName: 'Rajesh Kumar', latitude: 22.5900, longitude: 88.3800, status: 'completed', startTime: '08:00 AM', lastUpdated: '1 hr ago' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500',
  idle: 'bg-yellow-400',
  completed: 'bg-blue-500',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  idle: 'Idle',
  completed: 'Completed',
};

export default function GeoTrackingPage() {
  const [technicians, setTechnicians] = useState<TechnicianLocation[]>(MOCK_TECHNICIANS);
  const [selected, setSelected] = useState<TechnicianLocation | null>(null);
  const [lastRefresh, setLastRefresh] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle' | 'completed'>('all');
  const [capturing, setCapturing] = useState<string | null>(null);
  const [captureRecords, setCaptureRecords] = useState<CaptureRecord[]>([]);
  const [captureSuccess, setCaptureSuccess] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setLastRefresh(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  const handleRefresh = () => {
    setTechnicians(prev => prev.map(t => ({
      ...t,
      latitude: t.latitude + (Math.random() - 0.5) * 0.001,
      longitude: t.longitude + (Math.random() - 0.5) * 0.001,
      lastUpdated: 'just now',
    })));
    const now = new Date();
    setLastRefresh(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleCaptureLocation = (tech: TechnicianLocation) => {
    setCapturing(tech.id);
    // Simulate GPS capture with slight randomization to simulate real capture
    setTimeout(() => {
      const capturedLat = tech.latitude + (Math.random() - 0.5) * 0.0005;
      const capturedLng = tech.longitude + (Math.random() - 0.5) * 0.0005;
      const now = new Date();
      const capturedAt = now.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const record: CaptureRecord = {
        techId: tech.id,
        techName: tech.name,
        latitude: capturedLat,
        longitude: capturedLng,
        capturedAt,
        docketNo: tech.docketNo,
      };

      setCaptureRecords(prev => [record, ...prev]);
      setTechnicians(prev => prev.map(t =>
        t.id === tech.id ? { ...t, capturedAt, capturedLat, capturedLng, lastUpdated: 'just now' } : t
      ));
      if (selected?.id === tech.id) {
        setSelected(prev => prev ? { ...prev, capturedAt, capturedLat, capturedLng, lastUpdated: 'just now' } : prev);
      }
      setCapturing(null);
      setCaptureSuccess(tech.id);
      setTimeout(() => setCaptureSuccess(null), 3000);
    }, 1500);
  };

  const filtered = filterStatus === 'all' ? technicians : technicians.filter(t => t.status === filterStatus);
  const activeCount = technicians.filter(t => t.status === 'active').length;

  return (
    <AppLayout title="Geo Tracking Live" subtitle="Real-time technician location tracking">
      <div className="space-y-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-[12px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {activeCount} Active Technicians
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-1.5 border border-border rounded-lg text-[12px] bg-input focus:outline-none"
            >
              <option value="all">All Technicians</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-[11px] text-muted-foreground">Last updated: {lastRefresh}</span>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[12px] font-medium hover:bg-muted/50 transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Map Area */}
          <div className="col-span-8">
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-[13px] font-bold text-foreground">Live Map — Kolkata Region</span>
              </div>
              <div className="relative bg-gradient-to-br from-blue-50 to-green-50" style={{ height: '480px' }}>
                <div className="absolute inset-0 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-gray-400" style={{ top: `${(i + 1) * 12.5}%` }} />
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-gray-400" style={{ left: `${(i + 1) * 12.5}%` }} />
                  ))}
                </div>
                <div className="absolute top-3 left-3 bg-white/80 rounded px-2 py-1 text-[10px] text-gray-500 font-medium">
                  📍 Kolkata, West Bengal
                </div>
                {filtered.map((tech, idx) => {
                  const baseX = 20 + (tech.longitude - 88.35) * 2000;
                  const baseY = 80 - (tech.latitude - 22.56) * 2000;
                  const x = Math.max(5, Math.min(90, baseX + idx * 8));
                  const y = Math.max(10, Math.min(85, baseY + idx * 5));
                  return (
                    <button
                      key={tech.id}
                      onClick={() => setSelected(tech)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg border-2 border-white transition-transform group-hover:scale-110 ${STATUS_COLORS[tech.status]}`}>
                        {tech.name.charAt(0)}
                      </div>
                      {tech.status === 'active' && (
                        <div className={`absolute inset-0 rounded-full ${STATUS_COLORS[tech.status]} opacity-30 animate-ping`}></div>
                      )}
                      {tech.capturedAt && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white" title="Location captured" />
                      )}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white rounded shadow-md px-2 py-1 text-[10px] font-semibold text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {tech.name}
                      </div>
                    </button>
                  );
                })}
                <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-3 py-2 text-[10px] space-y-1">
                  <p className="font-bold text-gray-600 mb-1">Legend</p>
                  {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                      <span className="text-gray-600">{STATUS_LABELS[status]}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-gray-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="text-gray-600">Location Captured</span>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/80 rounded px-2 py-1 text-[9px] text-gray-400">
                  Live GPS updates every 30 seconds
                </div>
              </div>
            </div>
          </div>

          {/* Technician List */}
          <div className="col-span-4 space-y-3">
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Users size={15} className="text-primary" />
                <span className="text-[13px] font-bold text-foreground">Technicians ({filtered.length})</span>
              </div>
              <div className="divide-y divide-border max-h-[460px] overflow-y-auto">
                {filtered.map(tech => (
                  <button
                    key={tech.id}
                    onClick={() => setSelected(selected?.id === tech.id ? null : tech)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors ${selected?.id === tech.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ${STATUS_COLORS[tech.status]}`}>
                        {tech.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-foreground truncate">{tech.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">Docket: {tech.docketNo}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{tech.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ${STATUS_COLORS[tech.status]}`}>
                            {STATUS_LABELS[tech.status]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{tech.lastUpdated}</span>
                          {tech.capturedAt && <span className="text-[9px] text-orange-600 font-semibold">📍 Captured</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Technician Detail */}
            {selected && (
              <div className="bg-card rounded-xl shadow-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation size={14} className="text-primary" />
                  <span className="text-[12px] font-bold text-foreground">Location Detail</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Technician</span>
                    <span className="font-semibold">{selected.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Docket No</span>
                    <span className="font-mono font-bold text-primary">{selected.docketNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-semibold">{selected.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Time</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {selected.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude</span>
                    <span className="font-mono text-[11px]">{selected.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude</span>
                    <span className="font-mono text-[11px]">{selected.longitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update</span>
                    <span>{selected.lastUpdated}</span>
                  </div>

                  {/* Capture Location Button */}
                  <div className="pt-2 border-t border-border">
                    <button
                      onClick={() => handleCaptureLocation(selected)}
                      disabled={capturing === selected.id}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded text-[12px] font-semibold transition-all active:scale-95 ${
                        captureSuccess === selected.id
                          ? 'bg-green-500 text-white' :'bg-orange-500 hover:bg-orange-600 text-white'
                      } disabled:opacity-70`}
                    >
                      {capturing === selected.id ? (
                        <><RefreshCw size={13} className="animate-spin" /> Capturing…</>
                      ) : captureSuccess === selected.id ? (
                        <><CheckCircle size={13} /> Location Captured!</>
                      ) : (
                        <><Crosshair size={13} /> Capture Location</>
                      )}
                    </button>
                    {selected.capturedAt && (
                      <div className="mt-2 p-2 bg-orange-50 rounded text-[10px] text-orange-700 border border-orange-200">
                        <p className="font-semibold">Last Captured:</p>
                        <p>{selected.capturedAt}</p>
                        {selected.capturedLat && <p className="font-mono">{selected.capturedLat.toFixed(6)}, {selected.capturedLng?.toFixed(6)}</p>}
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center mt-2 py-1.5 bg-primary text-primary-foreground rounded text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Capture Log */}
        {captureRecords.length > 0 && (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Crosshair size={15} className="text-orange-500" />
              <span className="text-[13px] font-bold text-foreground">Location Capture Log</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{captureRecords.length} capture(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Technician</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Docket No</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Captured At</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Latitude</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Longitude</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Map Link</th>
                  </tr>
                </thead>
                <tbody>
                  {captureRecords.map((rec, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/20">
                      <td className="px-4 py-2 font-semibold">{rec.techName}</td>
                      <td className="px-4 py-2 font-mono text-primary">{rec.docketNo}</td>
                      <td className="px-4 py-2 text-muted-foreground">{rec.capturedAt}</td>
                      <td className="px-4 py-2 font-mono">{rec.latitude.toFixed(6)}</td>
                      <td className="px-4 py-2 font-mono">{rec.longitude.toFixed(6)}</td>
                      <td className="px-4 py-2">
                        <a
                          href={`https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-[11px] font-semibold"
                        >
                          View Map
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
