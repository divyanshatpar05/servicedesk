'use client';
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus, Printer, FileText, FileSpreadsheet, X, Check } from 'lucide-react';

interface UserGroup {
  id: number;
  name: string;
  active: boolean;
}

const INITIAL_GROUPS: UserGroup[] = [
  { id: 1, name: 'Project-Admin', active: true },
  { id: 2, name: 'Admin', active: true },
  { id: 3, name: 'Service Engineer', active: true },
  { id: 4, name: 'FRONT OFFICE', active: true },
  { id: 5, name: 'CUSTOMER CARE DALIA', active: true },
  { id: 6, name: 'MOHUA DAS ( SERVICE EXECUTIVE', active: true },
  { id: 7, name: 'SWARNALI MAJHI ( INSTALL EXECUTIVE', active: true },
  { id: 8, name: 'KEYA ( TELECALLER', active: true },
  { id: 9, name: 'SERVICE', active: true },
  { id: 10, name: 'INSTALLATION', active: true },
  { id: 11, name: 'TELECALLER', active: true },
  { id: 12, name: 'SALES EXECUTIVE', active: false },
  { id: 13, name: 'BACK OFFICE', active: true },
  { id: 14, name: 'MANAGER', active: true },
];

type SortField = 'name' | 'active';
type SortDir = 'asc' | 'desc';

export default function UserGroupManagePage() {
  const [groups, setGroups] = useState<UserGroup[]>(INITIAL_GROUPS);
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...groups];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(g => g.name.toLowerCase().includes(q));
    }
    if (sortField) {
      list.sort((a, b) => {
        const va = sortField === 'name' ? a.name : (a.active ? 1 : 0);
        const vb = sortField === 'name' ? b.name : (b.active ? 1 : 0);
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [groups, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  const startEntry = filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, filtered.length);

  const startEdit = (g: UserGroup) => { setEditingId(g.id); setEditName(g.name); };
  const saveEdit = () => {
    setGroups(prev => prev.map(g => g.id === editingId ? { ...g, name: editName } : g));
    setEditingId(null);
  };
  const toggleActive = (id: number) => setGroups(prev => prev.map(g => g.id === id ? { ...g, active: !g.active } : g));
  const deleteGroup = (id: number) => { if (confirm('Delete this user group?')) setGroups(prev => prev.filter(g => g.id !== id)); };
  const addGroup = () => {
    if (!newName.trim()) return;
    const maxId = groups.reduce((m, g) => Math.max(m, g.id), 0);
    setGroups(prev => [...prev, { id: maxId + 1, name: newName.trim(), active: true }]);
    setNewName(''); setShowAddModal(false);
  };

  const handleCSV = () => {
    const rows = [['Sl No', 'User Group Name', 'Active'], ...groups.map((g, i) => [i + 1, g.name, g.active ? 'YES' : 'NO'])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'user-groups.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col ml-1 opacity-50">
      <ChevronUp size={10} className={sortField === field && sortDir === 'asc' ? 'opacity-100 text-blue-700' : ''} />
      <ChevronDown size={10} className={sortField === field && sortDir === 'desc' ? 'opacity-100 text-blue-700' : ''} />
    </span>
  );

  return (
    <AppLayout title="User Group Manage" subtitle="Manage user groups and access levels">
      {/* Header bar */}
      <div className="bg-[#2d6a8a] text-white rounded-t-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <span className="font-bold text-[15px] tracking-wide">USER GROUP MANAGE RECORD STATUS</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
            <Printer size={13} /> Print
          </button>
          <button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
            <FileText size={13} /> PDF
          </button>
          <button onClick={handleCSV} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[12px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
            <FileSpreadsheet size={13} /> CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4">
        {/* Controls */}
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
              <Plus size={13} /> Add Group
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
                  User Group Name <SortIcon field="name" />
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700 cursor-pointer select-none w-36" onClick={() => handleSort('active')}>
                  Active <SortIcon field="active" />
                </th>
                <th className="text-center px-4 py-3 font-bold text-gray-700 w-20">Edit</th>
                <th className="text-center px-4 py-3 font-bold text-gray-700 w-20">Delete</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No groups found</td></tr>
              ) : paginated.map((g, idx) => (
                <tr key={g.id} className={`border-b border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''} hover:bg-blue-50/30 transition-colors`}>
                  <td className="px-4 py-3 text-gray-600">{startEntry + idx}</td>
                  <td className="px-4 py-3">
                    {editingId === g.id ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="border border-blue-400 rounded px-2 py-1 text-[13px] w-full focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    ) : g.name}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(g.id)} className="focus:outline-none">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-[12px] font-bold ${g.active ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {g.active ? 'YES' : 'NO'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === g.id ? (
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-800 transition-colors"><Check size={16} /></button>
                    ) : (
                      <button onClick={() => startEdit(g)} className="text-[#2d6a8a] hover:text-[#1a4a62] transition-colors"><Pencil size={16} /></button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingId === g.id ? (
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
                    ) : (
                      <button onClick={() => deleteGroup(g.id)} className="text-[#2d6a8a] hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
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
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-[12px]">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center border rounded text-[12px] font-semibold transition-colors ${currentPage === p ? 'bg-[#2d6a8a] text-white border-[#2d6a8a]' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-[12px]">›</button>
          </div>
        </div>
      </div>

      {/* Add Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Add New User Group</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">Group Name *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter group name" className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addGroup} className="flex-1 bg-[#2d6a8a] text-white font-semibold py-2 rounded hover:bg-[#245a78] transition-colors text-[13px]">Save</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded hover:bg-gray-200 transition-colors text-[13px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
