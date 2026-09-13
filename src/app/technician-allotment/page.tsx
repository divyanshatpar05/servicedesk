'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { Search, Printer, Trash2, MapPin, Clock, CheckCircle, X, ChevronLeft, ChevronRight, Download, Brain, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import PrintInvoiceModal from '../service-docket-management/components/PrintInvoiceModal';
import { MessageCircle } from 'lucide-react';
import WhatsAppSharePanel from '../service-docket-management/components/WhatsAppSharePanel';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

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

// Pincode proximity map (simplified)
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

const geoStatusLabel: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
  started: { label: 'Work Started', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
};

function mapRowToEntry(row: Record<string, unknown>, idx: number): AllotmentEntry {
  const allotmentDate = row.allotment_date ? String(row.allotment_date) : '';
  const date = allotmentDate ? allotmentDate.split('T')[0] : '';

  let geoStatus: 'not_started' | 'started' | 'completed' = 'not_started';
  if (row.geo_end_time) geoStatus = 'completed';
  else if (row.geo_start_time) geoStatus = 'started';

  const startTime = row.geo_start_time ? String(row.geo_start_time).replace('T', ' ').slice(11, 16) : undefined;
  const endTime = row.geo_end_time ? String(row.geo_end_time).replace('T', ' ').slice(11, 16) : undefined;
  const startLocation = (row.geo_start_lat && row.geo_start_lng) ? `${row.geo_start_lat},${row.geo_start_lng}` : undefined;
  const endLocation = (row.geo_end_lat && row.geo_end_lng) ? `${row.geo_end_lat},${row.geo_end_lng}` : undefined;

  return {
    id: String(row.id),
    slNo: idx + 1,
    date,
    name: String(row.service_engineer || ''),
    customerName: String(row.customer_name || ''),
    area: String(row.area || ''),
    mobileNo: String(row.mobile_number || ''),
    model: String(row.model || ''),
    paymentType: String(row.payment_type || ''),
    totalAmount: Number(row.total_amount || 0),
    paymentMode: String(row.payment_mode || ''),
    sparePartAmount: Number(row.spare_part_amount || 0),
    geoStatus,
    startTime,
    endTime,
    startLocation,
    endLocation,
    geoLink: String(row.geo_link || ''),
    docketNo: String(row.docket_number || ''),
    cardNo: '',
    cardDetail: '',
    dateTime: allotmentDate ? allotmentDate.replace('T', ' ').slice(0, 16) : '',
    mobileNoFull: String(row.mobile_number || ''),
    alternateMob: '',
    customerAddress: '',
    detail: '',
    feedback: '',
    salePoint: '',
    salesExecutive: '',
    customerZipcode: '',
    natureOfDocket: '',
    status: String(row.work_status || 'PENDING'),
    isOverdue: false,
    serviceEngineer: String(row.service_engineer || ''),
  };
}

export default function TechnicianAllotmentPage() {
  const [allotments, setAllotments] = useState<AllotmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);
  const [printingEntry, setPrintingEntry] = useState<AllotmentEntry | null>(null);
  const [geoViewEntry, setGeoViewEntry] = useState<AllotmentEntry | null>(null);
  const [whatsappEntry, setWhatsappEntry] = useState<AllotmentEntry | null>(null);
  const [aiRoutingEntry, setAiRoutingEntry] = useState<AllotmentEntry | null>(null);

  const fetchAllotments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('technician_allotments')
        .select('*')
        .order('allotment_date', { ascending: false });
      if (fetchError) throw fetchError;
      setAllotments((data || []).map((row, idx) => mapRowToEntry(row as Record<string, unknown>, idx)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load allotments';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllotments(); }, [fetchAllotments]);

  const filtered = allotments.filter(a =>
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
      toast.success(`Geo link copied!\n${link}`);
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from('technician_allotments').delete().eq('id', id);
      if (delError) throw delError;
      setAllotments(prev => prev.filter(a => a.id !== id));
      toast.success('Allotment deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
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

  const aiSuggestions = aiRoutingEntry ? allotments.filter(a => {
    const nearby = [aiRoutingEntry.customerZipcode, ...getNearbyPincodes(aiRoutingEntry.customerZipcode)];
    return nearby.includes(a.customerZipcode) && a.id !== aiRoutingEntry.id;
  }) : [];

  if (loading) {
    return (
      <AppLayout title="Technician Allotment" subtitle="Manage technician job assignments and track field activity">
        <div className="bg-card rounded-xl shadow-card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-[13px] text-muted-foreground">Loading allotments from database…</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Technician Allotment" subtitle="Manage technician job assignments and track field activity">
        <div className="bg-card rounded-xl shadow-card p-12 flex flex-col items-center justify-center gap-3">
          <AlertTriangle size={32} className="text-danger" />
          <p className="text-[13px] text-danger font-semibold">{error}</p>
          <button onClick={fetchAllotments} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-[12px] font-semibold">Retry</button>
        </div>
      </AppLayout>
    );
  }

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
              onClick={fetchAllotments}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
            >
              <Loader2 size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
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
                  <td colSpan={13} className="text-center py-12 text-muted-foreground text-[13px]">
                    {allotments.length === 0 ? 'No allotments found in the database.' : 'No allotments match your search.'}
                  </td>
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
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{entry.paymentType || '—'}</span>
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
                            title="Print Invoice"
                            onClick={() => setPrintingEntry(entry)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDelete(entry.id)}
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
                <p className="text-purple-600">Current area: <strong>{aiRoutingEntry.area}</strong></p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <MapPin size={13} className="text-purple-600" />
                  Nearby Allotments ({aiSuggestions.length} found)
                </p>
                {aiSuggestions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-[13px]">No nearby allotments found.</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {aiSuggestions.slice(0, 5).map((s, i) => (
                      <div key={i} className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-[12px]">
                          <p className="font-semibold text-foreground">{s.customerName}</p>
                          <p className="text-muted-foreground">{s.model}</p>
                          <p className="text-[11px] text-purple-600 mt-0.5">📍 {s.area}</p>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{s.docketNo}</span>
                      </div>
                    ))}
                  </div>
                )}
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
          entry={whatsappEntry as unknown as Parameters<typeof WhatsAppSharePanel>[0]['entry']}
          onClose={() => setWhatsappEntry(null)}
        />
      )}

      {/* Print Invoice */}
      {printingEntry && (
        <PrintInvoiceModal
          open={!!printingEntry}
          entry={printingEntry as unknown as Parameters<typeof PrintInvoiceModal>[0]['entry']}
          onClose={() => setPrintingEntry(null)}
        />
      )}
    </AppLayout>
  );
}
