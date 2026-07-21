'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { RefreshCw, AlertTriangle, Bell, ChevronLeft, ChevronRight, Search, X, Plus, Edit2, Trash2, Calendar, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AMCEntry {
  id: string;
  slNo: number;
  customerName: string;
  mobileNo: string;
  model: string;
  amcType: string;
  totalServices: number;
  completedServices: number;
  lastServiceDate: string;
  nextServiceDate: string;
  expiryDate: string;
  status: 'active' | 'completed' | 'expired' | 'pending' | 'upcoming';
  docketNo: string;
  amcRefNo: string;
  amcStartDate: string;
  amcAmount: string;
  amcDoneBy: string;
  collectionMode: string;
  assignedTechnician: string;
  serviceDuration: string;
  amcCollectedBy: string;
}

const mockAMC: AMCEntry[] = [
  { id: 'amc-001', slNo: 1, customerName: 'Priya Sharma', mobileNo: '9820145678', model: 'VEGA DLX-60', amcType: 'AMC without spare', totalServices: 3, completedServices: 1, lastServiceDate: '2026-07-10', nextServiceDate: '2026-10-10', expiryDate: '2027-07-10', status: 'active', docketNo: '100000001', amcRefNo: '1678', amcStartDate: '2026-07-10', amcAmount: '2000.00', amcDoneBy: 'SWARNALI', collectionMode: 'Cash', assignedTechnician: 'PRITAM SARKAR', serviceDuration: '3 Month Duration', amcCollectedBy: 'SUBHASH DAS' },
  { id: 'amc-002', slNo: 2, customerName: 'Rajesh Kumar', mobileNo: '9867432109', model: 'HESTIA 90', amcType: 'AMC with spare', totalServices: 3, completedServices: 3, lastServiceDate: '2026-06-15', nextServiceDate: '—', expiryDate: '2026-12-15', status: 'completed', docketNo: '100000002', amcRefNo: '1679', amcStartDate: '2026-01-15', amcAmount: '3000.00', amcDoneBy: 'RAJAN K.', collectionMode: 'Online', assignedTechnician: 'RAJAN K.', serviceDuration: '4 Month Duration', amcCollectedBy: 'DALIA' },
  { id: 'amc-003', slNo: 3, customerName: 'Meera Nair', mobileNo: '9741238900', model: 'KUTCHINA NOVA', amcType: 'Comprehensive AMC', totalServices: 2, completedServices: 0, lastServiceDate: '—', nextServiceDate: '2026-08-01', expiryDate: '2027-01-01', status: 'upcoming', docketNo: '100000003', amcRefNo: '1680', amcStartDate: '2026-08-01', amcAmount: '1800.00', amcDoneBy: 'ARJUN M.', collectionMode: 'UPI', assignedTechnician: '', serviceDuration: '6 Month Duration', amcCollectedBy: 'SREYA' },
  { id: 'amc-004', slNo: 4, customerName: 'Suresh Patil', mobileNo: '9823001122', model: 'VEGA DLX-90', amcType: 'AMC without spare', totalServices: 3, completedServices: 2, lastServiceDate: '2026-07-08', nextServiceDate: '2026-10-08', expiryDate: '2027-01-08', status: 'active', docketNo: '100000004', amcRefNo: '1681', amcStartDate: '2026-01-08', amcAmount: '2000.00', amcDoneBy: 'DEEPA V.', collectionMode: 'Cash', assignedTechnician: 'DEEPA V.', serviceDuration: '3 Month Duration', amcCollectedBy: 'DALIA' },
  { id: 'amc-005', slNo: 5, customerName: 'Kavitha Rao', mobileNo: '9988776655', model: 'HESTIA 60', amcType: 'Non-Comprehensive AMC', totalServices: 4, completedServices: 4, lastServiceDate: '2026-05-20', nextServiceDate: '—', expiryDate: '2026-06-20', status: 'expired', docketNo: '100000005', amcRefNo: '1682', amcStartDate: '2025-06-20', amcAmount: '2500.00', amcDoneBy: 'SUNIL P.', collectionMode: 'Bank Transfer', assignedTechnician: 'SUNIL P.', serviceDuration: '3 Month Duration', amcCollectedBy: 'SREYA' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={11} /> },
  completed: { label: 'All Done', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={11} /> },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: <XCircle size={11} /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={11} /> },
  upcoming: { label: 'Upcoming', color: 'bg-purple-100 text-purple-700', icon: <Calendar size={11} /> },
};

const serviceEngineers = ['PRITAM SARKAR', 'RAJAN K.', 'ARJUN M.', 'DEEPA V.', 'SUNIL P.', 'PRIYA S.', 'KAVITHA R.'];
const amcTypeOptions = ['AMC without spare', 'AMC with spare', 'Comprehensive AMC', 'Non-Comprehensive AMC'];
const collectionModes = ['Cash', 'Online', 'Bank Transfer', 'UPI', 'Cheque'];
const serviceDurationOptions = ['3 Month Duration', '4 Month Duration', '6 Month Duration'];

export default function AMCRenewalPage() {
  const [amcList, setAmcList] = useState<AMCEntry[]>(mockAMC);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);
  const [showReminders, setShowReminders] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editEntry, setEditEntry] = useState<AMCEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editAmcType, setEditAmcType] = useState('');
  const [editTotalServices, setEditTotalServices] = useState('');
  const [editCompletedServices, setEditCompletedServices] = useState('');
  const [editLastServiceDate, setEditLastServiceDate] = useState('');
  const [editNextServiceDate, setEditNextServiceDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editAmcStartDate, setEditAmcStartDate] = useState('');
  const [editAmcAmount, setEditAmcAmount] = useState('');
  const [editAmcDoneBy, setEditAmcDoneBy] = useState('');
  const [editCollectionMode, setEditCollectionMode] = useState('');
  const [editAssignedTech, setEditAssignedTech] = useState('');
  const [editServiceDuration, setEditServiceDuration] = useState('');
  const [editAmcCollectedBy, setEditAmcCollectedBy] = useState('');
  const [editStatus, setEditStatus] = useState<AMCEntry['status']>('active');

  const completedAMCs = amcList.filter(a => a.status === 'completed' || a.status === 'expired');
  const upcomingAMCs = amcList.filter(a => a.status === 'upcoming');

  const filtered = amcList.filter(a => {
    const matchSearch = !search ||
      a.customerName.toLowerCase().includes(search.toLowerCase()) ||
      a.mobileNo.includes(search) ||
      a.docketNo.includes(search) ||
      a.amcType.toLowerCase().includes(search.toLowerCase()) ||
      a.amcRefNo.includes(search);
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openEdit = (entry: AMCEntry) => {
    setEditEntry(entry);
    setEditCustomerName(entry.customerName);
    setEditMobile(entry.mobileNo);
    setEditModel(entry.model);
    setEditAmcType(entry.amcType);
    setEditTotalServices(String(entry.totalServices));
    setEditCompletedServices(String(entry.completedServices));
    setEditLastServiceDate(entry.lastServiceDate === '—' ? '' : entry.lastServiceDate);
    setEditNextServiceDate(entry.nextServiceDate === '—' ? '' : entry.nextServiceDate);
    setEditExpiryDate(entry.expiryDate);
    setEditAmcStartDate(entry.amcStartDate);
    setEditAmcAmount(entry.amcAmount);
    setEditAmcDoneBy(entry.amcDoneBy);
    setEditCollectionMode(entry.collectionMode);
    setEditAssignedTech(entry.assignedTechnician);
    setEditServiceDuration(entry.serviceDuration);
    setEditAmcCollectedBy(entry.amcCollectedBy);
    setEditStatus(entry.status);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editEntry) return;
    setAmcList(prev => prev.map(a => a.id === editEntry.id ? {
      ...a,
      customerName: editCustomerName,
      mobileNo: editMobile,
      model: editModel,
      amcType: editAmcType,
      totalServices: Number(editTotalServices),
      completedServices: Number(editCompletedServices),
      lastServiceDate: editLastServiceDate || '—',
      nextServiceDate: editNextServiceDate || '—',
      expiryDate: editExpiryDate,
      amcStartDate: editAmcStartDate,
      amcAmount: editAmcAmount,
      amcDoneBy: editAmcDoneBy,
      collectionMode: editCollectionMode,
      assignedTechnician: editAssignedTech,
      serviceDuration: editServiceDuration,
      amcCollectedBy: editAmcCollectedBy,
      status: editStatus,
    } : a));
    setShowEditModal(false);
    setEditEntry(null);
  };

  const handleDelete = (id: string) => {
    setAmcList(prev => prev.filter(a => a.id !== id));
  };

  const handleExport = () => {
    const exportData = filtered.map(a => ({
      'Sl No': a.slNo,
      'Customer Name': a.customerName,
      'Mobile No': a.mobileNo,
      'Model': a.model,
      'AMC Type': a.amcType,
      'AMC Ref No': a.amcRefNo,
      'Docket No': a.docketNo,
      'AMC Start Date': a.amcStartDate,
      'Expiry Date': a.expiryDate,
      'Total Services': a.totalServices,
      'Completed Services': a.completedServices,
      'Last Service Date': a.lastServiceDate,
      'Next Service Date': a.nextServiceDate,
      'Status': a.status,
      'AMC Amount': a.amcAmount,
      'AMC Done By': a.amcDoneBy,
      'Collection Mode': a.collectionMode,
      'Assigned Technician': a.assignedTechnician,
      'Service Duration': a.serviceDuration,
      'Collected By': a.amcCollectedBy,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AMC Renewals');
    XLSX.writeFile(wb, `amc-renewals-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const inputCls = "w-full px-2 py-1.5 bg-input border border-border rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all";
  const selectCls = "w-full px-2 py-1.5 bg-white border border-border rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all appearance-auto";
  const labelCls = "block text-[11px] font-semibold text-foreground mb-1";

  return (
    <AppLayout title="AMC Renewal" subtitle="Track Annual Maintenance Contract services and renewal reminders">
      <div className="space-y-5">
        {/* Reminder Banner */}
        {showReminders && (completedAMCs.length > 0 || upcomingAMCs.length > 0) && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Bell size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-amber-800">AMC Reminders ({completedAMCs.length + upcomingAMCs.length})</p>
                  {completedAMCs.length > 0 && (
                    <>
                      <p className="text-[12px] text-amber-700 mt-1 font-semibold">Needs Renewal:</p>
                      <div className="mt-1 space-y-1">
                        {completedAMCs.map(a => (
                          <div key={a.id} className="flex items-center gap-2 text-[12px]">
                            <AlertTriangle size={11} className="text-amber-600 flex-shrink-0" />
                            <span className="font-semibold text-amber-800">{a.customerName}</span>
                            <span className="text-amber-600">({a.model})</span>
                            <span className="text-amber-600">— {a.amcType}</span>
                            {a.status === 'expired' && <span className="text-red-600 font-semibold">EXPIRED</span>}
                            {a.status === 'completed' && <span className="text-blue-600 font-semibold">ALL SERVICES DONE</span>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {upcomingAMCs.length > 0 && (
                    <>
                      <p className="text-[12px] text-purple-700 mt-2 font-semibold">Upcoming AMC:</p>
                      <div className="mt-1 space-y-1">
                        {upcomingAMCs.map(a => (
                          <div key={a.id} className="flex items-center gap-2 text-[12px]">
                            <Calendar size={11} className="text-purple-600 flex-shrink-0" />
                            <span className="font-semibold text-purple-800">{a.customerName}</span>
                            <span className="text-purple-600">({a.model})</span>
                            <span className="text-purple-600">— Next: {a.nextServiceDate}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button onClick={() => setShowReminders(false)} className="text-amber-600 hover:text-amber-800">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total AMC', value: amcList.length, color: 'text-primary', bg: 'bg-primary/10', filter: 'all' },
            { label: 'Active', value: amcList.filter(a => a.status === 'active').length, color: 'text-green-600', bg: 'bg-green-50', filter: 'active' },
            { label: 'Upcoming', value: amcList.filter(a => a.status === 'upcoming').length, color: 'text-purple-600', bg: 'bg-purple-50', filter: 'upcoming' },
            { label: 'Needs Renewal', value: completedAMCs.length, color: 'text-amber-600', bg: 'bg-amber-50', filter: 'completed' },
            { label: 'Expired', value: amcList.filter(a => a.status === 'expired').length, color: 'text-red-600', bg: 'bg-red-50', filter: 'expired' },
          ].map(stat => (
            <button
              key={stat.label}
              onClick={() => { setFilterStatus(filterStatus === stat.filter ? 'all' : stat.filter); setPage(1); }}
              className={`${stat.bg} rounded-xl p-4 text-left transition-all hover:shadow-md ${filterStatus === stat.filter ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
            >
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={`text-[28px] font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search AMC records…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 bg-input border border-border rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={12} className="text-muted-foreground" /></button>}
            </div>
            {filterStatus !== 'all' && (
              <button onClick={() => setFilterStatus('all')} className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-[11px] text-muted-foreground hover:bg-muted/80">
                <X size={10} /> Clear filter
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
              >
                <Download size={13} /> Export Excel
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95">
                <Plus size={13} /> Add AMC
              </button>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Sl No', 'Customer Name', 'Mobile No.', 'Model', 'AMC Type', 'AMC Ref', 'Services', 'Last Service', 'Next Service', 'Expiry Date', 'Technician', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-12 text-muted-foreground text-[13px]">No AMC records found.</td></tr>
                ) : (
                  paginated.map((entry, idx) => {
                    const st = statusConfig[entry.status];
                    const isComplete = entry.completedServices >= entry.totalServices;
                    return (
                      <tr key={entry.id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'} hover:bg-muted/40 transition-colors ${isComplete ? 'border-l-2 border-l-amber-400' : entry.status === 'upcoming' ? 'border-l-2 border-l-purple-400' : ''}`}>
                        <td className="px-3 py-3 text-[12px] text-muted-foreground">{entry.slNo}</td>
                        <td className="px-3 py-3">
                          <p className="text-[13px] font-semibold text-foreground">{entry.customerName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{entry.docketNo}</p>
                        </td>
                        <td className="px-3 py-3 text-[12px] font-mono text-foreground">{entry.mobileNo}</td>
                        <td className="px-3 py-3 text-[12px] text-foreground">{entry.model}</td>
                        <td className="px-3 py-3 text-[12px] text-foreground">{entry.amcType}</td>
                        <td className="px-3 py-3 text-[12px] font-mono font-bold text-primary">{entry.amcRefNo}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-1.5 w-16">
                              <div className={`h-1.5 rounded-full ${isComplete ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${(entry.completedServices / entry.totalServices) * 100}%` }} />
                            </div>
                            <span className={`text-[11px] font-semibold ${isComplete ? 'text-amber-600' : 'text-foreground'}`}>
                              {entry.completedServices}/{entry.totalServices}
                            </span>
                            {isComplete && <AlertTriangle size={12} className="text-amber-500" />}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-foreground whitespace-nowrap">{entry.lastServiceDate}</td>
                        <td className="px-3 py-3 text-[12px] text-foreground whitespace-nowrap">{entry.nextServiceDate}</td>
                        <td className="px-3 py-3 text-[12px] text-foreground whitespace-nowrap">{entry.expiryDate}</td>
                        <td className="px-3 py-3 text-[12px] text-foreground">{entry.assignedTechnician || <span className="text-muted-foreground italic">Unassigned</span>}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
                            {st.icon}{st.label}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button title="Edit AMC" onClick={() => openEdit(entry)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-warning/10 text-muted-foreground hover:text-warning transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button title="Delete" onClick={() => handleDelete(entry.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                              <Trash2 size={13} />
                            </button>
                            {isComplete && (
                              <button title="Renew AMC" className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold hover:bg-amber-200 transition-colors">
                                <RefreshCw size={10} /> Renew
                              </button>
                            )}
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
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit AMC Modal */}
      {showEditModal && editEntry && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 my-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-[#4a7fa5] text-white rounded-t-lg">
              <span className="text-sm font-bold">✏️ EDIT AMC DETAILS — {editEntry.customerName}</span>
              <button onClick={() => setShowEditModal(false)} className="hover:bg-white/20 rounded p-1 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Customer & Product */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Customer Name</label>
                  <input value={editCustomerName} onChange={e => setEditCustomerName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mobile No.</label>
                  <input value={editMobile} onChange={e => setEditMobile(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Model</label>
                  <input value={editModel} onChange={e => setEditModel(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* AMC Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>AMC Type</label>
                  <select value={editAmcType} onChange={e => setEditAmcType(e.target.value)} className={selectCls}>
                    {amcTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Service Duration</label>
                  <select value={editServiceDuration} onChange={e => setEditServiceDuration(e.target.value)} className={selectCls}>
                    {serviceDurationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>AMC Amount (₹)</label>
                  <input type="number" value={editAmcAmount} onChange={e => setEditAmcAmount(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>AMC Start Date</label>
                  <input type="date" value={editAmcStartDate} onChange={e => setEditAmcStartDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Last Service Date</label>
                  <input type="date" value={editLastServiceDate} onChange={e => setEditLastServiceDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Next Service Date</label>
                  <input type="date" value={editNextServiceDate} onChange={e => setEditNextServiceDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Expiry Date</label>
                  <input type="date" value={editExpiryDate} onChange={e => setEditExpiryDate(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Services Count */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Total No. of Services</label>
                  <input type="number" value={editTotalServices} onChange={e => setEditTotalServices(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Completed Services</label>
                  <input type="number" value={editCompletedServices} onChange={e => setEditCompletedServices(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Collection Mode</label>
                  <select value={editCollectionMode} onChange={e => setEditCollectionMode(e.target.value)} className={selectCls}>
                    {collectionModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value as AMCEntry['status'])} className={selectCls}>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Personnel */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Assign Technician</label>
                  <select value={editAssignedTech} onChange={e => setEditAssignedTech(e.target.value)} className={selectCls}>
                    <option value="">-- Unassigned --</option>
                    {serviceEngineers.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>AMC Done By</label>
                  <input value={editAmcDoneBy} onChange={e => setEditAmcDoneBy(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Collected By</label>
                  <input value={editAmcCollectedBy} onChange={e => setEditAmcCollectedBy(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* AMC Ref (read-only) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>AMC Ref No. (Auto)</label>
                  <input value={editEntry.amcRefNo} readOnly className={`${inputCls} bg-gray-100 font-mono font-bold`} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4 pt-3 border-t border-border">
                <button onClick={handleSaveEdit} className="px-8 py-2.5 bg-cyan-500 text-white rounded font-semibold text-[13px] hover:bg-cyan-600 transition-all active:scale-95">
                  SAVE CHANGES
                </button>
                <button onClick={() => setShowEditModal(false)} className="px-8 py-2.5 bg-red-500 text-white rounded font-semibold text-[13px] hover:bg-red-600 transition-all active:scale-95">
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
