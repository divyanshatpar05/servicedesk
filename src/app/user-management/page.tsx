'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, Shield, Eye, EyeOff, Activity, Clock, User, Copy, Check, Plus, Pencil, Trash2, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface UserAccount {
  id: string;
  userGroup: string;
  userName: string;
  userId: string;
  password: string;
  editPermission: 'YES' | 'NO';
  deletePermission: 'YES' | 'NO';
  backDateEntry: 'YES' | 'NO';
  userActive: 'YES' | 'NO';
  photo?: string;
  role: 'admin' | 'user';
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  actionType: string;
  actionDescription: string;
  createdAt: string;
}

const USER_GROUPS = [
  'Project-Admin', 'Admin', 'Service Engineer', 'FRONT OFFICE',
  'CUSTOMER CARE DALIA', 'MOHUA DAS ( SERVICE EXECUTIVE', 'SWARNALI MAJHI ( INSTALL EXECUTIVE',
  'KEYA ( TELECALLER', 'SERVICE', 'INSTALLATION', 'TELECALLER', 'SALES EXECUTIVE', 'BACK OFFICE', 'MANAGER'
];

const INITIAL_USERS: UserAccount[] = [
  { id: 'admin-1', userGroup: 'Project-Admin', userName: 'Admin', userId: 'admin', password: 'Admin@2026', editPermission: 'YES', deletePermission: 'YES', backDateEntry: 'YES', userActive: 'YES', role: 'admin' },
  { id: 'user-01', userGroup: 'FRONT OFFICE', userName: 'User 01', userId: 'user01', password: 'User01@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-02', userGroup: 'FRONT OFFICE', userName: 'User 02', userId: 'user02', password: 'User02@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-03', userGroup: 'Service Engineer', userName: 'User 03', userId: 'user03', password: 'User03@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-04', userGroup: 'Service Engineer', userName: 'User 04', userId: 'user04', password: 'User04@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-05', userGroup: 'CUSTOMER CARE DALIA', userName: 'User 05', userId: 'user05', password: 'User05@2026', editPermission: 'NO', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-06', userGroup: 'CUSTOMER CARE DALIA', userName: 'User 06', userId: 'user06', password: 'User06@2026', editPermission: 'NO', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-07', userGroup: 'INSTALLATION', userName: 'User 07', userId: 'user07', password: 'User07@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-08', userGroup: 'INSTALLATION', userName: 'User 08', userId: 'user08', password: 'User08@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-09', userGroup: 'SERVICE', userName: 'User 09', userId: 'user09', password: 'User09@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
  { id: 'user-10', userGroup: 'SERVICE', userName: 'User 10', userId: 'user10', password: 'User10@2026', editPermission: 'YES', deletePermission: 'NO', backDateEntry: 'NO', userActive: 'YES', role: 'user' },
];

const ACTIVITY_STORAGE_KEY = 'activityLog';

function getSampleLogs(): ActivityLog[] {
  return [
    { id: 'log-1', userId: 'admin-1', userName: 'Admin', actionType: 'CREATE', actionDescription: 'Created new docket #100000001 for customer Priya Sharma', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'log-2', userId: 'user-01', userName: 'User 01', actionType: 'EDIT', actionDescription: 'Updated docket #100000001 — changed status to COMPLETED', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'log-3', userId: 'user-02', userName: 'User 02', actionType: 'ALLOTMENT', actionDescription: 'Allotted technician PRITAM SARKAR to docket #100000002', createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: 'log-4', userId: 'admin-1', userName: 'Admin', actionType: 'INVOICE', actionDescription: 'Generated invoice for docket #100000003 — Amount ₹1500', createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: 'log-5', userId: 'user-03', userName: 'User 03', actionType: 'CREATE', actionDescription: 'Created new docket #100000004 for customer Amit Bose', createdAt: new Date(Date.now() - 18000000).toISOString() },
  ];
}

const emptyForm = (): Omit<UserAccount, 'id' | 'role'> => ({
  userGroup: '',
  userName: '',
  userId: '',
  password: '',
  editPermission: 'YES',
  deletePermission: 'YES',
  backDateEntry: 'NO',
  userActive: 'YES',
  photo: undefined,
});

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [logs] = useState<ActivityLog[]>(getSampleLogs());
  const [copied, setCopied] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const togglePassword = (id: string) => setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const openAdd = () => {
    setEditingUser(null);
    setForm(emptyForm());
    setPhotoPreview(null);
    setShowForm(true);
  };

  const openEdit = (u: UserAccount) => {
    setEditingUser(u);
    setForm({ userGroup: u.userGroup, userName: u.userName, userId: u.userId, password: u.password, editPermission: u.editPermission, deletePermission: u.deletePermission, backDateEntry: u.backDateEntry, userActive: u.userActive, photo: u.photo });
    setPhotoPreview(u.photo || null);
    setShowForm(true);
  };

  const deleteUser = (id: string) => {
    if (id === 'admin-1') { alert('Cannot delete the main admin account.'); return; }
    if (confirm('Delete this user?')) setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveForm = () => {
    if (!form.userName.trim()) { alert('User Name is required.'); return; }
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form, photo: photoPreview || undefined } : u));
    } else {
      const newId = `user-${Date.now()}`;
      setUsers(prev => [...prev, { id: newId, ...form, photo: photoPreview || undefined, role: 'user' }]);
    }
    setShowForm(false);
  };

  const handleExport = () => {
    const exportData = users.map((u, idx) => ({
      'Sl No': idx + 1,
      'User Group': u.userGroup,
      'User Name': u.userName,
      'User ID': u.userId,
      'Status': u.status,
      'Last Login': u.lastLogin,
      'Created At': u.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `user-management-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const ACTION_COLORS: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    EDIT: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
    ALLOTMENT: 'bg-blue-100 text-blue-700',
    INVOICE: 'bg-purple-100 text-purple-700',
    LOGIN: 'bg-gray-100 text-gray-600',
  };

  return (
    <AppLayout title="User Management" subtitle="Manage users, permissions and activity log">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-muted/30 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${activeTab === 'users' ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          <Users size={15} /> User Accounts
        </button>
        <button onClick={() => setActiveTab('activity')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${activeTab === 'activity' ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          <Activity size={15} /> Activity Log
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{logs.length}</span>
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground border border-border px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Download size={14} /> Export Excel
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-[#2d6a8a] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#245a78] transition-colors">
              <Plus size={14} /> Add User
            </button>
          </div>

          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              <span className="text-[14px] font-bold text-foreground">All Users ({users.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">#</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">User ID</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Group</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Password</th>
                    <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Edit Perm</th>
                    <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Del Perm</th>
                    <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Active</th>
                    <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {u.photo ? (
                            <img src={u.photo} alt={u.userName} className="w-7 h-7 rounded-full object-cover border border-border" />
                          ) : (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 ${u.role === 'admin' ? 'bg-primary' : 'bg-muted-foreground/50'}`}>
                              {u.userName.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold">{u.userName}</span>
                          {u.role === 'admin' && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-muted-foreground">{u.userId}</td>
                      <td className="px-3 py-3 text-muted-foreground">{u.userGroup}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono">{showPasswords[u.id] ? u.password : '••••••••'}</span>
                          <button onClick={() => togglePassword(u.id)} className="text-muted-foreground hover:text-foreground ml-1">
                            {showPasswords[u.id] ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${u.editPermission === 'YES' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>{u.editPermission}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${u.deletePermission === 'YES' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>{u.deletePermission}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${u.userActive === 'YES' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.userActive}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(u)} className="text-[#2d6a8a] hover:text-[#1a4a62] transition-colors" title="Edit"><Pencil size={13} /></button>
                          <button onClick={() => copyToClipboard(`${u.userId} / ${u.password}`, u.id)} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy credentials">
                            {copied === u.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                          </button>
                          <button onClick={() => deleteUser(u.id)} className="text-muted-foreground hover:text-red-600 transition-colors" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            <span className="text-[14px] font-bold text-foreground">Activity Log — All User Actions</span>
            <span className="ml-auto text-[11px] text-muted-foreground">{logs.length} total entries</span>
          </div>
          <div className="divide-y divide-border">
            {logs.map(log => (
              <div key={log.id} className="px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] flex-shrink-0 mt-0.5">
                    {log.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-foreground">{log.userName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${ACTION_COLORS[log.actionType] || 'bg-gray-100 text-gray-600'}`}>{log.actionType}</span>
                    </div>
                    <p className="text-[12px] text-foreground mt-0.5">{log.actionDescription}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={11} className="text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Manage Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#2d6a8a] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-bold text-[14px]">USER MANAGE</span>
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="p-6">
              {/* Row 1: User Group, User Name, User Id, User Password */}
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">User Group</label>
                  <select value={form.userGroup} onChange={e => setForm(f => ({ ...f, userGroup: e.target.value }))} className="w-full border border-gray-300 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option value="">Select User Group</option>
                    {USER_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">User Name</label>
                  <input
                    value={form.userName}
                    onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
                    className="w-full border-2 border-red-400 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-red-400"
                    placeholder=""
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">User Id</label>
                  <input value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} className="w-full border border-gray-300 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">User Password</label>
                  <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} type="text" className="w-full border border-gray-300 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
              </div>

              {/* Row 2: Edit Permission, Delete Permission, User Photo */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">Edit Permission</label>
                  <select value={form.editPermission} onChange={e => setForm(f => ({ ...f, editPermission: e.target.value as 'YES' | 'NO' }))} className="w-full border border-gray-300 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">Delete Permission</label>
                  <select value={form.deletePermission} onChange={e => setForm(f => ({ ...f, deletePermission: e.target.value as 'YES' | 'NO' }))} className="w-full border border-gray-300 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div className="row-span-2">
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">User Photo <span className="text-gray-400 font-normal">[ * width 80px height 60px ]</span></label>
                  <div className="border-2 border-orange-400 rounded overflow-hidden mb-2">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-[12px] px-2 py-1.5 bg-gray-100 cursor-pointer" />
                  </div>
                  <div className="border border-gray-300 rounded w-20 h-16 flex items-center justify-center bg-gray-700 overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="User photo preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Back Date Entry, User Active */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">Back Date Entry</label>
                  <select value={form.backDateEntry} onChange={e => setForm(f => ({ ...f, backDateEntry: e.target.value as 'YES' | 'NO' }))} className="w-full border border-gray-300 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">User Active</label>
                  <select value={form.userActive} onChange={e => setForm(f => ({ ...f, userActive: e.target.value as 'YES' | 'NO' }))} className="w-full border border-gray-300 rounded px-2 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400">
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                <button onClick={saveForm} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-10 py-2.5 rounded text-[13px] tracking-widest transition-colors">SAVE</button>
                <button onClick={() => setShowForm(false)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-2.5 rounded text-[13px] tracking-widest transition-colors">CANCEL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
