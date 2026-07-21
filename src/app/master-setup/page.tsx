'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Edit2, Trash2, Save, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

type MasterCategory =
  | 'serviceEngineers' | 'serviceModes' | 'paymentModes' | 'paymentTypes' | 'spareNames' | 'amcTypes' | 'natureOfDocket' | 'docketStatus' | 'salePoints' | 'salesExecutives' | 'modelNumbers';

interface MasterItem {
  id: string;
  value: string;
  amount?: number;
}

const initialData: Record<MasterCategory, MasterItem[]> = {
  serviceEngineers: [
    { id: 'se-1', value: 'PRITAM SARKAR' },
    { id: 'se-2', value: 'RAJAN K.' },
    { id: 'se-3', value: 'ARJUN M.' },
    { id: 'se-4', value: 'DEEPA V.' },
    { id: 'se-5', value: 'SUNIL P.' },
    { id: 'se-6', value: 'PRIYA S.' },
    { id: 'se-7', value: 'KAVITHA R.' },
  ],
  serviceModes: [
    { id: 'sm-1', value: 'AMC' },
    { id: 'sm-2', value: 'ASC DRY SERVICE' },
    { id: 'sm-3', value: 'PAID SERVICE' },
    { id: 'sm-4', value: 'WARRANTY SERVICE' },
    { id: 'sm-5', value: 'FREE SERVICE' },
    { id: 'sm-6', value: 'INSTALLATION' },
  ],
  paymentModes: [
    { id: 'pm-1', value: 'Cash' },
    { id: 'pm-2', value: 'Online' },
    { id: 'pm-3', value: 'Bank Transfer' },
    { id: 'pm-4', value: 'UPI' },
    { id: 'pm-5', value: 'Cheque' },
  ],
  paymentTypes: [
    { id: 'pt-1', value: 'AMC' },
    { id: 'pt-2', value: 'Paid' },
    { id: 'pt-3', value: 'Free' },
    { id: 'pt-4', value: 'Warranty' },
    { id: 'pt-5', value: 'ASC DRY SERVICE' },
  ],
  spareNames: [
    { id: 'sp-1', value: 'PVC PIPE', amount: 600 },
    { id: 'sp-2', value: 'ALUMINIUM ANGEL', amount: 450 },
    { id: 'sp-3', value: 'COWL', amount: 300 },
    { id: 'sp-4', value: 'L-PIPE', amount: 70 },
    { id: 'sp-5', value: 'ALLUMINIUM PATTY', amount: 400 },
    { id: 'sp-6', value: 'STANZA RUBBER WASHER', amount: 130 },
    { id: 'sp-7', value: 'FOIL PIPE FOC', amount: 0 },
    { id: 'sp-8', value: 'PVC PIPE FOC', amount: 0 },
    { id: 'sp-9', value: 'STANZA SMALL OIL CONTAINER', amount: 75 },
    { id: 'sp-10', value: 'ARC SWITCH [3G] / NEW', amount: 483 },
    { id: 'sp-11', value: 'ANGELA AUTO CLEAN CONTAINER', amount: 218 },
    { id: 'sp-12', value: 'SCOTT / SILVIANO / LUXEN SWITCH SET', amount: 635 },
    { id: 'sp-13', value: 'ARC 25W LAMP', amount: 35 },
    { id: 'sp-14', value: 'ARC WATER CONTAINER', amount: 73 },
    { id: 'sp-15', value: 'ARC CIRCUIT', amount: 1340 },
    { id: 'sp-16', value: 'ARC HOLDER OF VENT PIPE', amount: 119 },
    { id: 'sp-17', value: 'ARC OIL CHANNEL', amount: 63 },
    { id: 'sp-18', value: 'ARC OIL CHANNEL RUBBER WASHER', amount: 26 },
    { id: 'sp-19', value: 'VENTO CONDENSIR', amount: 240 },
    { id: 'sp-20', value: 'EMILIA SMALL CONTANER', amount: 220 },
    { id: 'sp-21', value: 'BLACK STAR 60 HYDROLIC MOTOR', amount: 914 },
    { id: 'sp-22', value: 'STANZA ELBOW PIPE 1 PC', amount: 70 },
    { id: 'sp-23', value: 'ARC FONT PANEL SWITCH-3G', amount: 485 },
    { id: 'sp-24', value: 'Dezire circuit', amount: 945 },
    { id: 'sp-25', value: 'Venisa 60 elbow pipe Price', amount: 52 },
    { id: 'sp-26', value: 'Vento Motor Reparing Cost', amount: 2300 },
    { id: 'sp-27', value: 'SMARTEC BIG OIL COLLOCTOR', amount: 420 },
    { id: 'sp-28', value: 'VOGUE RUBBER WASHER', amount: 130 },
    { id: 'sp-29', value: 'VOGUE CONDENSIR', amount: 142 },
    { id: 'sp-30', value: 'STANZA (OLD ) MS/SS SWITCH REPARING COST', amount: 500 },
    { id: 'sp-31', value: 'ROMANIA FASCHINO / SIGNIA CIRCUIT', amount: 791 },
    { id: 'sp-32', value: 'ROMANIA / FASCHINO / SIGNIA SWITCH', amount: 692 },
    { id: 'sp-33', value: 'ARC VAN CAP', amount: 55 },
    { id: 'sp-34', value: 'TRENDY SWITCH WITH CIRCUT', amount: 815 },
    { id: 'sp-35', value: 'ARC CONDENSIR', amount: 125 },
    { id: 'sp-36', value: 'FLORENTINE CONDENSIR', amount: 125 },
    { id: 'sp-37', value: 'ASTER CONDENSIR', amount: 125 },
    { id: 'sp-38', value: 'FIEONA CONDENSIR', amount: 125 },
    { id: 'sp-39', value: 'EIFFEL CONDENSIR', amount: 125 },
    { id: 'sp-40', value: 'LATINO CONDENSIR', amount: 125 },
    { id: 'sp-41', value: 'CRESTA CONDENSIR', amount: 125 },
    { id: 'sp-42', value: 'TITAN CONDENSIR', amount: 125 },
    { id: 'sp-43', value: 'VEGA CONDENSIR', amount: 125 },
    { id: 'sp-44', value: 'DEZIRE CONDENSIR', amount: 125 },
    { id: 'sp-45', value: 'VANISA CONDENSIR', amount: 125 },
    { id: 'sp-46', value: 'ELEGANZA CONDENSIR', amount: 125 },
    { id: 'sp-47', value: 'VITRARA CONSENSIR', amount: 125 },
    { id: 'sp-48', value: 'VIOLA CONSENSIR', amount: 125 },
    { id: 'sp-49', value: 'MOTOR REPARING', amount: 1500 },
    { id: 'sp-50', value: 'VENTO- CONTAINER', amount: 1220 },
    { id: 'sp-51', value: 'PVC PIPE ADJUST', amount: 500 },
    { id: 'sp-52', value: 'TRENDY CONTAINER', amount: 372 },
    { id: 'sp-53', value: 'BLACKSTAR OIL CONTAINER', amount: 356 },
    { id: 'sp-54', value: 'VOGUE VANE', amount: 714 },
    { id: 'sp-55', value: 'SANTAZA CONDENSIR', amount: 100 },
    { id: 'sp-56', value: 'STANZA FRONT PANEL SWITCH', amount: 500 },
    { id: 'sp-57', value: 'VENTO CIRCUIT', amount: 2442 },
    { id: 'sp-58', value: 'VENTO SWITCH', amount: 1710 },
    { id: 'sp-59', value: 'MOTOR REPAIR CHARGES ( IN WARRANTY )', amount: 0 },
    { id: 'sp-60', value: 'PIPE DISCOUNT', amount: 500 },
    { id: 'sp-61', value: 'CAPACITOR', amount: 75 },
    { id: 'sp-62', value: 'VOGUE LAMP COVER', amount: 75 },
    { id: 'sp-63', value: 'VOGUE LAMP', amount: 50 },
    { id: 'sp-64', value: 'ELBOW PIPE', amount: 70 },
    { id: 'sp-65', value: 'VENTO VANE CAP', amount: 55 },
    { id: 'sp-66', value: 'VOGUE AUTO CLEAN SWITCH', amount: 105 },
    { id: 'sp-67', value: 'FLORENTINE AUTO SWITCH', amount: 105 },
    { id: 'sp-68', value: 'VOGUE BIG OIL COLLECTOR', amount: 528 },
    { id: 'sp-69', value: 'VANTO-90 HOOD', amount: 1466 },
    { id: 'sp-70', value: 'STANZA REPARING AMOUNT', amount: 500 },
    { id: 'sp-71', value: 'STANZA CIRCUIT', amount: 500 },
    { id: 'sp-72', value: 'STANZA CIRCUIT REPARING', amount: 500 },
    { id: 'sp-73', value: 'FLORA CIRCUIT', amount: 500 },
    { id: 'sp-74', value: 'ALLUMINIUM PIPE ( BAP ) PVC PIPE RETURN', amount: 2000 },
    { id: 'sp-75', value: 'ALLUMINIUM PIPE ( BAP ) PVC PIPE ADJUST', amount: 1500 },
    { id: 'sp-76', value: 'ALLUMINIUM PIPE ( SAP ) PVC PIPE ADJUST', amount: 1300 },
    { id: 'sp-77', value: 'ALLUMINIUM PIPE ( SAP ) PVC PIPE RETURN', amount: 1800 },
    { id: 'sp-78', value: 'PVC PIPE RETURN', amount: 400 },
    { id: 'sp-79', value: 'BAP', amount: 2000 },
    { id: 'sp-80', value: 'SAP', amount: 1800 },
    { id: 'sp-81', value: 'VEGA DLX -60 (I) HOOD', amount: 885 },
    { id: 'sp-82', value: 'STANZA BIG CONTAINER', amount: 196 },
    { id: 'sp-83', value: 'BRIO CONDENSR', amount: 100 },
    { id: 'sp-84', value: 'FLORA BIG CONTAINER', amount: 200 },
    { id: 'sp-85', value: 'ALLUMINIUM PIPE ( BAP )', amount: 2000 },
    { id: 'sp-86', value: 'ALLUMINIUM PIPE ( SAP )', amount: 1800 },
    { id: 'sp-87', value: 'DISCOUNT', amount: 500 },
    { id: 'sp-88', value: 'SMART ELBOW PIPE', amount: 70 },
    { id: 'sp-89', value: 'STANZA CONDENSOR', amount: 100 },
    { id: 'sp-90', value: 'VISTA OIL COLLECOR', amount: 100 },
    { id: 'sp-91', value: 'STANZA LAMP', amount: 333 },
    { id: 'sp-92', value: 'Multitech set (86/500) - per set', amount: 1500 },
    { id: 'sp-93', value: 'VEGA DLX ( I )', amount: 850 },
    { id: 'sp-94', value: 'VEGA DLX ( i ) CENSOR', amount: 339 },
  ],
  amcTypes: [
    { id: 'at-1', value: 'Annual AMC (3 Services)' },
    { id: 'at-2', value: 'Bi-Annual AMC (2 Services)' },
    { id: 'at-3', value: 'Quarterly AMC (4 Services)' },
    { id: 'at-4', value: 'Monthly AMC (12 Services)' },
    { id: 'at-5', value: 'One-Time Service' },
  ],
  natureOfDocket: [
    { id: 'nd-1', value: 'AMC' },
    { id: 'nd-2', value: 'Repair' },
    { id: 'nd-3', value: 'Installation' },
    { id: 'nd-4', value: 'Warranty' },
    { id: 'nd-5', value: 'Inspection' },
    { id: 'nd-6', value: 'Maintenance' },
  ],
  docketStatus: [
    { id: 'ds-1', value: 'RUNNING' },
    { id: 'ds-2', value: 'COMPLETED' },
    { id: 'ds-3', value: 'CANCELLED' },
    { id: 'ds-4', value: 'PENDING' },
    { id: 'ds-5', value: 'CLOSED' },
  ],
  salePoints: [
    { id: 'slp-1', value: 'GET/SINTHI' },
    { id: 'slp-2', value: 'GET/PARK' },
    { id: 'slp-3', value: 'GET/LAKE' },
    { id: 'slp-4', value: 'GET/MG' },
    { id: 'slp-5', value: 'GET/THANE' },
    { id: 'slp-6', value: 'GET/KURLA' },
    { id: 'slp-7', value: 'GET/MALAD' },
    { id: 'slp-8', value: 'GET/POWAI' },
  ],
  salesExecutives: [
    { id: 'sxe-1', value: 'TULI' },
    { id: 'sxe-2', value: 'DALIA' },
    { id: 'sxe-3', value: 'SREYA' },
    { id: 'sxe-4', value: 'RITU' },
    { id: 'sxe-5', value: 'MONIKA' },
  ],
  modelNumbers: [
    { id: 'mn-1', value: 'KUTCHINA CLASSICO 60' },
    { id: 'mn-2', value: 'KUTCHINA CLASSICO 90' },
    { id: 'mn-3', value: 'KUTCHINA ELEGANTE 60' },
    { id: 'mn-4', value: 'KUTCHINA ELEGANTE 90' },
    { id: 'mn-5', value: 'KUTCHINA SUPREMO 60' },
    { id: 'mn-6', value: 'KUTCHINA SUPREMO 90' },
    { id: 'mn-7', value: 'KUTCHINA ROYALE 60' },
    { id: 'mn-8', value: 'KUTCHINA ROYALE 90' },
  ],
};

const categoryLabels: Record<MasterCategory, string> = {
  serviceEngineers: 'Service Engineers',
  serviceModes: 'Service Modes',
  paymentModes: 'Payment Modes',
  paymentTypes: 'Payment Types',
  spareNames: 'Spare Parts / Accessories',
  amcTypes: 'AMC Types',
  natureOfDocket: 'Nature of Docket',
  docketStatus: 'Docket Status',
  salePoints: 'Sale Points',
  salesExecutives: 'Sales Executives',
  modelNumbers: 'Model Numbers',
};

const STORAGE_KEY = 'masterSetupData';

export default function MasterSetupPage() {
  const [data, setData] = useState(initialData);
  const [activeCategory, setActiveCategory] = useState<MasterCategory>('serviceEngineers');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [newValue, setNewValue] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [addingNew, setAddingNew] = useState(false);
  const [showSpareModal, setShowSpareModal] = useState(false);
  const [spareModalName, setSpareModalName] = useState('');
  const [spareModalAmount, setSpareModalAmount] = useState<number>(0);
  const [editingSpareId, setEditingSpareId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge: keep initialData for any missing categories
        setData(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  const items = data[activeCategory];
  const isSpareCategory = activeCategory === 'spareNames';

  const handleEdit = (item: MasterItem) => {
    if (isSpareCategory) {
      setEditingSpareId(item.id);
      setSpareModalName(item.value);
      setSpareModalAmount(item.amount ?? 0);
      setShowSpareModal(true);
    } else {
      setEditingId(item.id);
      setEditValue(item.value);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    setData(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].map(item =>
        item.id === id ? { ...item, value: editValue.trim() } : item
      ),
    }));
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    setData(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter(item => item.id !== id),
    }));
  };

  const handleAdd = () => {
    if (!newValue.trim()) return;
    const newItem: MasterItem = {
      id: `${activeCategory}-${Date.now()}`,
      value: newValue.trim(),
      ...(isSpareCategory ? { amount: newAmount } : {}),
    };
    setData(prev => ({
      ...prev,
      [activeCategory]: [...prev[activeCategory], newItem],
    }));
    setNewValue('');
    setNewAmount(0);
    setAddingNew(false);
  };

  const handleSaveSpareModal = () => {
    if (!spareModalName.trim()) return;
    if (editingSpareId) {
      setData(prev => ({
        ...prev,
        spareNames: prev.spareNames.map(item =>
          item.id === editingSpareId ? { ...item, value: spareModalName.trim(), amount: spareModalAmount } : item
        ),
      }));
    } else {
      const newItem: MasterItem = {
        id: `sp-${Date.now()}`,
        value: spareModalName.trim(),
        amount: spareModalAmount,
      };
      setData(prev => ({ ...prev, spareNames: [...prev.spareNames, newItem] }));
    }
    setShowSpareModal(false);
    setSpareModalName('');
    setSpareModalAmount(0);
    setEditingSpareId(null);
    setAddingNew(false);
  };

  const handleExport = () => {
    const items = data[activeCategory];
    const exportData = items.map((item, idx) => ({
      'Sl No': idx + 1,
      'Value': item.value,
      ...(item.amount !== undefined ? { 'Amount (₹)': item.amount } : {}),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeCategory);
    XLSX.writeFile(wb, `master-setup-${activeCategory}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AppLayout title="Master Setup" subtitle="Configure dropdown options used across the application">
      <div className="flex gap-5">
        {/* Sidebar Categories */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
            </div>
            <nav className="py-2">
              {(Object.keys(categoryLabels) as MasterCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setEditingId(null); setAddingNew(false); setNewValue(''); setNewAmount(0); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  {categoryLabels[cat]}
                  <span className="ml-1 text-[10px] text-muted-foreground">({data[cat].length})</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-[15px] font-bold text-foreground">{categoryLabels[activeCategory]}</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">{items.length} items configured</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors"
                >
                  <Download size={13} /> Export Excel
                </button>
                <button
                  onClick={() => {
                    if (isSpareCategory) {
                      setEditingSpareId(null);
                      setSpareModalName('');
                      setSpareModalAmount(0);
                      setShowSpareModal(true);
                    } else {
                      setAddingNew(true);
                      setEditingId(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[12px] font-semibold hover:bg-primary/90 transition-all active:scale-95"
                >
                  <Plus size={13} /> Add New
                </button>
              </div>
            </div>

            <div className="p-5">
              {/* Add New Row (non-spare) */}
              {addingNew && !isSpareCategory && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <input
                    type="text"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder={`Enter new ${categoryLabels[activeCategory].toLowerCase()} name…`}
                    autoFocus
                    className="flex-1 px-3 py-2 bg-input border border-border rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                  />
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded text-[12px] font-semibold hover:bg-primary/90 transition-all"
                  >
                    <Save size={13} /> Save
                  </button>
                  <button
                    onClick={() => { setAddingNew(false); setNewValue(''); }}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                {isSpareCategory && (
                  <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <span className="col-span-1">#</span>
                    <span className="col-span-6">Spare Name</span>
                    <span className="col-span-3 text-right">Amount (₹)</span>
                    <span className="col-span-2 text-right">Actions</span>
                  </div>
                )}
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-[13px]">
                    No items yet. Click "Add New" to get started.
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group ${isSpareCategory ? 'grid grid-cols-12' : ''}`}
                    >
                      <span className={`text-[11px] text-muted-foreground text-right flex-shrink-0 ${isSpareCategory ? 'col-span-1' : 'w-6'}`}>{idx + 1}.</span>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                          autoFocus
                          className={`px-2 py-1 bg-input border border-primary rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-ring ${isSpareCategory ? 'col-span-6' : 'flex-1'}`}
                        />
                      ) : (
                        <span className={`text-[13px] text-foreground font-medium ${isSpareCategory ? 'col-span-6' : 'flex-1'}`}>{item.value}</span>
                      )}
                      {isSpareCategory && (
                        <span className="col-span-3 text-right text-[13px] font-semibold text-foreground">
                          ₹{(item.amount ?? 0).toFixed(2)}
                        </span>
                      )}
                      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSpareCategory ? 'col-span-2 justify-end' : ''}`}>
                        {editingId === item.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(item.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-green-100 text-green-600 transition-colors">
                              <Save size={13} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors">
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(item)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-warning/10 text-muted-foreground hover:text-warning transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spare Creation Modal */}
      {showSpareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-[#4a7fa5] text-white">
              <span className="text-sm font-bold flex items-center gap-2">🎁 SPARE CREATION</span>
              <button onClick={() => { setShowSpareModal(false); setEditingSpareId(null); }} className="hover:bg-white/20 rounded p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-2">Spare Name</label>
                <input
                  type="text"
                  value={spareModalName}
                  onChange={e => setSpareModalName(e.target.value)}
                  placeholder="Enter spare name"
                  className="w-full px-3 py-2.5 border-2 border-red-400 rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-red-300"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-foreground mb-2">Spare Amount</label>
                <input
                  type="number"
                  value={spareModalAmount}
                  onChange={e => setSpareModalAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 border border-border rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 px-6 py-4 bg-gray-50 border-t border-border">
              <button
                onClick={handleSaveSpareModal}
                className="px-10 py-2.5 bg-[#c0392b] text-white rounded font-bold text-[13px] hover:bg-[#a93226] transition-colors"
              >
                SAVE
              </button>
              <button
                onClick={() => { setShowSpareModal(false); setEditingSpareId(null); }}
                className="px-10 py-2.5 bg-gray-200 text-gray-600 rounded font-bold text-[13px] hover:bg-gray-300 transition-colors"
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
