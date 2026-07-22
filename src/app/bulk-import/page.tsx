'use client';
import React, { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, ChevronRight, Download, Users, Wrench, Package, RefreshCw, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';

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
    requiredColumns: [
      'SL. NO', 'DATE', 'CARD NO', 'CUSTOMER NAME', 'DETAILS ADDRESS',
      'ZIP CODE', 'CONTACT NO', 'SALE POINT', 'INVOICE NO', 'SERIAL NO PRODUCT',
      'INSTALL DATE', 'INST. MONTH', 'EXP DATE', 'INSTALLER',
      'CUR. SERV.', 'TOTAL SERVICE', 'NO OF SERVICE', 'NEXT SERVICE',
      'OFFICE ATTENDED BY', 'AMC',
    ],
    sampleData: [
      {
        'SL. NO': '1',
        'DATE': '01/01/2026',
        'CARD NO': 'CARD-001',
        'CUSTOMER NAME': 'Priya Sharma',
        'DETAILS ADDRESS': '47 D.N.C RD KOL',
        'ZIP CODE': '700035',
        'CONTACT NO': '9820145678',
        'SALE POINT': 'Bandra West',
        'INVOICE NO': 'INV-2026-001',
        'SERIAL NO PRODUCT': 'SN-001234',
        'INSTALL DATE': '05/01/2026',
        'INST. MONTH': 'January',
        'EXP DATE': '05/01/2027',
        'INSTALLER': 'Ramesh Kumar',
        'CUR. SERV.': '1',
        'TOTAL SERVICE': '4',
        'NO OF SERVICE': '1',
        'NEXT SERVICE': '05/04/2026',
        'OFFICE ATTENDED BY': 'Suresh',
        'AMC': 'YES',
      },
      {
        'SL. NO': '2',
        'DATE': '02/01/2026',
        'CARD NO': 'CARD-002',
        'CUSTOMER NAME': 'Rajesh Kumar',
        'DETAILS ADDRESS': '12 Park Street KOL',
        'ZIP CODE': '700016',
        'CONTACT NO': '9867432109',
        'SALE POINT': 'Park Street',
        'INVOICE NO': 'INV-2026-002',
        'SERIAL NO PRODUCT': 'SN-005678',
        'INSTALL DATE': '06/01/2026',
        'INST. MONTH': 'January',
        'EXP DATE': '06/01/2027',
        'INSTALLER': 'Anil Verma',
        'CUR. SERV.': '2',
        'TOTAL SERVICE': '4',
        'NO OF SERVICE': '2',
        'NEXT SERVICE': '06/04/2026',
        'OFFICE ATTENDED BY': 'Mohan',
        'AMC': 'NO',
      },
    ],
  },
  dockets: {
    label: 'Service Dockets',
    icon: <Wrench size={18} />,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    requiredColumns: ['Docket No', 'Customer Name', 'Mobile No', 'Model', 'Nature of Docket', 'Status', 'Date/Time'],
    sampleData: [
      { 'Docket No': '100000001', 'Customer Name': 'Priya Sharma', 'Mobile No': '9820145678/8390200001', 'Model': 'VEGA DLX-60', 'Nature of Docket': 'AMC', 'Status': 'New', 'Date/Time': '01/01/2026 16:06' },
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

// ── Transformation helpers ──────────────────────────────────────────────────

function splitMobileNumbers(value: unknown): { mobile1: string; mobile2: string; mobile3: string } {
  const parts = String(value ?? '').split('/').map(p => p.trim()).filter(Boolean);
  return {
    mobile1: parts[0] || '',
    mobile2: parts[1] || '',
    mobile3: parts[2] || '',
  };
}

function splitDateTime(value: unknown): { date: string; time: string } {
  const str = String(value ?? '').trim();

  // Detect Excel serial number: a number like 46054.51261574074
  // Excel serial dates: integers 1-2958465 (year 1900 to 9999)
  const excelSerial = Number(str);
  if (!isNaN(excelSerial) && excelSerial > 1 && excelSerial < 2958466 && /^\d+(\.\d+)?$/.test(str)) {
    // Excel epoch is Dec 30, 1899 (accounting for Excel's leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const totalMs = excelEpoch.getTime() + excelSerial * 86400000;
    const d = new Date(totalMs);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
  }

  const spaceIdx = str.indexOf(' ');
  if (spaceIdx !== -1) {
    return { date: str.substring(0, spaceIdx).trim(), time: str.substring(spaceIdx + 1).trim() };
  }
  return { date: str, time: '' };
}

/** Map a UI status string to the DB docket_status enum */
function mapStatusToDb(status: string): string {
  const map: Record<string, string> = {
    'new': 'PENDING',
    'assigned': 'RUNNING',
    'visited': 'RUNNING',
    'diagnosed': 'RUNNING',
    'in-repair': 'RUNNING',
    'completed': 'COMPLETED',
    'invoiced': 'COMPLETED',
    'closed': 'COMPLETED',
    'cancelled': 'CANCELLED',
    'running': 'RUNNING',
    'pending': 'PENDING',
  };
  return map[status.toLowerCase()] || 'PENDING';
}

/** Parse a date string like "01/01/2026" or "2026-01-01" into ISO format */
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  // DD/MM/YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
  }
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr;
  // Handle Excel serial numbers
  const excelSerial = Number(dateStr);
  if (!isNaN(excelSerial) && excelSerial > 1 && excelSerial < 2958466 && /^\d+(\.\d+)?$/.test(dateStr)) {
    // Excel epoch is Dec 30, 1899 (accounting for Excel's leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const totalMs = excelEpoch.getTime() + excelSerial * 86400000;
    const d = new Date(totalMs);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }
  return null;
}

function transformDocketRow(
  row: Record<string, string>,
  mapping: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  const standardCols = ['Docket No', 'Customer Name', 'Model', 'Nature of Docket', 'Status'];
  standardCols.forEach(col => {
    const src = mapping[col];
    result[col] = src ? (row[src] || '') : '';
  });
  const mobileSrc = mapping['Mobile No'];
  const rawMobile = mobileSrc ? (row[mobileSrc] || '') : '';
  const { mobile1, mobile2, mobile3 } = splitMobileNumbers(rawMobile);
  result['Mobile 1'] = mobile1;
  result['Mobile 2'] = mobile2;
  result['Mobile 3'] = mobile3;
  const dtSrc = mapping['Date/Time'];
  const rawDT = dtSrc ? (row[dtSrc] || '') : '';
  const { date, time } = splitDateTime(rawDT);
  result['Date'] = date;
  result['Time'] = time;
  return result;
}

const DOCKET_DISPLAY_COLUMNS = [
  'Docket No', 'Customer Name', 'Mobile 1', 'Mobile 2', 'Mobile 3',
  'Model', 'Nature of Docket', 'Status', 'Date', 'Time',
];

type ImportStep = 'select' | 'upload' | 'map' | 'preview' | 'done';

export default function BulkImportPage() {
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [step, setStep] = useState<ImportStep>('select');
  const [uploadedData, setUploadedData] = useState<Record<string, string>[]>([]);
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
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

  const handleImport = async () => {
    setImporting(true);
    const errors: string[] = [];
    let success = 0;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      if (selectedType === 'dockets') {
        // Build rows to insert, skipping invalid ones
        const toInsert: Record<string, unknown>[] = [];

        uploadedData.forEach((row, idx) => {
          const transformed = transformDocketRow(row, columnMapping);
          const missing: string[] = [];
          if (!transformed['Docket No']) missing.push('Docket No');
          if (!transformed['Customer Name']) missing.push('Customer Name');
          if (!transformed['Mobile 1']) missing.push('Mobile No');
          if (!transformed['Model']) missing.push('Model');
          if (!transformed['Date']) missing.push('Date/Time');

          if (missing.length > 0) {
            errors.push(`Row ${idx + 2}: Missing ${missing.join(', ')}`);
            return;
          }

          const isoDate = parseDate(transformed['Date']);
          const createdAt = isoDate
            ? `${isoDate}T${transformed['Time'] ? transformed['Time'] + ':00' : '00:00:00'}`
            : new Date().toISOString();

          toInsert.push({
            user_id: userId,
            docket_number: String(transformed['Docket No']).trim(),
            customer_name: transformed['Customer Name'],
            mobile_number: transformed['Mobile 1'],
            alternate_mobile: transformed['Mobile 2'] || null,
            model_no: transformed['Model'],
            nature_of_docket: transformed['Nature of Docket'] || null,
            docket_status: mapStatusToDb(transformed['Status'] || 'New'),
            created_at: createdAt,
          });
        });

        // Insert in batches of 100 to avoid payload limits
        const BATCH = 100;
        for (let i = 0; i < toInsert.length; i += BATCH) {
          const batch = toInsert.slice(i, i + BATCH);
          const { error } = await supabase
            .from('service_dockets')
            .upsert(batch, { onConflict: 'docket_number', ignoreDuplicates: true });
          if (error) {
            errors.push(`Batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`);
          } else {
            success += batch.length;
          }
        }

      } else if (selectedType === 'customers') {
        const toInsert: Record<string, unknown>[] = [];

        uploadedData.forEach((row, idx) => {
          const get = (col: string) => {
            const src = columnMapping[col];
            return src ? String(row[src] ?? '').trim() : '';
          };
          const name = get('CUSTOMER NAME');
          const contact = get('CONTACT NO');
          if (!name) {
            errors.push(`Row ${idx + 2}: Missing CUSTOMER NAME`);
            return;
          }
          const installDateIso = parseDate(get('INSTALL DATE'));
          const expDateIso = parseDate(get('EXP DATE'));
          const nextServiceIso = parseDate(get('NEXT SERVICE'));
          const dateIso = parseDate(get('DATE'));
          toInsert.push({
            user_id: userId,
            customer_name: name,
            mobile_number: contact || null,
            address: get('DETAILS ADDRESS') || null,
            zipcode: get('ZIP CODE') || null,
            area: get('SALE POINT') || null,
            card_no: get('CARD NO') || null,
            invoice_no: get('INVOICE NO') || null,
            serial_no_product: get('SERIAL NO PRODUCT') || null,
            install_date: installDateIso || null,
            inst_month: get('INST. MONTH') || null,
            exp_date: expDateIso || null,
            installer: get('INSTALLER') || null,
            cur_serv: get('CUR. SERV.') || null,
            total_service: get('TOTAL SERVICE') || null,
            no_of_service: get('NO OF SERVICE') || null,
            next_service: nextServiceIso || null,
            office_attended_by: get('OFFICE ATTENDED BY') || null,
            amc: get('AMC') || null,
            sl_no: get('SL. NO') || null,
            entry_date: dateIso || null,
          });
        });

        const BATCH = 100;
        for (let i = 0; i < toInsert.length; i += BATCH) {
          const batch = toInsert.slice(i, i + BATCH);
          const { error } = await supabase.from('customers').insert(batch);
          if (error) {
            errors.push(`Batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`);
          } else {
            success += batch.length;
          }
        }

      } else if (selectedType === 'amc') {
        const toInsert: Record<string, unknown>[] = [];

        uploadedData.forEach((row, idx) => {
          const get = (col: string) => {
            const src = columnMapping[col];
            return src ? String(row[src] ?? '').trim() : '';
          };
          const name = get('Customer Name');
          const mobile = get('Mobile No');
          if (!name || !mobile) {
            errors.push(`Row ${idx + 2}: Missing Customer Name or Mobile No`);
            return;
          }
          const startIso = parseDate(get('Start Date'));
          const endIso = parseDate(get('End Date'));
          toInsert.push({
            user_id: userId,
            customer_name: name,
            mobile_number: mobile,
            model: get('Model') || null,
            amc_type: get('AMC Type') || null,
            amc_status: 'ACTIVE',
            start_date: startIso ? new Date(startIso).toISOString() : new Date().toISOString(),
            end_date: endIso ? new Date(endIso).toISOString() : null,
            notes: get('AMC Ref No') ? `Ref: ${get('AMC Ref No')}` : null,
          });
        });

        const BATCH = 100;
        for (let i = 0; i < toInsert.length; i += BATCH) {
          const batch = toInsert.slice(i, i + BATCH);
          const { error } = await supabase.from('amc_renewals').insert(batch);
          if (error) {
            errors.push(`Batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`);
          } else {
            success += batch.length;
          }
        }

      } else if (selectedType === 'spare_parts') {
        // Spare parts go into master_setup with category = 'spare_part'
        const toInsert: Record<string, unknown>[] = [];

        uploadedData.forEach((row, idx) => {
          const get = (col: string) => {
            const src = columnMapping[col];
            return src ? String(row[src] ?? '').trim() : '';
          };
          const partName = get('Part Name');
          if (!partName) {
            errors.push(`Row ${idx + 2}: Missing Part Name`);
            return;
          }
          toInsert.push({
            user_id: userId,
            category: 'spare_part',
            value: partName,
            spare_amount: parseFloat(get('Rate')) || 0,
            is_active: true,
          });
        });

        const BATCH = 100;
        for (let i = 0; i < toInsert.length; i += BATCH) {
          const batch = toInsert.slice(i, i + BATCH);
          const { error } = await supabase.from('master_setup').insert(batch);
          if (error) {
            errors.push(`Batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`);
          } else {
            success += batch.length;
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error during import';
      errors.push(msg);
    } finally {
      setImporting(false);
    }

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
    if (selectedType === 'dockets') {
      return transformDocketRow(row, columnMapping);
    }
    const mapped: Record<string, string> = {};
    config?.requiredColumns.forEach(req => {
      const col = columnMapping[req];
      mapped[req] = col ? row[col] || '' : '';
    });
    return mapped;
  });

  const previewColumns = selectedType === 'dockets' ? DOCKET_DISPLAY_COLUMNS : (config?.requiredColumns || []);

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

            {selectedType === 'dockets' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[12px] text-amber-800 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                <span>
                  <strong>Auto-transformations applied:</strong> Mobile numbers separated by <code className="bg-amber-100 px-1 rounded">/</code> are split into <strong>Mobile 1 / 2 / 3</strong>. Date-time values like <code className="bg-amber-100 px-1 rounded">01/01/2026 16:06</code> are split into separate <strong>Date</strong> and <strong>Time</strong> columns.
                </span>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {previewColumns.map(col => (
                      <th key={col} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mappedPreview.map((row, i) => (
                    <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-card' : 'bg-muted/10'}`}>
                      {previewColumns.map(col => (
                        <td key={col} className="px-3 py-2 text-foreground whitespace-nowrap">{row[col] || <span className="text-red-400 italic">empty</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('map')} disabled={importing} className="px-4 py-2 border border-border rounded-lg text-[13px] font-semibold text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50">Back</button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg text-[13px] font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <><Loader2 size={14} className="animate-spin" /> Importing…</>
                ) : (
                  <><Upload size={14} /> Import {uploadedData.length} Records</>
                )}
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
                <strong className="text-green-600">{importResult.success} records</strong> saved to database
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
