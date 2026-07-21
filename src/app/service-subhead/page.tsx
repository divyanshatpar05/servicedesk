'use client';
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus, Printer, FileText, FileSpreadsheet, X, Check, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Service {
  id: number;
  name: string;
  amount: number;
}

const INITIAL_SERVICES: Service[] = [
  { id: 1, name: 'INSTALLATION CHARGES', amount: 699.00 },
  { id: 2, name: 'AMC-SERVICE CHARGES ( WITHOUT SPARE )', amount: 1999.00 },
  { id: 3, name: 'RE- INSTALLATION CHARGES', amount: 699.00 },
  { id: 4, name: 'COMPLAIN ATTEND CHARGES', amount: 499.00 },
  { id: 5, name: 'AMC SERVICE CHARGES ( WITH SPARE )', amount: 2999.00 },
  { id: 6, name: 'PIPE-FITTINGS CHARGES', amount: 499.00 },
  { id: 7, name: 'INSPECTION-CHARGES', amount: 299.00 },
  { id: 8, name: 'PAID SERVICE ( NORMAL CLEANING )', amount: 799.00 },
  { id: 9, name: 'AMC PAYMENT COLLECTION ( OFFICE )', amount: 1999.00 },
  { id: 10, name: 'AMC PAYEMNT COLLECTION ( DIRECT )', amount: 1999.00 },
  { id: 11, name: 'FREE SERVICE ( WARRANTY )', amount: 1.00 },
  { id: 12, name: 'DISPLAY CHARGES', amount: 1.00 },
  { id: 13, name: 'COMPLAIN ATTEND ( IW ) & INCUDING ALL', amount: 1.00 },
  { id: 14, name: 'ASC DRY SERVICE', amount: 1.00 },
  { id: 15, name: 'ASC COMPLAIN ATTEND', amount: 299.00 },
  { id: 16, name: 'CHIMNEY DISMENTAL CHARGES', amount: 699.00 },
  { id: 17, name: 'NEW ASC COLLETION', amount: 2000.00 },
  { id: 18, name: 'MODULAR KITCHEN INSPECTION & SERVICE CH', amount: 500.00 },
  { id: 19, name: 'PAID SERVICE ( DEEP CLEANING )', amount: 1500.00 },
  { id: 20, name: 'DISPLAY', amount: 0.00 },
  { id: 21, name: 'BAP ( PVC PIPE ADJUSTED )', amount: 1500.00 },
  { id: 22, name: 'SAP ( PVC PIPE ADJUSTED )', amount: 1200.00 },
  { id: 23, name: 'SPARE CHANGE ( INCLUDING ALL )', amount: 499.00 },
  { id: 24, name: 'ASC SERVICE & COMPLAIN ATTEND', amount: 499.00 },
  { id: 25, name: 'ASC SERVICE & SPARE FITTINGS', amount: 299.00 },
  { id: 26, name: 'ASC DEEP CLEAN SERVICE', amount: 1.00 },
  { id: 27, name: 'PAID SERVICE', amount: 799.00 },
  { id: 28, name: 'AMC SERVICE CHARGES ( NORMAL + OPEN ) WITHOUT SPARE', amount: 2399.00 },
];

type SortField = 'name' | 'amount';
type SortDir = 'asc' | 'desc';

export default function ServiceSubheadPage() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...services];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.amount.toString().includes(q));
    }
    if (sortField) {
      list.sort((a, b) => {
        const va = sortField === 'name' ? a.name : a.amount;
        const vb = sortField === 'name' ? b.name : b.amount;
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [services, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditAmount(s.amount.toString());
  };

  const saveEdit = () => {
    setServices(prev => prev.map(s => s.id === editingId ? { ...s, name: editName, amount: parseFloat(editAmount) || 0 } : s));
    setEditingId(null);
  };

  const deleteService = (id: number) => {
    if (confirm('Delete this service?')) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const addService = () => {
    if (!newName.trim()) return;
    const maxId = services.reduce((m, s) => Math.max(m, s.id), 0);
    setServices(prev => [...prev, { id: maxId + 1, name: newName.trim().toUpperCase(), amount: parseFloat(newAmount) || 0 }]);
    setNewName('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const handlePrint = () => window.print();

  const handleCSV = () => {
    const rows = [['Sl No', 'Service Name', 'Service Amount'], ...services.map((s, i) => [i + 1, s.name, s.amount.toFixed(2)])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'services.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExcel = () => {
    const exportData = services.map((s, i) => ({
      'Sl No': i + 1,
      'Service Name': s.name,
      'Service Amount (₹)': s.amount.toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Services');
    XLSX.writeFile(wb, `service-subhead-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col ml-1 opacity-50">
      <ChevronUp size={10} className={sortField === field && sortDir === 'asc' ? 'opacity-100 text-blue-700' : ''} />
      <ChevronDown size={10} className={sortField === field && sortDir === 'desc' ? 'opacity-100 text-blue-700' : ''} />
    </span>
  );

  return (
    <AppLayout title="Service Subhead Creation" subtitle="Manage service names and pricing">
      {/* Header bar */}
      <div className="bg-[#2d6a8a] text-white rounded-t-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <span className="font-bold text-[15px] tracking-wide">SERVICE SUBHEAD CREATION RECORD STATUS</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
            <Printer size={13} /> Print
          </button>
          <button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
            <FileText size={13} /> PDF
          </button>
          <button onClick={handleCSV} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
            <FileSpreadsheet size={13} /> CSV
          </button>
          <button onClick={handleExcel} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
            <Download size={13} /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4">
        {/* Controls row */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <select
              value={entriesPerPage}
              onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-[13px] text-gray-600">entries</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="ml-3 flex items-center gap-1.5 bg-[#2d6a8a] text-white text-[12px] font-semibold px-3 py-1.5 rounded hover:bg-[#245a78] transition-colors"
            >
              <Plus size={13} /> Add Service
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-600">Search:</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded px-2 py-1 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400 w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left px-4 py-3 font-bold text-gray-700 w-24">Sl No.</th>
                <th className="text-left px-4 py-3 font-bold text-gray-700 cursor-pointer select-none" onClick={() => handleSort('name')}>
                  Service Name <SortIcon field="name" />
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700 cursor-pointer select-none w-48" onClick={() => handleSort('amount')}>
                  Service Amount <SortIcon field="amount" />
                </th>
                <th className="text-center px-4 py-3 font-bold text-gray-700 w-20">Edit</th>
                <th className="text-center px-4 py-3 font-bold text-gray-700 w-20">Delete</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No services found</td></tr>
              ) : paginated.map((s, idx) => (
                <tr key={s.id} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-blue-50/30 transition-colors`}>
                  <td className="px-4 py-3 text-gray-600">{startEntry + idx}</td>
                  <td className="px-4 py-3">
                    {editingId === s.id ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="border border-blue-400 rounded px-2 py-1 text-[13px] w-full focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    ) : s.name}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === s.id ? (
                      <input value={editAmount} onChange={e => setEditAmount(e.target.value)} type="number" step="0.01" className="border border-blue-400 rounded px-2 py-1 text-[13px] w-28 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    ) : s.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === s.id ? (
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-800 transition-colors">
                        <Check size={16} />
                      </button>
                    ) : (
                      <button onClick={() => startEdit(s)} className="text-[#2d6a8a] hover:text-[#1a4a62] transition-colors">
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === s.id ? (
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={16} />
                      </button>
                    ) : (
                      <button onClick={() => deleteService(s.id)} className="text-[#2d6a8a] hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <span className="text-[13px] text-gray-600">
            {filtered.length === 0 ? 'No entries' : `Showing ${startEntry} to ${endEntry} of ${filtered.length} entries`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-[12px]"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center border rounded text-[12px] font-semibold transition-colors ${currentPage === p ? 'bg-[#2d6a8a] text-white border-[#2d6a8a]' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
              >{p}</button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-[12px]"
            >›</button>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Add New Service</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Service Name *</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Enter service name"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Service Amount (₹)</label>
                <input
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addService} className="flex-1 bg-[#2d6a8a] text-white font-semibold py-2 rounded hover:bg-[#245a78] transition-colors text-[13px]">Save</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded hover:bg-gray-200 transition-colors text-[13px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
