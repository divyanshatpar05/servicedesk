'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Trash2, X, Package, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SpareInwardItem {
  id: string;
  slNo: number;
  spareName: string;
  qty: number;
  rate: number;
  total: number;
}

interface SpareInwardRecord {
  id: string;
  refNo: number;
  adjustmentNote: string;
  date: string;
  time: string;
  items: SpareInwardItem[];
  spareTotal: number;
  createdAt: string;
}

const STORAGE_KEY_INWARD = 'spareInwardRecords';
const STORAGE_KEY_MASTER = 'masterSetupData';

function getNextRefNo(records: SpareInwardRecord[]): number {
  if (records.length === 0) return 249;
  return Math.max(...records.map(r => r.refNo)) + 1;
}

function getSpareNames(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MASTER);
    if (stored) {
      const parsed = JSON.parse(stored);
      return (parsed.spareNames || []).map((s: { value: string }) => s.value);
    }
  } catch { }
  return ['Filter', 'Motor', 'PCB Board', 'Compressor', 'Fan Blade', 'Capacitor', 'Thermostat', 'Pump', 'Valve', 'Seal Kit'];
}

function getTodayDate(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getCurrentTime(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

export default function SpareInwardPage() {
  const [records, setRecords] = useState<SpareInwardRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [refNo, setRefNo] = useState(249);
  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState(getCurrentTime());
  const [items, setItems] = useState<SpareInwardItem[]>([
    { id: '1', slNo: 1, spareName: '', qty: 0, rate: 0, total: 0 },
  ]);
  const [spareNames, setSpareNames] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INWARD);
      if (stored) setRecords(JSON.parse(stored));
    } catch { }
    setSpareNames(getSpareNames());
  }, []);

  useEffect(() => {
    if (showForm) {
      setRefNo(getNextRefNo(records));
      setDate(getTodayDate());
      setTime(getCurrentTime());
    }
  }, [showForm, records]);

  const updateItem = (id: string, field: keyof SpareInwardItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'rate') {
        updated.total = parseFloat((updated.qty * updated.rate).toFixed(2));
      }
      return updated;
    }));
  };

  const addRow = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), slNo: prev.length + 1, spareName: '', qty: 0, rate: 0, total: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id).map((i, idx) => ({ ...i, slNo: idx + 1 })));
  };

  const spareTotal = items.reduce((sum, i) => sum + i.total, 0);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  const handleSave = () => {
    const record: SpareInwardRecord = {
      id: Date.now().toString(),
      refNo,
      adjustmentNote,
      date,
      time,
      items: items.filter(i => i.spareName),
      spareTotal,
      createdAt: new Date().toISOString(),
    };
    const updated = [...records, record];
    setRecords(updated);
    try { localStorage.setItem(STORAGE_KEY_INWARD, JSON.stringify(updated)); } catch { }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setAdjustmentNote('');
    setItems([{ id: '1', slNo: 1, spareName: '', qty: 0, rate: 0, total: 0 }]);
  };

  const handleDelete = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    try { localStorage.setItem(STORAGE_KEY_INWARD, JSON.stringify(updated)); } catch { }
  };

  const handleExport = () => {
    const exportData: Record<string, string | number>[] = [];
    records.forEach(r => {
      r.items.forEach(item => {
        exportData.push({
          'Ref No': r.refNo,
          'Date': r.date,
          'Time': r.time,
          'Adjustment Note': r.adjustmentNote,
          'Spare Name': item.spareName,
          'Qty': item.qty,
          'Rate (₹)': item.rate,
          'Total (₹)': item.total,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Inward');
    XLSX.writeFile(wb, `spare-inward-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AppLayout title="Spare Inward" subtitle="Record incoming spare parts stock">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-primary" />
            <span className="text-[14px] font-semibold text-foreground">{records.length} Inward Records</span>
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <Download size={13} /> Export Excel
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
            >
              <Plus size={14} /> New Inward Entry
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Ref No</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date & Time</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Adjustment Note</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Items</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total (₹)</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No inward records yet. Click "New Inward Entry" to add stock.
                  </td>
                </tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{r.refNo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.date} {r.time}</td>
                    <td className="px-4 py-3">{r.adjustmentNote || '—'}</td>
                    <td className="px-4 py-3 text-right">{r.items.length}</td>
                    <td className="px-4 py-3 text-right font-semibold">₹{r.spareTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(r.id)} className="text-danger hover:text-danger/80 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spare Inward Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto py-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#4a7fa5] text-white rounded-t-lg">
              <span className="text-sm font-bold flex items-center gap-2">🎁 SPARE INWARD</span>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="hover:bg-white/20 rounded p-1">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {/* Top Row */}
              <div className="flex items-start gap-6 mb-5">
                <div className="flex-1">
                  <label className="block text-[13px] font-bold text-foreground mb-1.5">Adjustment Note</label>
                  <input
                    type="text"
                    value={adjustmentNote}
                    onChange={e => setAdjustmentNote(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-red-400 rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-red-300"
                    placeholder="Enter adjustment note"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-foreground mb-1.5">Ref No & Date</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={refNo}
                        readOnly
                        className="w-20 px-3 py-2.5 border border-border rounded text-[13px] bg-gray-50 font-mono font-bold"
                      />
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="px-3 py-2.5 border border-border rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="px-3 py-2.5 border border-border rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-green-400 rounded overflow-hidden mb-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-300">
                      <th className="text-left px-3 py-2.5 font-bold border-r border-green-400 w-16">Sl No</th>
                      <th className="text-left px-3 py-2.5 font-bold border-r border-green-400">Spares And Accessories</th>
                      <th className="text-center px-3 py-2.5 font-bold border-r border-green-400 w-24">Qty</th>
                      <th className="text-center px-3 py-2.5 font-bold border-r border-green-400 w-28">Rate</th>
                      <th className="text-center px-3 py-2.5 font-bold border-r border-green-400 w-28">Total</th>
                      <th className="text-center px-3 py-2.5 font-bold bg-[#c0392b] text-white w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-t border-green-400">
                        <td className="px-3 py-2 border-r border-green-400 text-center text-muted-foreground">{item.slNo}.</td>
                        <td className="px-3 py-2 border-r border-green-400">
                          <select
                            value={item.spareName}
                            onChange={e => updateItem(item.id, 'spareName', e.target.value)}
                            className="w-full bg-transparent text-[13px] focus:outline-none"
                          >
                            <option value="">Enter Spare Name</option>
                            {spareNames.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2 border-r border-green-400">
                          <input
                            type="number"
                            value={item.qty || ''}
                            onChange={e => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                            className="w-full text-center bg-transparent text-[13px] focus:outline-none"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-green-400">
                          <input
                            type="number"
                            value={item.rate || ''}
                            onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full text-center bg-blue-50 text-[13px] focus:outline-none"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-3 py-2 border-r border-green-400 text-center bg-blue-50 font-medium">
                          {item.total.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            onChange={() => removeRow(item.id)}
                            className="w-4 h-4 cursor-pointer"
                            title="Remove row"
                          />
                        </td>
                      </tr>
                    ))}
                    {/* Spare Total Row */}
                    <tr className="border-t border-green-400 bg-[#f5f0e8]">
                      <td colSpan={2} className="px-3 py-2.5 font-bold border-r border-green-400">Spare Total</td>
                      <td className="px-3 py-2.5 text-center border-r border-green-400 font-bold bg-blue-50">{totalQty.toFixed(2)}</td>
                      <td className="px-3 py-2.5 border-r border-green-400"></td>
                      <td className="px-3 py-2.5 text-center font-bold bg-blue-50">{spareTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-primary border border-primary rounded hover:bg-primary/5 transition-colors mb-4"
              >
                <Plus size={13} /> Add Row
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-4 px-6 py-4 bg-gray-50 border-t border-border rounded-b-lg">
              <button
                onClick={handleSave}
                className="px-10 py-2.5 bg-[#4a9fb5] text-white rounded font-bold text-[13px] hover:bg-[#3a8fa5] transition-colors"
              >
                SAVE
              </button>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-10 py-2.5 bg-[#c0392b] text-white rounded font-bold text-[13px] hover:bg-[#a93226] transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
