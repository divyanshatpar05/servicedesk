'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import StatusBadge, { DocketStatus } from '@/components/ui/StatusBadge';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, X, Download, Settings2, MessageCircle, Loader2 } from 'lucide-react';
import EditAllotmentModal from './EditAllotmentModal';
import PrintInvoiceModal from './PrintInvoiceModal';
import WhatsAppSharePanel from './WhatsAppSharePanel';
import { createClient } from '@/lib/supabase/client';

interface Docket {
  id: string;
  slNo: number;
  docketNo: string;
  dateTime: string;
  customerName: string;
  mobileNo: string;
  model: string;
  natureOfDocket: string;
  status: DocketStatus;
  isOverdue: boolean;
  cardNo: string;
  cardDetail: string;
  alternateMob: string;
  customerAddress: string;
  detail: string;
  feedback: string;
  salePoint: string;
  salesExecutive: string;
  customerZipcode: string;
  area: string;
  paymentType: string;
  totalAmount: number;
  paymentMode: string;
  sparePartAmount: number;
  serviceEngineer: string;
}

const statusOptions: DocketStatus[] = ['New', 'Assigned', 'Visited', 'Diagnosed', 'In-Repair', 'Completed', 'Invoiced', 'Closed', 'Cancelled'];
const filterStatuses: (DocketStatus | 'All' | 'Overdue')[] = ['All', 'New', 'Assigned', 'Visited', 'In-Repair', 'Completed', 'Overdue', 'Closed'];

interface DocketTableProps {
  onCreateDocket: () => void;
}

type SortKey = keyof Docket;

function mapDbRowToDocket(row: Record<string, unknown>, idx: number): Docket {
  const createdAt = row.created_at ? String(row.created_at) : '';
  // Parse ISO date and format as DD/MM/YYYY HH:MM to match imported data format
  let dateTime = '';
  if (createdAt) {
    // Extract date and time parts from ISO string (ignore timezone, use as-is)
    const isoStr = createdAt.replace('T', ' ').slice(0, 16); // "YYYY-MM-DD HH:MM"
    const [datePart, timePart] = isoStr.split(' ');
    if (datePart) {
      const [year, month, day] = datePart.split('-');
      dateTime = `${day}/${month}/${year}${timePart ? ' ' + timePart : ''}`;
    }
  }
  const status = (row.docket_status as string) || 'New';
  // Map DB status values to UI status values
  const statusMap: Record<string, DocketStatus> = {
    RUNNING: 'In-Repair',
    COMPLETED: 'Completed',
    PENDING: 'New',
    CANCELLED: 'Cancelled',
  };
  const uiStatus: DocketStatus = (statusMap[status] as DocketStatus) || (status as DocketStatus) || 'New';

  return {
    id: String(row.id),
    slNo: idx + 1,
    docketNo: String(row.docket_number || ''),
    dateTime,
    customerName: String(row.customer_name || ''),
    mobileNo: String(row.mobile_number || ''),
    model: String(row.model_no || ''),
    natureOfDocket: String(row.nature_of_docket || ''),
    status: uiStatus,
    isOverdue: false,
    cardNo: String(row.card_no || ''),
    cardDetail: String(row.card_detail || ''),
    alternateMob: String(row.alternate_mobile || ''),
    customerAddress: String(row.customer_address || ''),
    detail: String(row.docket_detail || ''),
    feedback: String(row.feedback || ''),
    salePoint: String(row.sale_point || ''),
    salesExecutive: String(row.sales_executive || ''),
    customerZipcode: String(row.zipcode || ''),
    area: String(row.area || ''),
    paymentType: '',
    totalAmount: 0,
    paymentMode: '',
    sparePartAmount: 0,
    serviceEngineer: '',
  };
}

export default function DocketTable({ onCreateDocket }: DocketTableProps) {
  const [dockets, setDockets] = useState<Docket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('slNo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [editingDocket, setEditingDocket] = useState<Docket | null>(null);
  const [printingDocket, setPrintingDocket] = useState<Docket | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [whatsappDocket, setWhatsappDocket] = useState<Docket | null>(null);

  const fetchDockets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('service_dockets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      const mapped = (data || []).map((row, idx) => mapDbRowToDocket(row as Record<string, unknown>, idx));
      setDockets(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dockets';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDockets();
  }, [fetchDockets]);

  const filtered = useMemo(() => {
    let d = [...dockets];
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(x =>
        x.docketNo.toLowerCase().includes(q) ||
        x.customerName.toLowerCase().includes(q) ||
        x.mobileNo.includes(q) ||
        x.model.toLowerCase().includes(q) ||
        x.natureOfDocket.toLowerCase().includes(q)
      );
    }
    if (filterStatus === 'Overdue') d = d.filter(x => x.isOverdue);
    else if (filterStatus !== 'All') d = d.filter(x => x.status === filterStatus);
    d.sort((a, b) => {
      const av = String(a[sortKey]);
      const bv = String(b[sortKey]);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return d;
  }, [dockets, search, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = async (id: string) => {
    setDeletingIds(prev => new Set([...prev, id]));
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from('service_dockets').delete().eq('id', id);
      if (delError) throw delError;
      setDockets(prev => prev.filter(d => d.id !== id));
      toast.success('Docket deleted successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toast.error(msg);
    } finally {
      setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleExport = () => {
    const exportData = filtered.map(d => ({
      'Sl No': d.slNo,
      'Docket No': d.docketNo,
      'Date & Time': d.dateTime,
      'Customer Name': d.customerName,
      'Mobile No': d.mobileNo,
      'Model': d.model,
      'Nature of Docket': d.natureOfDocket,
      'Status': d.status,
      'Overdue': d.isOverdue ? 'Yes' : 'No',
      'Card No': d.cardNo,
      'Customer Address': d.customerAddress,
      'Sale Point': d.salePoint,
      'Sales Executive': d.salesExecutive,
      'Service Engineer': d.serviceEngineer,
      'Payment Type': d.paymentType,
      'Total Amount': d.totalAmount,
      'Payment Mode': d.paymentMode,
      'Spare Part Amount': d.sparePartAmount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dockets');
    XLSX.writeFile(wb, `service-dockets-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully!');
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={11} className="opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp size={11} className="text-primary" /> : <ChevronDown size={11} className="text-primary" />;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-card p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="text-primary animate-spin" />
        <p className="text-[13px] text-muted-foreground">Loading dockets from database…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl shadow-card p-12 flex flex-col items-center justify-center gap-3">
        <AlertTriangle size={32} className="text-danger" />
        <p className="text-[13px] text-danger font-semibold">{error}</p>
        <button onClick={fetchDockets} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-[12px] font-semibold">Retry</button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dockets…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-input border border-border rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X size={12} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {filterStatuses.map(s => (
            <button
              key={`chip-${s}`}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all duration-150 border ${
                filterStatus === s
                  ? s === 'Overdue' ? 'bg-danger text-white border-danger' : 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-transparent hover:border-border hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={fetchDockets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
            title="Refresh"
          >
            <Loader2 size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
          >
            <Download size={13} />
            Export Excel
          </button>
          <button
            onClick={onCreateDocket}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
          >
            + New Docket
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                { key: 'slNo', label: 'Sl No' },
                { key: 'docketNo', label: 'Docket No.' },
                { key: 'dateTime', label: 'Date & Time' },
                { key: 'customerName', label: 'Customer Name' },
                { key: 'mobileNo', label: 'Mobile No.' },
                { key: 'model', label: 'Model' },
                { key: 'natureOfDocket', label: 'Nature of Docket' },
                { key: 'status', label: 'Status' },
              ].map(col => (
                <th
                  key={`th-${col.key}`}
                  onClick={() => handleSort(col.key as SortKey)}
                  className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key as SortKey} />
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground text-[13px]">
                  {dockets.length === 0 ? 'No dockets found in the database.' : 'No dockets match your search or filter criteria.'}
                </td>
              </tr>
            ) : (
              paginated.map((docket, rowIdx) => {
                const isDeleting = deletingIds.has(docket.id);
                return (
                  <tr
                    key={docket.id}
                    className={`border-b border-border transition-all duration-200 group
                      ${isDeleting ? 'opacity-0' : ''}
                      ${docket.isOverdue ? 'bg-danger/5 hover:bg-danger/10' : rowIdx % 2 === 0 ? 'bg-card hover:bg-muted/40' : 'bg-muted/20 hover:bg-muted/50'}
                    `}
                  >
                    <td className="px-3 py-3 text-[12px] text-muted-foreground font-medium">{(page - 1) * perPage + rowIdx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[12px] font-semibold text-primary">{docket.docketNo}</span>
                        {docket.isOverdue && <AlertTriangle size={11} className="text-danger flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-foreground whitespace-nowrap">{docket.dateTime}</td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{docket.customerName}</p>
                        {docket.area && <p className="text-[10px] text-muted-foreground">{docket.area}</p>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-mono text-foreground">{docket.mobileNo}</td>
                    <td className="px-3 py-3 text-[12px] text-foreground">{docket.model}</td>
                    <td className="px-3 py-3 text-[12px] text-foreground">{docket.natureOfDocket}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={docket.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Edit"
                          onClick={() => setEditingDocket(docket)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-warning/10 text-muted-foreground hover:text-warning transition-colors"
                        >
                          <Settings2 size={13} />
                        </button>
                        <button
                          title="Print Invoice"
                          onClick={() => setPrintingDocket(docket)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ChevronRight size={13} />
                        </button>
                        <button
                          title="WhatsApp"
                          onClick={() => setWhatsappDocket(docket)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-green-100 text-muted-foreground hover:text-green-600 transition-colors"
                        >
                          <MessageCircle size={13} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(docket.id)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                        >
                          <X size={13} />
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-[12px] text-muted-foreground">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-[12px] font-medium transition-colors ${
                    p === page ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {editingDocket && (
        <EditAllotmentModal
          open={!!editingDocket}
          entry={editingDocket as unknown as Parameters<typeof EditAllotmentModal>[0]['entry']}
          onClose={() => setEditingDocket(null)}
          onSave={() => { setEditingDocket(null); fetchDockets(); }}
        />
      )}
      {printingDocket && (
        <PrintInvoiceModal
          open={!!printingDocket}
          entry={printingDocket as unknown as Parameters<typeof PrintInvoiceModal>[0]['entry']}
          onClose={() => setPrintingDocket(null)}
        />
      )}
      {whatsappDocket && (
        <WhatsAppSharePanel
          entry={whatsappDocket as unknown as Parameters<typeof WhatsAppSharePanel>[0]['entry']}
          onClose={() => setWhatsappDocket(null)}
        />
      )}
    </div>
  );
}