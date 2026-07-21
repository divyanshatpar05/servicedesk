'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, User, Package, FileText, Navigation, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import WhatsAppSharePanel from '@/app/service-docket-management/components/WhatsAppSharePanel';

// Mock assigned jobs for technicians — in production this would come from Supabase
const mockTechJobs: Record<string, {
  id: string;
  docketNo: string;
  customerName: string;
  mobileNo: string;
  customerAddress: string;
  model: string;
  natureOfDocket: string;
  status: string;
  totalAmount: number;
  sparePartAmount: number;
  geoLat?: string;
  geoLng?: string;
  spareParts: { name: string; qty: number; rate: number }[];
  amcDetails?: { amcRef: string; startDate: string; endDate: string; amcType: string };
}[]> = {
  'tech01@indosales.in': [
    {
      id: 'al-001', docketNo: '100000001', customerName: 'Priya Sharma', mobileNo: '9820145678',
      customerAddress: '47 D.N.C RD KOL-700035', model: 'VEGA DLX-60', natureOfDocket: 'AMC',
      status: 'Assigned', totalAmount: 1500, sparePartAmount: 0, geoLat: '22.5726', geoLng: '88.3639',
      spareParts: [{ name: 'MOTOR ASSEMBLY', qty: 1, rate: 1200 }],
      amcDetails: { amcRef: 'AMC-2026-001', startDate: '2026-01-01', endDate: '2026-12-31', amcType: '4 Month' },
    },
    {
      id: 'al-009', docketNo: '100000009', customerName: 'Amit Roy', mobileNo: '9876543211',
      customerAddress: '12 Sinthi Road KOL-700035', model: 'HESTIA 90', natureOfDocket: 'Repair',
      status: 'New', totalAmount: 800, sparePartAmount: 300, geoLat: '22.5800', geoLng: '88.3700',
      spareParts: [{ name: 'CAPACITOR 25MFD', qty: 2, rate: 150 }],
    },
  ],
  'tech02@indosales.in': [
    {
      id: 'al-002', docketNo: '100000002', customerName: 'Rajesh Kumar', mobileNo: '9867432109',
      customerAddress: '12 Park Street KOL-700016', model: 'HESTIA 90', natureOfDocket: 'Repair',
      status: 'In-Repair', totalAmount: 500, sparePartAmount: 200, geoLat: '22.5500', geoLng: '88.3500',
      spareParts: [{ name: 'GAS VALVE', qty: 1, rate: 200 }],
    },
  ],
};

// Default jobs for any tech not specifically mapped
const defaultTechJobs = [
  {
    id: 'al-default', docketNo: '100000099', customerName: 'Sample Customer', mobileNo: '9000000000',
    customerAddress: '1 Sample Street KOL-700001', model: 'VEGA DLX-60', natureOfDocket: 'Repair',
    status: 'Assigned', totalAmount: 500, sparePartAmount: 0, geoLat: '22.5726', geoLng: '88.3639',
    spareParts: [],
  },
];

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [whatsappJob, setWhatsappJob] = useState<typeof defaultTechJobs[0] | null>(null);
  const [selectedJob, setSelectedJob] = useState<typeof defaultTechJobs[0] | null>(null);

  const email = user?.email?.toLowerCase() || '';
  const jobs = mockTechJobs[email] || defaultTechJobs;
  const techName = email.split('@')[0] || 'Technician';

  const openMaps = (lat?: string, lng?: string, address?: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2d6a8a] text-white px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[16px]">Indo Sales — Technician Portal</h1>
            <p className="text-white/70 text-[12px] mt-0.5">Welcome, {techName.toUpperCase()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-[14px]">
            {techName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-gray-800">My Assigned Jobs ({jobs.length})</h2>
          <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Today</span>
        </div>

        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Job Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#2d6a8a]/10 to-transparent border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="font-mono text-[12px] font-bold text-[#2d6a8a]">{job.docketNo}</span>
                <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${job.status === 'Completed' ? 'bg-green-100 text-green-700' : job.status === 'In-Repair' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{job.status}</span>
              </div>
              <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{job.natureOfDocket}</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Customer Info */}
              <div className="flex items-start gap-3">
                <User size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[14px] text-gray-800">{job.customerName}</p>
                  <p className="text-[12px] text-gray-500">{job.model}</p>
                </div>
              </div>

              {/* Address + Maps */}
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-gray-700">{job.customerAddress}</p>
                  <button
                    onClick={() => openMaps(job.geoLat, job.geoLng, job.customerAddress)}
                    className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    <Navigation size={11} /> Open in Google Maps
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-green-500 flex-shrink-0" />
                <a href={`tel:${job.mobileNo}`} className="text-[13px] font-mono font-semibold text-gray-800 hover:text-blue-600">{job.mobileNo}</a>
              </div>

              {/* Spare Parts */}
              {job.spareParts.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package size={13} className="text-gray-500" />
                    <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Spare Parts</span>
                  </div>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="text-left pb-1">Part</th>
                        <th className="text-center pb-1">Qty</th>
                        <th className="text-right pb-1">Rate</th>
                        <th className="text-right pb-1">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.spareParts.map((sp, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-1 text-gray-700">{sp.name}</td>
                          <td className="py-1 text-center text-gray-700">{sp.qty}</td>
                          <td className="py-1 text-right text-gray-700">₹{sp.rate}</td>
                          <td className="py-1 text-right font-semibold text-gray-800">₹{sp.qty * sp.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* AMC Details */}
              {job.amcDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-[11px]">
                  <p className="font-semibold text-green-700 mb-1 flex items-center gap-1"><FileText size={11} /> AMC Details</p>
                  <div className="grid grid-cols-2 gap-1 text-green-800">
                    <span>Ref: <strong>{job.amcDetails.amcRef}</strong></span>
                    <span>Type: <strong>{job.amcDetails.amcType}</strong></span>
                    <span>Start: {job.amcDetails.startDate}</span>
                    <span>End: {job.amcDetails.endDate}</span>
                  </div>
                </div>
              )}

              {/* Invoice Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[12px]">
                <p className="font-semibold text-blue-700 mb-1">Invoice Summary</p>
                <div className="flex justify-between text-blue-800">
                  <span>Service Charges:</span><span>₹{job.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Spare Parts:</span><span>₹{job.sparePartAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-900 border-t border-blue-200 mt-1 pt-1">
                  <span>Total:</span><span>₹{(job.totalAmount + job.sparePartAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => openMaps(job.geoLat, job.geoLng, job.customerAddress)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-lg text-[12px] font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Navigation size={13} /> Navigate
                </button>
                <button
                  onClick={() => setWhatsappJob(job)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-lg text-[12px] font-semibold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle size={13} /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-semibold">No jobs assigned today</p>
          </div>
        )}
      </div>

      {whatsappJob && (
        <WhatsAppSharePanel
          docket={{
            docketNo: whatsappJob.docketNo,
            customerName: whatsappJob.customerName,
            mobileNo: whatsappJob.mobileNo,
            model: whatsappJob.model,
            serviceEngineer: techName,
            status: whatsappJob.status,
            totalAmount: whatsappJob.totalAmount,
            sparePartAmount: whatsappJob.sparePartAmount,
            customerAddress: whatsappJob.customerAddress,
            natureOfDocket: whatsappJob.natureOfDocket,
          }}
          onClose={() => setWhatsappJob(null)}
        />
      )}
    </div>
  );
}
