'use client';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import StatusBadge, { DocketStatus } from '@/components/ui/StatusBadge';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, X, Download, Settings2, MessageCircle } from 'lucide-react';
import EditAllotmentModal from './EditAllotmentModal';
import PrintInvoiceModal from './PrintInvoiceModal';
import WhatsAppSharePanel from './WhatsAppSharePanel';

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

const mockDockets: Docket[] = [
  { id: 'dk-001', slNo: 1, docketNo: '100000001', dateTime: '2026-07-10 09:30', customerName: 'Priya Sharma', mobileNo: '9820145678', model: 'VEGA DLX-60', natureOfDocket: 'AMC', status: 'New', isOverdue: false, cardNo: '92384/GF-1', cardDetail: 'GF-1', alternateMob: '', customerAddress: '47 D.N.C RD KOL-700035', detail: 'Not heating properly', feedback: '', salePoint: 'GET/SINTHI', salesExecutive: 'TULI', customerZipcode: '700035', area: 'Bandra West', paymentType: 'AMC', totalAmount: 0, paymentMode: 'Cash', sparePartAmount: 0, serviceEngineer: 'PRITAM SARKAR' },
  { id: 'dk-002', slNo: 2, docketNo: '100000002', dateTime: '2026-07-10 11:00', customerName: 'Rajesh Kumar', mobileNo: '9867432109', model: 'HESTIA 90', natureOfDocket: 'Repair', status: 'Assigned', isOverdue: false, cardNo: '92385/GF-2', cardDetail: 'GF-2', alternateMob: '9867432110', customerAddress: '12 Park Street KOL-700016', detail: 'Cooling issue', feedback: '', salePoint: 'GET/PARK', salesExecutive: 'DALIA', customerZipcode: '700016', area: 'Andheri East', paymentType: 'Paid', totalAmount: 500, paymentMode: 'Online', sparePartAmount: 200, serviceEngineer: 'RAJAN K.' },
  { id: 'dk-003', slNo: 3, docketNo: '100000003', dateTime: '2026-07-09 14:00', customerName: 'Meera Nair', mobileNo: '9741238900', model: 'KUTCHINA NOVA', natureOfDocket: 'Installation', status: 'Visited', isOverdue: false, cardNo: '92386/GF-3', cardDetail: 'GF-3', alternateMob: '', customerAddress: '5 Lake Road KOL-700029', detail: 'New installation', feedback: '', salePoint: 'GET/LAKE', salesExecutive: 'SREYA', customerZipcode: '700029', area: 'Andheri West', paymentType: 'Free', totalAmount: 0, paymentMode: 'Cash', sparePartAmount: 0, serviceEngineer: 'ARJUN M.' },
  { id: 'dk-004', slNo: 4, docketNo: '100000004', dateTime: '2026-07-08 10:30', customerName: 'Suresh Patil', mobileNo: '9823001122', model: 'VEGA DLX-90', natureOfDocket: 'Warranty', status: 'Completed', isOverdue: false, cardNo: '92387/GF-4', cardDetail: 'GF-4', alternateMob: '', customerAddress: '8 MG Road KOL-700007', detail: 'E3 error', feedback: 'Good service', salePoint: 'GET/MG', salesExecutive: 'TULI', customerZipcode: '700007', area: 'Powai', paymentType: 'Warranty', totalAmount: 0, paymentMode: 'Cash', sparePartAmount: 150, serviceEngineer: 'DEEPA V.' },
  { id: 'dk-005', slNo: 5, docketNo: '100000005', dateTime: '2026-07-07 16:00', customerName: 'Kavitha Rao', mobileNo: '9988776655', model: 'HESTIA 60', natureOfDocket: 'AMC', status: 'Diagnosed', isOverdue: false, cardNo: '92388/GF-5', cardDetail: 'GF-5', alternateMob: '9988776656', customerAddress: '22 Thane West KOL-400601', detail: 'Compressor noise', feedback: '', salePoint: 'GET/THANE', salesExecutive: 'DALIA', customerZipcode: '400601', area: 'Thane', paymentType: 'AMC', totalAmount: 0, paymentMode: 'Bank', sparePartAmount: 0, serviceEngineer: 'PRIYA S.' },
  { id: 'dk-006', slNo: 6, docketNo: '100000006', dateTime: '2026-07-06 09:00', customerName: 'Anil Deshmukh', mobileNo: '9820098765', model: 'KUTCHINA ELITE', natureOfDocket: 'Repair', status: 'In-Repair', isOverdue: true, cardNo: '92389/GF-6', cardDetail: 'GF-6', alternateMob: '', customerAddress: '15 Kurla East KOL-400070', detail: 'Ice maker failure', feedback: '', salePoint: 'GET/KURLA', salesExecutive: 'SREYA', customerZipcode: '400070', area: 'Kurla', paymentType: 'Paid', totalAmount: 1200, paymentMode: 'Cash', sparePartAmount: 800, serviceEngineer: 'SUNIL P.' },
  { id: 'dk-007', slNo: 7, docketNo: '100000007', dateTime: '2026-07-05 13:00', customerName: 'Sunita Joshi', mobileNo: '9711234567', model: 'VEGA DLX-60', natureOfDocket: 'Repair', status: 'New', isOverdue: true, cardNo: '92390/GF-7', cardDetail: 'GF-7', alternateMob: '', customerAddress: '3 Malad West KOL-400064', detail: 'Not cooling', feedback: '', salePoint: 'GET/MALAD', salesExecutive: 'TULI', customerZipcode: '400064', area: 'Malad', paymentType: 'Paid', totalAmount: 0, paymentMode: 'Online', sparePartAmount: 0, serviceEngineer: 'Unassigned' },
  { id: 'dk-008', slNo: 8, docketNo: '100000008', dateTime: '2026-07-07 11:30', customerName: 'Deepak Verma', mobileNo: '9876543210', model: 'HESTIA 90', natureOfDocket: 'Repair', status: 'In-Repair', isOverdue: true, cardNo: '92391/GF-8', cardDetail: 'GF-8', alternateMob: '9876543211', customerAddress: '9 Powai Lake KOL-400076', detail: 'Gas leakage', feedback: '', salePoint: 'GET/POWAI', salesExecutive: 'DALIA', customerZipcode: '400076', area: 'Powai', paymentType: 'Paid', totalAmount: 2000, paymentMode: 'Online', sparePartAmount: 1500, serviceEngineer: 'SUNIL P.' },
];

const statusOptions: DocketStatus[] = ['New', 'Assigned', 'Visited', 'Diagnosed', 'In-Repair', 'Completed', 'Invoiced', 'Closed', 'Cancelled'];
const filterStatuses: (DocketStatus | 'All' | 'Overdue')[] = ['All', 'New', 'Assigned', 'Visited', 'In-Repair', 'Completed', 'Overdue', 'Closed'];

interface DocketTableProps {
  onCreateDocket: () => void;
}

type SortKey = keyof Docket;

export default function DocketTable({ onCreateDocket }: DocketTableProps) {
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

  const filtered = useMemo(() => {
    let d = [...mockDockets];
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
  }, [search, filterStatus, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = (id: string) => {
    setDeletingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success('Docket deleted successfully');
    }, 300);
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
                  No dockets match your search or filter criteria.
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
                    <td className="px-3 py-3 text-[12px] text-muted-foreground font-medium">{docket.slNo}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[12px] font-semibold text-primary">{docket.docketNo}</span>
                        {docket.isOverdue && <AlertTriangle size={11} className="text-danger flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-foreground whitespace-nowrap">{docket.dateTime}</td>
                    <td className="px-3 py-3">
                      <p className="text-[13px] font-semibold text-foreground">{docket.customerName}</p>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-mono text-foreground">{docket.mobileNo}</td>
                    <td className="px-3 py-3 text-[12px] text-foreground">{docket.model}</td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{docket.natureOfDocket}</span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={docket.status} size="sm" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit Allotment"
                          onClick={() => setEditingDocket(docket)}
                          className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-[11px] font-semibold hover:bg-primary/20 transition-colors"
                        >
                          <Settings2 size={12} />
                          Action
                        </button>
                        <button
                          title="Send WhatsApp Message"
                          onClick={() => setWhatsappDocket(docket)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        >
                          <MessageCircle size={13} />
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
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/20">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span>Showing</span>
          <select
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="bg-input border border-border rounded px-2 py-0.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {[8, 15, 25, 50].map(n => (
              <option key={`per-page-${n}`} value={n}>{n}</option>
            ))}
          </select>
          <span>of <strong>{filtered.length}</strong> dockets</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => setPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded border text-[12px] font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Edit Allotment Modal */}
      {editingDocket && (
        <EditAllotmentModal
          open={!!editingDocket}
          docket={editingDocket}
          onClose={() => setEditingDocket(null)}
          onPrint={(d) => { setEditingDocket(null); setPrintingDocket(d); }}
        />
      )}

      {/* Print Invoice Modal */}
      {printingDocket && (
        <PrintInvoiceModal
          open={!!printingDocket}
          docket={printingDocket}
          onClose={() => setPrintingDocket(null)}
        />
      )}

      {/* WhatsApp Share Panel */}
      {whatsappDocket && (
        <WhatsAppSharePanel
          docket={whatsappDocket}
          onClose={() => setWhatsappDocket(null)}
        />
      )}
    </div>
  );
}