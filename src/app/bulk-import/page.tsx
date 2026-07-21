'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, ChevronRight, Download, Users, Wrench, Package, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

type ImportType = 'customers' | 'dockets' | 'spare_parts' | 'amc';

interface ImportConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  requiredColumns: string[];
  sampleData: Record<string, string>[];
}

const importConfigs: Record<ImportType, ImportConfig> = {
  customers: {
    label: 'Customers',
    icon: <Users size={18} />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    requiredColumns: ['Customer Name', 'Mobile No', 'Address', 'Pincode', 'Area', 'Email'],
    sampleData: [
      { 'Customer Name': 'Priya Sharma', 'Mobile No': '9820145678', 'Address': '47 D.N.C RD KOL', 'Pincode': '700035', 'Area': 'Bandra West', 'Email': 'priya@example.com' },
      { 'Customer Name': 'Rajesh Kumar', 'Mobile No': '9867432109', 'Address': '12 Park Street KOL', 'Pincode': '700016', 'Area': 'Park Street', 'Email': 'rajesh@example.com' },
    ],
  },
  dockets: {
    label: 'Service Dockets',
    icon: <Wrench size={18} />,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    requiredColumns: ['Docket No', 'Customer Name', 'Mobile No', 'Model', 'Nature of Docket', 'Status', 'Date'],
    sampleData: [
      { 'Docket No': '100000001', 'Customer Name': 'Priya Sharma', 'Mobile No': '9820145678', 'Model': 'VEGA DLX-60', 'Nature of Docket': 'AMC', 'Status': 'New', 'Date': '2026-07-10' },
    ],
  },
  spare_parts: {
    label: 'Spare Parts',
    icon: <Package size={18} />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    requiredColumns: ['Part Name', 'Part Code', 'Rate', 'Stock Qty', 'Category'],
    sampleData: [
      { 'Part Name': 'MOTOR ASSEMBLY', 'Part Code': 'SP-001', 'Rate': '1200', 'Stock Qty': '10', 'Category': 'Motor' },
      { 'Part Name': 'CAPACITOR 25MFD', 'Part Code': 'SP-002', 'Rate': '150', 'Stock Qty': '25', 'Category': 'Electrical' },
    ],
  },
  amc: {
    label: 'AMC Records',
    icon: <RefreshCw size={18} />,
    color: 'bg-green-100 text-green-700 border-green-200',
    requiredColumns: ['AMC Ref No', 'Customer Name', 'Mobile No', 'Model', 'AMC Type', 'Start Date', 'End Date', 'Amount'],
    sampleData: [
      { 'AMC Ref No': 'AMC-2026-001', 'Customer Name': 'Priya Sharma', 'Mobile No': '9820145678', 'Model': 'VEGA DLX-60', 'AMC Type': '4 Month', 'Start Date': '2026-01-01', 'End Date': '2026-12-31', 'Amount': '3000' },
    ],
  },
};

type ImportStep = 'select' | 'upload' | 'map' | 'preview' | 'done';

export default function BulkImportPage() {
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [step, setStep] = useState<ImportStep>('select');
  const [uploadedData, setUploadedData] = useState<Record<string, string>[]>([]);
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const config = selectedType ? importConfigs[selectedType] : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
      if (json.length > 0) {
        const cols = Object.keys(json[0]);
        setUploadedColumns(cols);
        setUploadedData(json);
        // Auto-map columns with same name
        const autoMap: Record<string, string> = {};
        config?.requiredColumns.forEach(req => {
          const match = cols.find(c => c.toLowerCase().trim() === req.toLowerCase().trim());
          if (match) autoMap[req] = match;
        });
        setColumnMapping(autoMap);
        setStep('map');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadSample = () => {
    if (!config) return;
    const ws = XLSX.utils.json_to_sheet(config.sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, `sample-${selectedType}.xlsx`);
  };

  const handleImport = () => {
    const errors: string[] = [];
    let success = 0;
    uploadedData.forEach((row, idx) => {
      const missing = config?.requiredColumns.filter(req => {
        const mapped = columnMapping[req];
        return !mapped || !row[mapped];
      });
      if (missing && missing.length > 0) {
        errors.push(`Row ${idx + 2}: Missing ${missing.join(', ')}`);
      } else {
        success++;
      }
    });
    setImportResult({ success, errors: errors.slice(0, 10) });
    setStep('done');
  };

  const resetImport = () => {
    setSelectedType(null);
    setStep('select');
    setUploadedData([]);
    setUploadedColumns([]);
    setColumnMapping({});
    setFileName('');
    setImportResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const mappedPreview = uploadedData.slice(0, 5).map(row => {
    const mapped: Record<string, string> = {};
    config?.requiredColumns.forEach(req => {
      const col = columnMapping[req];
      mapped[req] = col ? row[col] || '' : '';
    });
    return mapped;
  });

  return (
    <AppLayout title="Bulk Data Import" subtitle="Import customers, dockets, spare parts, and AMC records from Excel/CSV">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Step Indicator */}
        <div className="bg-card rounded-xl shadow-card px-6 py-4">
          <div className="flex items-center gap-2">
            {(['select', 'upload', 'map', 'preview', 'done'] as ImportStep[]).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${step === s ? 'text-primary' : ['select', 'upload', 'map', 'preview', 'done'].indexOf(step) > i ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === s ? 'bg-primary text-white' : ['select', 'upload', 'map', 'preview', 'done'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {['select', 'upload', 'map', 'preview', 'done'].indexOf(step) > i ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:inline capitalize">{s === 'select' ? 'Select Type' : s === 'map' ? 'Map Columns' : s}</span>
                </div>
                {i < 4 && <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step: Select Type */}
        {step === 'select' && (
          <div className="bg-card rounded-xl shadow-card p-6">
            <h2 className="text-[15px] font-bold text-foreground mb-4">What would you like to import?</h2>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(importConfigs) as ImportType[]).map(type => {
                const cfg = importConfigs[type];
                return (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setStep('upload'); }}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${cfg.color}`}
                  >
                    <div className="flex-shrink-0">{cfg.icon}</div>
                    <div>
                      <p className="font-bold text-[14px]">{cfg.label}</p>
                      <p className="text-[11px] opacity-70 mt-0.5">{cfg.requiredColumns.length} required columns</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Upload */}
        {step === 'upload' && config && (
          <div className="bg-card rounded-xl shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-foreground">Upload File — {config.label}</h2>
              <button onClick={resetImport} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1"><X size={13} /> Start Over</button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-[12px] text-blue-700">
              <p className="font-semibold mb-1">Required Columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {config.requiredColumns.map(col => (
                  <span key={col} className="bg-blue-100 border border-blue-300 px-2 py-0.5 rounded text-[11px] font-mono">{col}</span>
                ))}
              </div>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-[14px] font-semibold text-foreground">Click to upload Excel or CSV file</p>
              <p className="text-[12px] text-muted-foreground mt-1">Supports .xlsx, .xls, .csv formats</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
            </div>

            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-2 text-[12px] text-primary hover:underline"
            >
              <Download size={13} /> Download Sample Template
            </button>
          </div>
        )}

        {/* Step: Map Columns */}
        {step === 'map' && config && (
          <div className="bg-card rounded-xl shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-foreground">Map Columns</h2>
              <span className="text-[12px] text-muted-foreground">{uploadedData.length} rows found in <strong>{fileName}</strong></span>
            </div>

            <div className="space-y-3">
              {config.requiredColumns.map(req => (
                <div key={req} className="flex items-center gap-4">
                  <div className="w-48 flex-shrink-0">
                    <span className="text-[12px] font-semibold text-foreground">{req}</span>
                    <span className="text-red-500 ml-0.5">*</span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                  <select
                    value={columnMapping[req] || ''}
                    onChange={e => setColumnMapping(prev => ({ ...prev, [req]: e.target.value }))}
                    className="flex-1 border border-border rounded-md px-3 py-1.5 text-[12px] bg-input focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">— Select column —</option>
                    {uploadedColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  {columnMapping[req] ? (
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-orange-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('upload')} className="px-4 py-2 border border-border rounded-lg text-[13px] font-semibold text-muted-foreground hover:bg-secondary transition-colors">Back</button>
              <button
                onClick={() => setStep('preview')}
                disabled={config.requiredColumns.some(r => !columnMapping[r])}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Preview Data
              </button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && config && (
          <div className="bg-card rounded-xl shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-foreground">Preview (First 5 rows)</h2>
              <span className="text-[12px] text-muted-foreground">Total: <strong>{uploadedData.length}</strong> rows to import</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {config.requiredColumns.map(col => (
                      <th key={col} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mappedPreview.map((row, i) => (
                    <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}>
                      {config.requiredColumns.map(col => (
                        <td key={col} className="px-3 py-2 text-foreground whitespace-nowrap">{row[col] || <span className="text-red-400 italic">empty</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('map')} className="px-4 py-2 border border-border rounded-lg text-[13px] font-semibold text-muted-foreground hover:bg-secondary transition-colors">Back</button>
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-green-600 text-white rounded-lg text-[13px] font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Upload size={14} /> Import {uploadedData.length} Records
              </button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && importResult && (
          <div className="bg-card rounded-xl shadow-card p-6 space-y-5">
            <div className="text-center py-4">
              <CheckCircle2 size={48} className="mx-auto text-green-500 mb-3" />
              <h2 className="text-[18px] font-bold text-foreground">Import Complete</h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                <strong className="text-green-600">{importResult.success} records</strong> imported successfully
                {importResult.errors.length > 0 && <>, <strong className="text-red-500">{importResult.errors.length} errors</strong></>}
              </p>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-[12px] font-semibold text-red-700 mb-2">Errors (first 10):</p>
                <ul className="space-y-1">
                  {importResult.errors.map((err, i) => (
                    <li key={i} className="text-[11px] text-red-600 flex items-start gap-1.5">
                      <AlertCircle size={11} className="mt-0.5 flex-shrink-0" /> {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button onClick={resetImport} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-bold hover:bg-primary/90 transition-colors">
                Import More Data
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
