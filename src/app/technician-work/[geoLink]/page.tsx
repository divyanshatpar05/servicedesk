'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, FileText, Loader2 } from 'lucide-react';

interface WorkStatus {
  phase: 'idle' | 'started' | 'completed';
  startTime?: string;
  startLat?: number;
  startLng?: number;
  endTime?: string;
  endLat?: number;
  endLng?: number;
}

export default function TechnicianWorkPage() {
  const [status, setStatus] = useState<WorkStatus>({ phase: 'idle' });
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
    });
  };

  const handleStartWork = async () => {
    setLoading(true);
    setGeoError('');
    try {
      const pos = await getLocation();
      const now = new Date();
      setStatus({
        phase: 'started',
        startTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        startLat: pos.coords.latitude,
        startLng: pos.coords.longitude,
      });
    } catch {
      setGeoError('Could not get location. Please enable GPS and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndWork = async () => {
    setLoading(true);
    setGeoError('');
    try {
      const pos = await getLocation();
      const now = new Date();
      setStatus(prev => ({
        ...prev,
        phase: 'completed',
        endTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        endLat: pos.coords.latitude,
        endLng: pos.coords.longitude,
      }));
    } catch {
      setGeoError('Could not get location. Please enable GPS and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#4a7fa5] text-white px-6 py-5 text-center">
          <div className="text-2xl font-bold mb-1">🏠 Indo Sales and Service Desk</div>
          <div className="text-sm opacity-90">Technician Work Portal</div>
          <div className="text-lg font-mono mt-2 opacity-80">{currentTime}</div>
        </div>

        {/* Job Info */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="text-[12px] space-y-1">
            <p><span className="font-semibold">Docket No:</span> 100000001</p>
            <p><span className="font-semibold">Customer:</span> Priya Sharma</p>
            <p><span className="font-semibold">Address:</span> 47 D.N.C RD KOL-700035</p>
            <p><span className="font-semibold">Model:</span> VEGA DLX-60</p>
            <p><span className="font-semibold">Service Type:</span> AMC</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Status Indicator */}
          <div className={`rounded-xl p-4 text-center ${
            status.phase === 'idle' ? 'bg-gray-50 border border-gray-200' :
            status.phase === 'started'? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
          }`}>
            {status.phase === 'idle' && (
              <div className="text-gray-500">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-[13px] font-semibold">Work Not Started</p>
              </div>
            )}
            {status.phase === 'started' && (
              <div className="text-yellow-700">
                <Clock size={32} className="mx-auto mb-2 text-yellow-500" />
                <p className="text-[13px] font-semibold">Work In Progress</p>
                <p className="text-[11px] mt-1">Started at {status.startTime}</p>
                {status.startLat && (
                  <p className="text-[10px] text-yellow-600 mt-1 flex items-center justify-center gap-1">
                    <MapPin size={10} /> {status.startLat.toFixed(4)}, {status.startLng?.toFixed(4)}
                  </p>
                )}
              </div>
            )}
            {status.phase === 'completed' && (
              <div className="text-green-700">
                <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                <p className="text-[13px] font-semibold">Work Completed!</p>
                <p className="text-[11px] mt-1">Started: {status.startTime} → Ended: {status.endTime}</p>
                {status.endLat && (
                  <p className="text-[10px] text-green-600 mt-1 flex items-center justify-center gap-1">
                    <MapPin size={10} /> {status.endLat.toFixed(4)}, {status.endLng?.toFixed(4)}
                  </p>
                )}
              </div>
            )}
          </div>

          {geoError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[12px] text-red-600">
              ⚠️ {geoError}
            </div>
          )}

          {/* Action Buttons */}
          {status.phase === 'idle' && (
            <button
              onClick={handleStartWork}
              disabled={loading}
              className="w-full py-3.5 bg-yellow-500 text-white rounded-xl font-bold text-[15px] hover:bg-yellow-600 disabled:opacity-70 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Getting Location…</> : <><Clock size={16} /> START WORK</>}
            </button>
          )}

          {status.phase === 'started' && (
            <button
              onClick={handleEndWork}
              disabled={loading}
              className="w-full py-3.5 bg-green-500 text-white rounded-xl font-bold text-[15px] hover:bg-green-600 disabled:opacity-70 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Getting Location…</> : <><CheckCircle size={16} /> END WORK</>}
            </button>
          )}

          {status.phase === 'completed' && (
            <button
              onClick={() => setShowInvoice(true)}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-[15px] hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FileText size={16} /> VIEW INVOICE
            </button>
          )}

          {/* Timeline */}
          {(status.startTime || status.endTime) && (
            <div className="border border-border rounded-xl p-3 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Work Timeline</p>
              {status.startTime && (
                <div className="flex items-center gap-2 text-[12px]">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span className="text-foreground">Work Started — {status.startTime}</span>
                </div>
              )}
              {status.endTime && (
                <div className="flex items-center gap-2 text-[12px]">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-foreground">Work Completed — {status.endTime}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invoice Preview */}
        {showInvoice && (
          <div className="border-t border-border px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-bold text-foreground">Invoice Summary</p>
              <button onClick={() => setShowInvoice(false)} className="text-[11px] text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="text-[12px] space-y-1.5">
              <div className="flex justify-between"><span>Docket No:</span><span className="font-mono font-semibold">100000001</span></div>
              <div className="flex justify-between"><span>Customer:</span><span className="font-semibold">Priya Sharma</span></div>
              <div className="flex justify-between"><span>Service Type:</span><span>AMC</span></div>
              <div className="flex justify-between"><span>Service Charge:</span><span className="font-semibold">₹0.00</span></div>
              <div className="flex justify-between"><span>Spare Parts:</span><span className="font-semibold">₹0.00</span></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                <span>Net Total:</span><span>₹0.00</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center">For full invoice, contact the service office.</p>
          </div>
        )}
      </div>
    </div>
  );
}
