'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Search, Edit2, Printer, Trash2, MapPin, Clock, CheckCircle, X, ChevronLeft, ChevronRight, Download, Brain, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';
import PrintInvoiceModal from '../service-docket-management/components/PrintInvoiceModal';
import { MessageCircle } from 'lucide-react';
import WhatsAppSharePanel from '../service-docket-management/components/WhatsAppSharePanel';

interface AllotmentEntry {
  id: string;
  slNo: number;
  date: string;
  name: string;
  customerName: string;
  area: string;
  mobileNo: string;
  model: string;
  paymentType: string;
  totalAmount: number;
  paymentMode: string;
  sparePartAmount: number;
  geoStatus: 'not_started' | 'started' | 'completed';
  startTime?: string;
  endTime?: string;
  startLocation?: string;
  endLocation?: string;
  geoLink: string;
  docketNo: string;
  cardNo: string;
  cardDetail: string;
  dateTime: string;
  mobileNoFull: string;
  alternateMob: string;
  customerAddress: string;
  detail: string;
  feedback: string;
  salePoint: string;
  salesExecutive: string;
  customerZipcode: string;
  natureOfDocket: string;
  status: string;
  isOverdue: boolean;
  serviceEngineer: string;
}

const mockAllotments: AllotmentEntry[] = [
  { id: 'al-001', slNo: 1, date: '2026-07-10', name: 'PRITAM SARKAR', customerName: 'Priya Sharma', area: 'Bandra West', mobileNo: '9820145678', model: 'VEGA DLX-60', paymentType: 'AMC', totalAmount: 0, paymentMode: 'Cash', sparePartAmount: 0, geoStatus: 'completed', startTime: '09:30', endTime: '11:00', startLocation: '22.5726,88.3639', endLocation: '22.5726,88.3639', geoLink: 'geo-al-001', docketNo: '100000001', cardNo: '92384/GF-1', cardDetail: 'GF-1', dateTime: '2026-07-10 09:30', mobileNoFull: '9820145678', alternateMob: '', customerAddress: '47 D.N.C RD KOL-700035', detail: '', feedback: '', salePoint: 'GET/SINTHI', salesExecutive: 'TULI', customerZipcode: '700035', natureOfDocket: 'AMC', status: 'Completed', isOverdue: false, serviceEngineer: 'PRITAM SARKAR' },
  { id: 'al-002', slNo: 2, date: '2026-07-10', name: 'RAJAN K.', customerName: 'Rajesh Kumar', area: 'Andheri East', mobileNo: '9867432109', model: 'HESTIA 90', paymentType: 'Paid', totalAmount: 500, paymentMode: 'Online', sparePartAmount: 200, geoStatus: 'started', startTime: '11:00', geoLink: 'geo-al-002', docketNo: '100000002', cardNo: '92385/GF-2', cardDetail: 'GF-2', dateTime: '2026-07-10 11:00', mobileNoFull: '9867432109', alternateMob: '9867432110', customerAddress: '12 Park Street KOL-700016', detail: '', feedback: '', salePoint: 'GET/PARK', salesExecutive: 'DALIA', customerZipcode: '700016', natureOfDocket: 'Repair', status: 'Assigned', isOverdue: false, serviceEngineer: 'RAJAN K.' },
  { id: 'al-003', slNo: 3, date: '2026-07-09', name: 'ARJUN M.', customerName: 'Meera Nair', area: 'Andheri West', mobileNo: '9741238900', model: 'KUTCHINA NOVA', paymentType: 'Free', totalAmount: 0, paymentMode: 'Cash', sparePartAmount: 0, geoStatus: 'not_started', geoLink: 'geo-al-003', docketNo: '100000003', cardNo: '92386/GF-3', cardDetail: 'GF-3', dateTime: '2026-07-09 14:00', mobileNoFull: '9741238900', alternateMob: '', customerAddress: '5 Lake Road KOL-700029', detail: '', feedback: '', salePoint: 'GET/LAKE', salesExecutive: 'SREYA', customerZipcode: '700029', natureOfDocket: 'Installation', status: 'Visited', isOverdue: false, serviceEngineer: 'ARJUN M.' },
  { id: 'al-004', slNo: 4, date: '2026-07-08', name: 'DEEPA V.', customerName: 'Suresh Patil', area: 'Powai', mobileNo: '9823001122', model: 'VEGA DLX-90', paymentType: 'Warranty', totalAmount: 0, paymentMode: 'Cash', sparePartAmount: 150, geoStatus: 'completed', startTime: '10:30', endTime: '12:00', geoLink: 'geo-al-004', docketNo: '100000004', cardNo: '92387/GF-4', cardDetail: 'GF-4', dateTime: '2026-07-08 10:30', mobileNoFull: '9823001122', alternateMob: '', customerAddress: '8 MG Road KOL-700007', detail: '', feedback: 'Good service', salePoint: 'GET/MG', salesExecutive: 'TULI', customerZipcode: '700007', natureOfDocket: 'Warranty', status: 'Completed', isOverdue: false, serviceEngineer: 'DEEPA V.' },
  { id: 'al-005', slNo: 5, date: '2026-07-07', name: 'PRIYA S.', customerName: 'Kavitha Rao', area: 'Thane', mobileNo: '9988776655', model: 'HESTIA 60', paymentType: 'AMC', totalAmount: 0, paymentMode: 'Bank', sparePartAmount: 0, geoStatus: 'not_started', geoLink: 'geo-al-005', docketNo: '100000005', cardNo: '92388/GF-5', cardDetail: 'GF-5', dateTime: '2026-07-07 16:00', mobileNoFull: '9988776655', alternateMob: '9988776656', customerAddress: '22 Thane West KOL-400601', detail: '', feedback: '', salePoint: 'GET/THANE', salesExecutive: 'DALIA', customerZipcode: '400601', natureOfDocket: 'AMC', status: 'Diagnosed', isOverdue: false, serviceEngineer: 'PRIYA S.' },
];

// Pending services data for AI routing suggestions
const pendingServices = [
  { docketNo: '100000009', customerName: 'Amit Roy', pincode: '700035', area: 'Sinthi', model: 'VEGA DLX-60', status: 'New', natureOfDocket: 'Repair' },
  { docketNo: '100000010', customerName: 'Suman Das', pincode: '700036', area: 'Shyambazar', model: 'HESTIA 90', status: 'New', natureOfDocket: 'AMC' },
  { docketNo: '100000011', customerName: 'Ritu Ghosh', pincode: '700016', area: 'Park Street', model: 'KUTCHINA NOVA', status: 'Assigned', natureOfDocket: 'Warranty' },
  { docketNo: '100000012', customerName: 'Mohan Lal', pincode: '700029', area: 'Lake Town', model: 'VEGA DLX-90', status: 'New', natureOfDocket: 'Repair' },
  { docketNo: '100000013', customerName: 'Sunita Bose', pincode: '400601', area: 'Thane West', model: 'HESTIA 60', status: 'New', natureOfDocket: 'AMC' },
  { docketNo: '100000014', customerName: 'Kiran Mehta', pincode: '400070', area: 'Kurla East', model: 'VEGA DLX-60', status: 'New', natureOfDocket: 'Repair' },
];

// Pincode proximity map (simplified — nearby pincodes within ~5km)
const pincodeProximity: Record<string, string[]> = {
  '700035': ['700036', '700037', '700002', '700003'],
  '700016': ['700017', '700013', '700020', '700029'],
  '700029': ['700016', '700028', '700030', '700054'],
  '400601': ['400602', '400603', '400604', '400605'],
  '400070': ['400071', '400072', '400069', '400024'],
  '700007': ['700006', '700008', '700009', '700010'],
  '400064': ['400063', '400065', '400066', '400067'],
  '400076': ['400075', '400077', '400078', '400079'],
};

function getNearbyPincodes(pincode: string): string[] {
  return pincodeProximity[pincode] || [];
}

function getAIRoutingSuggestions(technicianPincode: string) {
  const nearby = [technicianPincode, ...getNearbyPincodes(technicianPincode)];
  return pendingServices.filter(s => nearby.includes(s.pincode));
}

const geoStatusLabel: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
  started: { label: 'Work Started', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
};

export default function TechnicianAllotmentPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);
  const [printingEntry, setPrintingEntry] = useState<AllotmentEntry | null>(null);
  const [geoViewEntry, setGeoViewEntry] = useState<AllotmentEntry | null>(null);
  const [whatsappEntry, setWhatsappEntry] = useState<AllotmentEntry | null>(null);
  const [aiRoutingEntry, setAiRoutingEntry] = useState<AllotmentEntry | null>(null);

  const filtered = mockAllotments.filter(a =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.customerName.toLowerCase().includes(search.toLowerCase()) ||
    a.mobileNo.includes(search) ||
    a.docketNo.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const copyGeoLink = (entry: AllotmentEntry) => {
    const link = `${window.location.origin}/technician-work/${entry.geoLink}`;
    navigator.clipboard.writeText(link).then(() => {
      alert(`Geo link copied!\n${link}`);
    });
  };

  const handleExport = () => {
    const exportData = filtered.map(a => ({
      'Sl No': a.slNo,
      'Date': a.date,
      'Technician': a.name,
      'Customer Name': a.customerName,
      'Area': a.area,
      'Mobile No': a.mobileNo,
      'Model': a.model,
      'Payment Type': a.paymentType,
      'Total Amount': a.totalAmount,
      'Payment Mode': a.paymentMode,
      'Spare Part Amount': a.sparePartAmount,
      'Geo Status': geoStatusLabel[a.geoStatus]?.label || a.geoStatus,
      'Start Time': a.startTime || '—',
      'End Time': a.endTime || '—',
      'Docket No': a.docketNo,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Technician Allotment');
    XLSX.writeFile(wb, `technician-allotment-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const aiSuggestions = aiRoutingEntry ? getAIRoutingSuggestions(aiRoutingEntry.customerZipcode) : [];

  return (
    <AppLayout title="Technician Allotment" subtitle="Manage technician job assignments and track field activity">
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search allotments…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-input border border-border rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X size={12} className="text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
            >
              <Download size={13} /> Export Excel
            </button>
            <span className="text-[12px] text-muted-foreground">
              Total: <strong>{filtered.length}</strong> allotments
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Sl No', 'Date', 'Name', 'Customer Name', 'Area', 'Mobile No.', 'Model', 'Payment Type', 'Total Amount', 'Payment Mode', 'Spare Part Amt', 'Geo Status', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-muted-foreground text-[13px]">No allotments found.</td>
                </tr>
              ) : (
                paginated.map((entry, idx) => {
                  const geo = geoStatusLabel[entry.geoStatus];
                  return (
                    <tr key={entry.id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'} hover:bg-muted/40 transition-colors`}>
                      <td className="px-3 py-3 text-[12px] text-muted-foreground">{entry.slNo}</td>
                      <td className="px-3 py-3 text-[12px] text-foreground whitespace-nowrap">{entry.date}</td>
                      <td className="px-3 py-3 text-[12px] font-semibold text-foreground">{entry.name}</td>
                      <td className="px-3 py-3 text-[12px] text-foreground">{entry.customerName}</td>
                      <td className="px-3 py-3 text-[12px] text-foreground">{entry.area}</td>
                      <td className="px-3 py-3 text-[12px] font-mono text-foreground">{entry.mobileNo}</td>
                      <td className="px-3 py-3 text-[12px] text-foreground">{entry.model}</td>
                      <td className="px-3 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{entry.paymentType}</span>
                      </td>
                      <td className="px-3 py-3 text-[12px] font-mono text-foreground">₹{entry.totalAmount.toFixed(2)}</td>
                      <td className="px-3 py-3 text-[12px] text-foreground">{entry.paymentMode}</td>
                      <td className="px-3 py-3 text-[12px] font-mono text-foreground">₹{entry.sparePartAmount.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${geo.color}`}>{geo.label}</span>
                          {entry.startTime && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock size={9} /> Start: {entry.startTime}
                            </span>
                          )}
                          {entry.endTime && (
                            <span className="text-[10px] text-green-600 flex items-center gap-1">
                              <CheckCircle size={9} /> End: {entry.endTime}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            title="Edit"
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-warning/10 text-muted-foreground hover:text-warning transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            title="Print Invoice"
                            onClick={() => setPrintingEntry(entry)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            title="Delete"
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            title="Geo Tag — Copy technician link"
                            onClick={() => setGeoViewEntry(entry)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-green-100 text-muted-foreground hover:text-green-600 transition-colors"
                          >
                            <MapPin size={13} />
                          </button>
                          <button
                            title="Send WhatsApp Message"
                            onClick={() => setWhatsappEntry(entry)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          >
                            <MessageCircle size={13} />
                          </button>
                          <button
                            title="AI Pincode Routing Suggestions"
                            onClick={() => setAiRoutingEntry(entry)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                          >
                            <Brain size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/20">
          <span className="text-[12px] text-muted-foreground">Showing {paginated.length} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-7 h-7 flex items-center justify-center rounded border text-[12px] font-medium transition-colors ${page === i + 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Geo Tag Modal */}
      {geoViewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                <MapPin size={16} className="text-green-600" /> Geo Tag — {geoViewEntry.name}
              </h2>
              <button onClick={() => setGeoViewEntry(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-lg p-3 text-[12px]">
                <p><strong>Docket:</strong> {geoViewEntry.docketNo}</p>
                <p><strong>Customer:</strong> {geoViewEntry.customerName}</p>
                <p><strong>Technician:</strong> {geoViewEntry.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-foreground">Technician Work Link:</p>
                <div className="bg-gray-50 border border-border rounded p-2 text-[11px] font-mono text-primary break-all">
                  https://servicedes3878.builtwithrocket.new/technician-work/{geoViewEntry.geoLink}
                </div>
                <button
                  onClick={() => copyGeoLink(geoViewEntry)}
                  className="w-full py-2 bg-primary text-primary-foreground rounded text-[12px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Copy Link
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="font-semibold text-yellow-700 mb-1 flex items-center gap-1"><Clock size={11} /> Start Work</p>
                  {geoViewEntry.startTime ? (
                    <p className="text-green-600">{geoViewEntry.startTime} ✓</p>
                  ) : (
                    <p className="text-muted-foreground">Not started</p>
                  )}
                  {geoViewEntry.startLocation && <p className="text-[10px] text-muted-foreground mt-1">📍 {geoViewEntry.startLocation}</p>}
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="font-semibold text-green-700 mb-1 flex items-center gap-1"><CheckCircle size={11} /> End Work</p>
                  {geoViewEntry.endTime ? (
                    <p className="text-green-600">{geoViewEntry.endTime} ✓</p>
                  ) : (
                    <p className="text-muted-foreground">Not completed</p>
                  )}
                  {geoViewEntry.endLocation && <p className="text-[10px] text-muted-foreground mt-1">📍 {geoViewEntry.endLocation}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Routing Panel */}
      {aiRoutingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <Brain size={18} />
                <span className="font-bold text-[15px]">AI Pincode Routing</span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">Smart Suggestions</span>
              </div>
              <button onClick={() => setAiRoutingEntry(null)} className="hover:bg-white/20 rounded p-1 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-[12px]">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className="text-purple-600" />
                  <span className="font-semibold text-purple-700">Technician: {aiRoutingEntry.name}</span>
                </div>
                <p className="text-purple-600">Current pincode area: <strong>{aiRoutingEntry.customerZipcode}</strong> ({aiRoutingEntry.area})</p>
                <p className="text-purple-500 text-[11px] mt-1">Nearby pincodes: {getNearbyPincodes(aiRoutingEntry.customerZipcode).join(', ') || 'None mapped'}</p>
              </div>

              <div>
                <p className="text-[12px] font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <MapPin size={13} className="text-purple-600" />
                  Pending Services in Nearby Area ({aiSuggestions.length} found)
                </p>
                {aiSuggestions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-[13px]">
                    No pending services found in nearby pincodes.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {aiSuggestions.map((s, i) => (
                      <div key={i} className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-[12px]">
                          <p className="font-semibold text-foreground">{s.customerName}</p>
                          <p className="text-muted-foreground">{s.model} — {s.natureOfDocket}</p>
                          <p className="text-[11px] text-purple-600 mt-0.5">📍 Pincode: {s.pincode} ({s.area})</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{s.docketNo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-700">
                <p className="font-semibold mb-1">💡 AI Recommendation</p>
                {aiSuggestions.length > 0
                  ? `Assign ${aiRoutingEntry.name} to ${aiSuggestions[0].customerName}'s job (${aiSuggestions[0].docketNo}) — same pincode cluster, optimal routing.`
                  : `No nearby pending services. Consider assigning ${aiRoutingEntry.name} to a different area.`
                }
              </div>

              <button
                onClick={() => setAiRoutingEntry(null)}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-[13px] font-bold hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Share Panel */}
      {whatsappEntry && (
        <WhatsAppSharePanel
          docket={{
            docketNo: whatsappEntry.docketNo,
            customerName: whatsappEntry.customerName,
            mobileNo: whatsappEntry.mobileNoFull,
            model: whatsappEntry.model,
            serviceEngineer: whatsappEntry.name,
            status: whatsappEntry.status,
            totalAmount: whatsappEntry.totalAmount,
            sparePartAmount: whatsappEntry.sparePartAmount,
            customerAddress: whatsappEntry.customerAddress,
            natureOfDocket: whatsappEntry.natureOfDocket,
          }}
          onClose={() => setWhatsappEntry(null)}
        />
      )}

      {/* Print Invoice */}
      {printingEntry && (
        <PrintInvoiceModal
          open={!!printingEntry}
          docket={{
            id: printingEntry.id,
            slNo: printingEntry.slNo,
            docketNo: printingEntry.docketNo,
            dateTime: printingEntry.dateTime,
            customerName: printingEntry.customerName,
            mobileNo: printingEntry.mobileNoFull,
            model: printingEntry.model,
            natureOfDocket: printingEntry.natureOfDocket,
            status: printingEntry.status,
            isOverdue: printingEntry.isOverdue,
            cardNo: printingEntry.cardNo,
            cardDetail: printingEntry.cardDetail,
            alternateMob: printingEntry.alternateMob,
            customerAddress: printingEntry.customerAddress,
            detail: printingEntry.detail,
            feedback: printingEntry.feedback,
            salePoint: printingEntry.salePoint,
            salesExecutive: printingEntry.salesExecutive,
            customerZipcode: printingEntry.customerZipcode,
            area: printingEntry.area,
            paymentType: printingEntry.paymentType,
            totalAmount: printingEntry.totalAmount,
            paymentMode: printingEntry.paymentMode,
            sparePartAmount: printingEntry.sparePartAmount,
            serviceEngineer: printingEntry.name,
          }}
          onClose={() => setPrintingEntry(null)}
        />
      )}
    </AppLayout>
  );
}
