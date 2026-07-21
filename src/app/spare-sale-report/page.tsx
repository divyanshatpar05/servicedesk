'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SaleReportRow {
  spareName: string;
  qtySold: number;
  rate: number;
  totalAmount: number;
  docketNo: string;
  customerName: string;
  date: string;
}

export default function SpareMasterSaleReportPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState<SaleReportRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const result: SaleReportRow[] = [];

      const { data: allotments } = await supabase
        .from('technician_allotments')
        .select('docket_number, allotment_date, customer_name, spare_part_name, spare_part_amount');

      (allotments || []).forEach((a: Record<string, unknown>) => {
        const aDate = a.allotment_date ? String(a.allotment_date).split('T')[0] : '';
        if (fromDate && aDate < fromDate) return;
        if (toDate && aDate > toDate) return;
        if (!a.spare_part_amount || Number(a.spare_part_amount) === 0) return;
        result.push({
          spareName: String(a.spare_part_name || 'Spare Parts'),
          qtySold: 1,
          rate: Number(a.spare_part_amount || 0),
          totalAmount: Number(a.spare_part_amount || 0),
          docketNo: String(a.docket_number || ''),
          customerName: String(a.customer_name || ''),
          date: aDate,
        });
      });

      setRows(result);
      setSearched(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = rows.map(r => ({
      'Date': r.date,
      'Docket No': r.docketNo,
      'Customer Name': r.customerName,
      'Spare Name': r.spareName,
      'Qty Sold': r.qtySold,
      'Rate (₹)': r.rate,
      'Total Amount (₹)': r.totalAmount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Sale Report');
    XLSX.writeFile(wb, `spare-sale-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalAmount = rows.reduce((s, r) => s + r.totalAmount, 0);
  const totalQty = rows.reduce((s, r) => s + r.qtySold, 0);

  return (
    <AppLayout title="Spare Master Sale Report" subtitle="View spare parts sold to customers from allotments">
      <div className="space-y-5">
        {/* Date Range Filter */}
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
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
            >
              <Search size={14} /> {loading ? 'Generating…' : 'Generate Report'}
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

        {/* Summary Cards */}
        {searched && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl shadow-card p-4 border-l-4 border-primary">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Records</p>
              <p className="text-2xl font-bold text-foreground mt-1">{rows.length}</p>
            </div>
            <div className="bg-card rounded-xl shadow-card p-4 border-l-4 border-green-500">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Qty Sold</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalQty}</p>
            </div>
            <div className="bg-card rounded-xl shadow-card p-4 border-l-4 border-orange-500">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Amount</p>
              <p className="text-2xl font-bold text-foreground mt-1">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Report Table */}
        {searched && (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-foreground">Sale Report</h3>
              {fromDate && toDate && (
                <span className="text-[12px] text-muted-foreground">{fromDate} to {toDate}</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Spare Name</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Qty Sold</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Rate (₹)</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Amount (₹)</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Docket No</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Customer Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-muted-foreground">
                        No spare parts sold in the selected date range.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{row.spareName}</td>
                        <td className="px-4 py-3 text-center">{row.qtySold}</td>
                        <td className="px-4 py-3 text-right">₹{row.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">₹{row.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-primary">{row.docketNo}</td>
                        <td className="px-4 py-3">{row.customerName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.date}</td>
                      </tr>
                    ))
                  )}
                  {rows.length > 0 && (
                    <tr className="bg-muted/30 font-bold border-t-2 border-border">
                      <td colSpan={2} className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-center">{totalQty}</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right text-green-600">₹{totalAmount.toFixed(2)}</td>
                      <td colSpan={3}></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!searched && (
          <div className="bg-card rounded-xl shadow-card p-12 text-center">
            <Calendar size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-[14px] font-semibold text-muted-foreground">Select a date range and click Generate Report</p>
            <p className="text-[12px] text-muted-foreground mt-1">Report will show all spare parts sold from allotments</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
