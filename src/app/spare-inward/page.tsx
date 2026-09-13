'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Trash2, X, Package, Download, Loader2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

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

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

function getNextRefNo(records: SpareInwardRecord[]): number {
  if (records.length === 0) return 249;
  return Math.max(...records.map(r => r.refNo)) + 1;
}

export default function SpareInwardPage() {
  const [records, setRecords] = useState<SpareInwardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [refNo, setRefNo] = useState(249);
  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState(getCurrentTime());
  const [items, setItems] = useState<SpareInwardItem[]>([
    { id: '1', slNo: 1, spareName: '', qty: 0, rate: 0, total: 0 },
  ]);
  const [spareNames, setSpareNames] = useState<string[]>([]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: inwards, error: inwardError } = await supabase
        .from('spare_inward')
        .select('*, spare_inward_items(*)')
        .order('inward_date', { ascending: false });
      if (inwardError) throw inwardError;

      // Fetch spare names from master_setup
      const { data: masterData } = await supabase
        .from('master_setup')
        .select('value')
        .eq('category', 'spareNames');
      if (masterData && masterData.length > 0) {
        setSpareNames(masterData.map((m: { value: string }) => m.value));
      }

      const mapped: SpareInwardRecord[] = (inwards || []).map((r: Record<string, unknown>) => {
        const rawItems = (r.spare_inward_items as Record<string, unknown>[] || []);
        return {
          id: String(r.id),
          refNo: Number(r.ref_no),
          adjustmentNote: String(r.adjustment_note || ''),
          date: String(r.inward_date || ''),
          time: String(r.inward_time || '').slice(0, 5),
          spareTotal: Number(r.spare_total || 0),
          createdAt: String(r.created_at || ''),
          items: rawItems.map((item, idx) => ({
            id: String(item.id),
            slNo: Number(item.sl_no || idx + 1),
            spareName: String(item.spare_name || ''),
            qty: Number(item.qty || 0),
            rate: Number(item.rate || 0),
            total: Number(item.total || 0),
          })),
        };
      });
      setRecords(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load spare inward records';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

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

  const handleSave = async () => {
    const validItems = items.filter(i => i.spareName);
    if (validItems.length === 0) {
      toast.error('Please add at least one spare item');
      return;
    }
    try {
      const supabase = createClient();
      const { data: inwardData, error: inwardError } = await supabase
        .from('spare_inward')
        .insert({
          ref_no: refNo,
          adjustment_note: adjustmentNote,
          inward_date: date,
          inward_time: time,
          spare_total: spareTotal,
        })
        .select()
        .single();
      if (inwardError) throw inwardError;

      const itemsToInsert = validItems.map((item, idx) => ({
        inward_id: inwardData.id,
        sl_no: idx + 1,
        spare_name: item.spareName,
        qty: item.qty,
        rate: item.rate,
        total: item.total,
      }));
      const { error: itemsError } = await supabase.from('spare_inward_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      toast.success('Spare inward record saved');
      setShowForm(false);
      resetForm();
      fetchRecords();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const resetForm = () => {
    setAdjustmentNote('');
    setItems([{ id: '1', slNo: 1, spareName: '', qty: 0, rate: 0, total: 0 }]);
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: delError } = await supabase.from('spare_inward').delete().eq('id', id);
      if (delError) throw delError;
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Record deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
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
            <span className="text-[14px] font-semibold text-foreground">
              {loading ? 'Loading…' : `${records.length} Inward Records`}
            </span>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={28} className="text-primary animate-spin" />
              <p className="text-[13px] text-muted-foreground">Loading from database…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertTriangle size={28} className="text-danger" />
              <p className="text-[13px] text-danger">{error}</p>
              <button onClick={fetchRecords} className="px-4 py-2 bg-primary text-primary-foreground rounded text-[12px]">Retry</button>
            </div>
          ) : (
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
                      No inward records yet. Click &quot;New Inward Entry&quot; to add stock.
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
          )}
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
                <div className="flex gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-foreground mb-1.5">Ref No</label>
                    <input type="number" value={refNo} onChange={e => setRefNo(Number(e.target.value))} className="w-24 px-3 py-2.5 border-2 border-gray-300 rounded text-[13px] font-mono font-bold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-foreground mb-1.5">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2.5 border-2 border-gray-300 rounded text-[13px] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-foreground mb-1.5">Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="px-3 py-2.5 border-2 border-gray-300 rounded text-[13px] focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-300 rounded overflow-hidden mb-4">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="text-center px-3 py-2 font-semibold w-12">Sl</th>
                      <th className="text-left px-3 py-2 font-semibold">Spare Name</th>
                      <th className="text-center px-3 py-2 font-semibold w-24">Qty</th>
                      <th className="text-center px-3 py-2 font-semibold w-28">Rate (₹)</th>
                      <th className="text-center px-3 py-2 font-semibold w-28">Total (₹)</th>
                      <th className="text-center px-3 py-2 font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="px-3 py-2 text-center text-muted-foreground">{item.slNo}</td>
                        <td className="px-3 py-2">
                          {spareNames.length > 0 ? (
                            <select
                              value={item.spareName}
                              onChange={e => updateItem(item.id, 'spareName', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="">-- Select Spare --</option>
                              {spareNames.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={item.spareName}
                              onChange={e => updateItem(item.id, 'spareName', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Spare name"
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-[12px] text-center focus:outline-none focus:ring-1 focus:ring-primary" min="0" step="0.01" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-[12px] text-center focus:outline-none focus:ring-1 focus:ring-primary" min="0" step="0.01" />
                        </td>
                        <td className="px-3 py-2 text-center font-semibold text-green-700">₹{item.total.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          {items.length > 1 && (
                            <button onClick={() => removeRow(item.id)} className="text-danger hover:text-danger/80">
                              <X size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300">
                      <td colSpan={4} className="px-3 py-2 text-right font-bold text-[13px]">SPARE TOTAL:</td>
                      <td className="px-3 py-2 text-center font-bold text-green-700 text-[14px]">₹{spareTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={addRow} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-[12px] font-semibold hover:bg-blue-700 transition-colors">
                  <Plus size={13} /> Add Row
                </button>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="px-8 py-2.5 bg-green-600 text-white rounded font-bold text-[13px] hover:bg-green-700 transition-all active:scale-95">
                    SAVE
                  </button>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="px-8 py-2.5 bg-red-500 text-white rounded font-bold text-[13px] hover:bg-red-600 transition-all active:scale-95">
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
