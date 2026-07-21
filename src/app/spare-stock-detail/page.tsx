'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, Search, Package2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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

const STORAGE_KEY_INWARD = 'spareInwardRecords';
const STORAGE_KEY_DOCKETS = 'serviceDockets';

export default function SpareStockDetailPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState<StockDetailRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  const handleSearch = () => {
    const result: StockDetailRow[] = [];

    // Outward (from dockets/invoices)
    try {
      const docketStored = localStorage.getItem(STORAGE_KEY_DOCKETS);
      if (docketStored) {
        const dockets = JSON.parse(docketStored);
        dockets.forEach((d: any) => {
          const docketDate = d.dateTime ? d.dateTime.split(' ')[0] : d.date || '';
          if (fromDate && docketDate < fromDate) return;
          if (toDate && docketDate > toDate) return;

          if (d.spares && Array.isArray(d.spares)) {
            d.spares.forEach((spare: any) => {
              result.push({
                type: 'out',
                docketNo: d.docketNo || d.id || '',
                date: docketDate,
                customerName: d.customerName || '',
                mobileNo: d.mobileNo || '',
                spareName: spare.name || spare.spareName || '',
                qty: spare.qty || 1,
                rate: spare.rate || 0,
                amount: spare.total || spare.amount || 0,
                serviceModel: d.model || '',
              });
            });
          } else if (d.sparePartAmount && d.sparePartAmount > 0) {
            result.push({
              type: 'out',
              docketNo: d.docketNo || d.id || '',
              date: docketDate,
              customerName: d.customerName || '',
              mobileNo: d.mobileNo || '',
              spareName: 'Spare Parts',
              qty: 1,
              rate: d.sparePartAmount,
              amount: d.sparePartAmount,
              serviceModel: d.model || '',
            });
          }
        });
      }
    } catch { }

    // Inward records
    try {
      const inwardStored = localStorage.getItem(STORAGE_KEY_INWARD);
      if (inwardStored) {
        const inwards = JSON.parse(inwardStored);
        inwards.forEach((r: any) => {
          if (fromDate && r.date < fromDate) return;
          if (toDate && r.date > toDate) return;
          (r.items || []).forEach((item: any) => {
            result.push({
              type: 'in',
              docketNo: '',
              date: r.date,
              customerName: '',
              mobileNo: '',
              spareName: item.spareName || '',
              qty: item.qty || 0,
              rate: item.rate || 0,
              amount: item.total || 0,
              serviceModel: '',
              refNo: r.refNo,
              adjustmentNote: r.adjustmentNote,
            });
          });
        });
      }
    } catch { }

    // Sort by date desc
    result.sort((a, b) => b.date.localeCompare(a.date));
    setRows(result);
    setSearched(true);
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
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
            >
              <Search size={14} /> Search
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
            <p className="text-[14px] font-semibold text-muted-foreground">Select filters and click Search</p>
            <p className="text-[12px] text-muted-foreground mt-1">Shows complete spare in/out transaction history</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
