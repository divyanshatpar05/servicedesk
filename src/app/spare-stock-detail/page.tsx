'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, Search, Package2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface StockDetailRow {
  type: 'out' | 'in';
  docketNo: string;
  date: string;
  customerName: string;
  mobileNo: string;
  spareName: string;
  qty: number;
  rate: number;
  amount: number;
  serviceModel: string;
  refNo?: string | number;
  adjustmentNote?: string;
}

export default function SpareStockDetailPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState<StockDetailRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const result: StockDetailRow[] = [];

      // Outward from technician allotments
      const { data: allotments } = await supabase
        .from('technician_allotments')
        .select('docket_number, allotment_date, customer_name, mobile_number, spare_part_name, spare_part_amount, model');

      (allotments || []).forEach((a: Record<string, unknown>) => {
        const aDate = a.allotment_date ? String(a.allotment_date).split('T')[0] : '';
        if (fromDate && aDate < fromDate) return;
        if (toDate && aDate > toDate) return;
        if (!a.spare_part_amount || Number(a.spare_part_amount) === 0) return;
        result.push({
          type: 'out',
          docketNo: String(a.docket_number || ''),
          date: aDate,
          customerName: String(a.customer_name || ''),
          mobileNo: String(a.mobile_number || ''),
          spareName: String(a.spare_part_name || 'Spare Parts'),
          qty: 1,
          rate: Number(a.spare_part_amount || 0),
          amount: Number(a.spare_part_amount || 0),
          serviceModel: String(a.model || ''),
        });
      });

      // Inward records
      const { data: inwardItems } = await supabase
        .from('spare_inward_items')
        .select('spare_name, qty, rate, total, spare_inward(ref_no, inward_date, adjustment_note)');

      (inwardItems || []).forEach((item: Record<string, unknown>) => {
        const inward = item.spare_inward as Record<string, unknown> | null;
        const itemDate = inward?.inward_date ? String(inward.inward_date) : '';
        if (fromDate && itemDate < fromDate) return;
        if (toDate && itemDate > toDate) return;
        result.push({
          type: 'in',
          docketNo: '',
          date: itemDate,
          customerName: '',
          mobileNo: '',
          spareName: String(item.spare_name || ''),
          qty: Number(item.qty || 0),
          rate: Number(item.rate || 0),
          amount: Number(item.total || 0),
          serviceModel: '',
          refNo: inward?.ref_no ? Number(inward.ref_no) : undefined,
          adjustmentNote: inward?.adjustment_note ? String(inward.adjustment_note) : undefined,
        });
      });

      result.sort((a, b) => b.date.localeCompare(a.date));
      setRows(result);
      setSearched(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load stock detail');
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = filterType === 'all' ? rows : rows.filter(r => r.type === filterType);

  const handleExport = () => {
    const exportData = filteredRows.map(r => ({
      'Type': r.type === 'in' ? 'Inward' : 'Outward',
      'Date': r.date,
      'Docket No': r.docketNo || '—',
      'Ref No': r.refNo || '—',
      'Customer Name': r.customerName || '—',
      'Mobile No': r.mobileNo || '—',
      'Spare Name': r.spareName,
      'Qty': r.qty,
      'Rate (₹)': r.rate,
      'Amount (₹)': r.amount,
      'Service Model': r.serviceModel || '—',
      'Adjustment Note': r.adjustmentNote || '—',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Detail');
    XLSX.writeFile(wb, `spare-stock-detail-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AppLayout title="Spare Stock Detail" subtitle="Complete spare parts transaction history">
      <div className="space-y-5">
        {/* Filters */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">From Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring bg-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">To Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring bg-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">Type</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as 'all' | 'in' | 'out')}
                className="px-3 py-2 border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring bg-input"
              >
                <option value="all">All</option>
                <option value="in">Spare In</option>
                <option value="out">Spare Out (Sold)</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
            >
              <Search size={14} /> {loading ? 'Searching…' : 'Search'}
            </button>
            {rows.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <Download size={14} /> Export Excel
              </button>
            )}
          </div>
        </div>

        {/* Detail Table */}
        {searched && (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-foreground">Stock Detail ({filteredRows.length} records)</h3>
              <div className="flex gap-3 text-[12px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Spare In</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Spare Out</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Docket/Ref No</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Customer Name</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Mobile No</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Spare Name</th>
                    <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Qty</th>
                    <th className="text-right px-3 py-3 font-semibold text-muted-foreground">Rate (₹)</th>
                    <th className="text-right px-3 py-3 font-semibold text-muted-foreground">Amount (₹)</th>
                    <th className="text-left px-3 py-3 font-semibold text-muted-foreground">Service Model</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground">
                        No records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={idx} className={`border-b border-border hover:bg-muted/20 transition-colors ${row.type === 'in' ? 'bg-green-50/30' : ''}`}>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {row.type === 'in' ? '↓ IN' : '↑ OUT'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-primary">
                          {row.type === 'in' ? `REF-${row.refNo}` : row.docketNo}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{row.date}</td>
                        <td className="px-3 py-2.5">{row.customerName || (row.type === 'in' ? row.adjustmentNote || '—' : '—')}</td>
                        <td className="px-3 py-2.5">{row.mobileNo || '—'}</td>
                        <td className="px-3 py-2.5 font-medium">{row.spareName}</td>
                        <td className="px-3 py-2.5 text-center">{row.qty}</td>
                        <td className="px-3 py-2.5 text-right">₹{row.rate.toFixed(2)}</td>
                        <td className={`px-3 py-2.5 text-right font-semibold ${row.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{row.amount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{row.serviceModel || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!searched && (
          <div className="bg-card rounded-xl shadow-card p-12 text-center">
            <Package2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-[14px] font-semibold text-muted-foreground">Select a date range and click Search</p>
            <p className="text-[12px] text-muted-foreground mt-1">Shows all spare inward and outward transactions</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
