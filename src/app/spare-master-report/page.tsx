'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, Search, BarChart3, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SpareBalanceRow {
  spareName: string;
  inwardQty: number;
  outwardQty: number;
  balance: number;
  inwardAmount: number;
  outwardAmount: number;
}

const STORAGE_KEY_INWARD = 'spareInwardRecords';
const STORAGE_KEY_DOCKETS = 'serviceDockets';
const STORAGE_KEY_MASTER = 'masterSetupData';

function getSpareNames(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MASTER);
    if (stored) {
      const parsed = JSON.parse(stored);
      return (parsed.spareNames || []).map((s: { value: string }) => s.value);
    }
  } catch { }
  return [];
}

export default function SpareMasterReportPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState<SpareBalanceRow[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const spareNames = getSpareNames();
    const balanceMap: Record<string, SpareBalanceRow> = {};

    // Initialize all spare names
    spareNames.forEach(name => {
      balanceMap[name] = { spareName: name, inwardQty: 0, outwardQty: 0, balance: 0, inwardAmount: 0, outwardAmount: 0 };
    });

    // Process inward records
    try {
      const inwardStored = localStorage.getItem(STORAGE_KEY_INWARD);
      if (inwardStored) {
        const inwards = JSON.parse(inwardStored);
        inwards.forEach((r: any) => {
          if (fromDate && r.date < fromDate) return;
          if (toDate && r.date > toDate) return;
          (r.items || []).forEach((item: any) => {
            const name = item.spareName;
            if (!balanceMap[name]) {
              balanceMap[name] = { spareName: name, inwardQty: 0, outwardQty: 0, balance: 0, inwardAmount: 0, outwardAmount: 0 };
            }
            balanceMap[name].inwardQty += item.qty || 0;
            balanceMap[name].inwardAmount += item.total || 0;
          });
        });
      }
    } catch { }

    // Process outward (from dockets/invoices)
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
              const name = spare.name || spare.spareName || 'Spare Parts';
              if (!balanceMap[name]) {
                balanceMap[name] = { spareName: name, inwardQty: 0, outwardQty: 0, balance: 0, inwardAmount: 0, outwardAmount: 0 };
              }
              balanceMap[name].outwardQty += spare.qty || 1;
              balanceMap[name].outwardAmount += spare.total || spare.amount || 0;
            });
          }
        });
      }
    } catch { }

    // Calculate balance
    const result = Object.values(balanceMap).map(row => ({
      ...row,
      balance: row.inwardQty - row.outwardQty,
    })).filter(r => r.inwardQty > 0 || r.outwardQty > 0 || r.balance !== 0);

    setRows(result);
    setSearched(true);
  };

  const handleExport = () => {
    const exportData = rows.map(r => ({
      'Spare Name': r.spareName,
      'Inward Qty': r.inwardQty,
      'Outward Qty': r.outwardQty,
      'Balance Qty': r.balance,
      'Inward Amount (₹)': r.inwardAmount,
      'Outward Amount (₹)': r.outwardAmount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Spare Master Report');
    XLSX.writeFile(wb, `spare-master-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AppLayout title="Spare Master Report" subtitle="Inward, Outward and Balance stock for a given time range">
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
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
            >
              <Search size={14} /> Generate Report
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

        {/* Report Table */}
        {searched && (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-foreground">Spare Stock Report</h3>
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
                    <th className="text-center px-4 py-3 font-semibold text-green-600">Inward Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-green-600">Inward Amt (₹)</th>
                    <th className="text-center px-4 py-3 font-semibold text-red-500">Outward Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-red-500">Outward Amt (₹)</th>
                    <th className="text-center px-4 py-3 font-semibold text-primary">Balance Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        No spare stock data found for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{row.spareName}</td>
                        <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.inwardQty}</td>
                        <td className="px-4 py-3 text-right text-green-600">₹{row.inwardAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center text-red-500 font-semibold">{row.outwardQty}</td>
                        <td className="px-4 py-3 text-right text-red-500">₹{row.outwardAmount.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-center font-bold ${row.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
                          {row.balance}
                        </td>
                      </tr>
                    ))
                  )}
                  {rows.length > 0 && (
                    <tr className="bg-muted/30 font-bold border-t-2 border-border">
                      <td colSpan={2} className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-center text-green-600">{rows.reduce((s, r) => s + r.inwardQty, 0)}</td>
                      <td className="px-4 py-3 text-right text-green-600">₹{rows.reduce((s, r) => s + r.inwardAmount, 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-red-500">{rows.reduce((s, r) => s + r.outwardQty, 0)}</td>
                      <td className="px-4 py-3 text-right text-red-500">₹{rows.reduce((s, r) => s + r.outwardAmount, 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-primary">{rows.reduce((s, r) => s + r.balance, 0)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!searched && (
          <div className="bg-card rounded-xl shadow-card p-12 text-center">
            <BarChart3 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-[14px] font-semibold text-muted-foreground">Select a date range and click Generate Report</p>
            <p className="text-[12px] text-muted-foreground mt-1">Shows Spare Inward, Outward (from invoices) and Balance stock</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
