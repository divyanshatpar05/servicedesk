'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';

interface Docket {
  id: string;
  slNo: number;
  docketNo: string;
  dateTime: string;
  customerName: string;
  mobileNo: string;
  model: string;
  natureOfDocket: string;
  status: string;
  isOverdue: boolean;
  cardNo: string;
  cardDetail: string;
  alternateMob: string;
  customerAddress: string;
  detail: string;
  feedback: string;
  salePoint: string;
  salesExecutive: string;
  customerZipcode: string;
  area: string;
  paymentType: string;
  totalAmount: number;
  paymentMode: string;
  sparePartAmount: number;
  serviceEngineer: string;
  serviceAmount?: number;
  otherCharges?: number;
  grandTotal?: number;
  spareItems?: SpareRow[];
  discount?: number;
  discountNote?: string;
}

interface SpareRow {
  id: string;
  spareName: string;
  note: string;
  qty: number;
  rate: number;
  total: number;
}

interface ServiceDateRow {
  srlNo: number;
  date: string;
  note: string;
  selected: boolean;
}

interface EditAllotmentModalProps {
  open: boolean;
  docket: Docket;
  onClose: () => void;
  onPrint: (docket: Docket) => void;
}

const serviceEngineers = ['PRITAM SARKAR', 'RAJAN K.', 'ARJUN M.', 'DEEPA V.', 'SUNIL P.', 'PRIYA S.', 'KAVITHA R.'];
const serviceModes = ['AMC', 'ASC DRY SERVICE', 'PAID SERVICE', 'WARRANTY SERVICE', 'FREE SERVICE', 'INSTALLATION'];
const serviceOptions = [
  { name: 'INSTALLATION CHARGES', amount: 699.00 },
  { name: 'AMC-SERVICE CHARGES ( WITHOUT SPARE )', amount: 1999.00 },
  { name: 'RE- INSTALLATION CHARGES', amount: 699.00 },
  { name: 'COMPLAIN ATTEND CHARGES', amount: 499.00 },
  { name: 'AMC SERVICE CHARGES ( WITH SPARE )', amount: 2999.00 },
  { name: 'PIPE-FITTINGS CHARGES', amount: 499.00 },
  { name: 'INSPECTION-CHARGES', amount: 299.00 },
  { name: 'PAID SERVICE ( NORMAL CLEANING )', amount: 799.00 },
  { name: 'AMC PAYMENT COLLECTION ( OFFICE )', amount: 1999.00 },
  { name: 'AMC PAYEMNT COLLECTION ( DIRECT )', amount: 1999.00 },
  { name: 'FREE SERVICE ( WARRANTY )', amount: 1.00 },
  { name: 'DISPLAY CHARGES', amount: 1.00 },
  { name: 'COMPLAIN ATTEND ( IW ) & INCUDING ALL', amount: 1.00 },
  { name: 'ASC DRY SERVICE', amount: 1.00 },
  { name: 'ASC COMPLAIN ATTEND', amount: 299.00 },
  { name: 'CHIMNEY DISMENTAL CHARGES', amount: 699.00 },
  { name: 'NEW ASC COLLETION', amount: 2000.00 },
  { name: 'MODULAR KITCHEN INSPECTION & SERVICE CH', amount: 500.00 },
  { name: 'PAID SERVICE ( DEEP CLEANING )', amount: 1500.00 },
  { name: 'DISPLAY', amount: 0.00 },
  { name: 'BAP ( PVC PIPE ADJUSTED )', amount: 1500.00 },
  { name: 'SAP ( PVC PIPE ADJUSTED )', amount: 1200.00 },
  { name: 'SPARE CHANGE ( INCLUDING ALL )', amount: 499.00 },
  { name: 'ASC SERVICE & COMPLAIN ATTEND', amount: 499.00 },
  { name: 'ASC SERVICE & SPARE FITTINGS', amount: 299.00 },
  { name: 'ASC DEEP CLEAN SERVICE', amount: 1.00 },
  { name: 'PAID SERVICE', amount: 799.00 },
  { name: 'AMC SERVICE CHARGES ( NORMAL + OPEN ) WITHOUT SPARE', amount: 2399.00 },
];
const paymentModes = ['Cash', 'Online', 'Bank Transfer', 'UPI', 'Cheque'];
const masterSpares = [
  { name: 'PVC PIPE', rate: 600 },
  { name: 'ALUMINIUM ANGEL', rate: 450 },
  { name: 'COWL', rate: 300 },
  { name: 'L-PIPE', rate: 70 },
  { name: 'ALLUMINIUM PATTY', rate: 400 },
  { name: 'STANZA RUBBER WASHER', rate: 130 },
  { name: 'FOIL PIPE FOC', rate: 0 },
  { name: 'PVC PIPE FOC', rate: 0 },
  { name: 'STANZA SMALL OIL CONTAINER', rate: 75 },
  { name: 'ARC SWITCH [3G] / NEW', rate: 483 },
  { name: 'ANGELA AUTO CLEAN CONTAINER', rate: 218 },
  { name: 'SCOTT / SILVIANO / LUXEN SWITCH SET', rate: 635 },
  { name: 'ARC 25W LAMP', rate: 35 },
  { name: 'ARC WATER CONTAINER', rate: 73 },
  { name: 'ARC CIRCUIT', rate: 1340 },
  { name: 'ARC HOLDER OF VENT PIPE', rate: 119 },
  { name: 'ARC OIL CHANNEL', rate: 63 },
  { name: 'ARC OIL CHANNEL RUBBER WASHER', rate: 26 },
  { name: 'VENTO CONDENSIR', rate: 240 },
  { name: 'EMILIA SMALL CONTANER', rate: 220 },
  { name: 'BLACK STAR 60 HYDROLIC MOTOR', rate: 914 },
  { name: 'STANZA ELBOW PIPE 1 PC', rate: 70 },
  { name: 'ARC FONT PANEL SWITCH-3G', rate: 485 },
  { name: 'Dezire circuit', rate: 945 },
  { name: 'Venisa 60 elbow pipe Price', rate: 52 },
  { name: 'Vento Motor Reparing Cost', rate: 2300 },
  { name: 'SMARTEC BIG OIL COLLOCTOR', rate: 420 },
  { name: 'VOGUE RUBBER WASHER', rate: 130 },
  { name: 'VOGUE CONDENSIR', rate: 142 },
  { name: 'STANZA (OLD ) MS/SS SWITCH REPARING COST', rate: 500 },
  { name: 'ROMANIA FASCHINO / SIGNIA CIRCUIT', rate: 791 },
  { name: 'ROMANIA / FASCHINO / SIGNIA SWITCH', rate: 692 },
  { name: 'ARC VAN CAP', rate: 55 },
  { name: 'TRENDY SWITCH WITH CIRCUT', rate: 815 },
  { name: 'ARC CONDENSIR', rate: 125 },
  { name: 'FLORENTINE CONDENSIR', rate: 125 },
  { name: 'ASTER CONDENSIR', rate: 125 },
  { name: 'FIEONA CONDENSIR', rate: 125 },
  { name: 'EIFFEL CONDENSIR', rate: 125 },
  { name: 'LATINO CONDENSIR', rate: 125 },
  { name: 'CRESTA CONDENSIR', rate: 125 },
  { name: 'TITAN CONDENSIR', rate: 125 },
  { name: 'VEGA CONDENSIR', rate: 125 },
  { name: 'DEZIRE CONDENSIR', rate: 125 },
  { name: 'VANISA CONDENSIR', rate: 125 },
  { name: 'ELEGANZA CONDENSIR', rate: 125 },
  { name: 'VITRARA CONSENSIR', rate: 125 },
  { name: 'VIOLA CONSENSIR', rate: 125 },
  { name: 'MOTOR REPARING', rate: 1500 },
  { name: 'VENTO- CONTAINER', rate: 1220 },
  { name: 'PVC PIPE ADJUST', rate: 500 },
  { name: 'TRENDY CONTAINER', rate: 372 },
  { name: 'BLACKSTAR OIL CONTAINER', rate: 356 },
  { name: 'VOGUE VANE', rate: 714 },
  { name: 'SANTAZA CONDENSIR', rate: 100 },
  { name: 'STANZA FRONT PANEL SWITCH', rate: 500 },
  { name: 'VENTO CIRCUIT', rate: 2442 },
  { name: 'VENTO SWITCH', rate: 1710 },
  { name: 'MOTOR REPAIR CHARGES ( IN WARRANTY )', rate: 0 },
  { name: 'PIPE DISCOUNT', rate: 500 },
  { name: 'CAPACITOR', rate: 75 },
  { name: 'VOGUE LAMP COVER', rate: 75 },
  { name: 'VOGUE LAMP', rate: 50 },
  { name: 'ELBOW PIPE', rate: 70 },
  { name: 'VENTO VANE CAP', rate: 55 },
  { name: 'VOGUE AUTO CLEAN SWITCH', rate: 105 },
  { name: 'FLORENTINE AUTO SWITCH', rate: 105 },
  { name: 'VOGUE BIG OIL COLLECTOR', rate: 528 },
  { name: 'VANTO-90 HOOD', rate: 1466 },
  { name: 'STANZA REPARING AMOUNT', rate: 500 },
  { name: 'STANZA CIRCUIT', rate: 500 },
  { name: 'STANZA CIRCUIT REPARING', rate: 500 },
  { name: 'FLORA CIRCUIT', rate: 500 },
  { name: 'ALLUMINIUM PIPE ( BAP ) PVC PIPE RETURN', rate: 2000 },
  { name: 'ALLUMINIUM PIPE ( BAP ) PVC PIPE ADJUST', rate: 1500 },
  { name: 'ALLUMINIUM PIPE ( SAP ) PVC PIPE ADJUST', rate: 1300 },
  { name: 'ALLUMINIUM PIPE ( SAP ) PVC PIPE RETURN', rate: 1800 },
  { name: 'PVC PIPE RETURN', rate: 400 },
  { name: 'BAP', rate: 2000 },
  { name: 'SAP', rate: 1800 },
  { name: 'VEGA DLX -60 (I) HOOD', rate: 885 },
  { name: 'STANZA BIG CONTAINER', rate: 196 },
  { name: 'BRIO CONDENSR', rate: 100 },
  { name: 'FLORA BIG CONTAINER', rate: 200 },
  { name: 'ALLUMINIUM PIPE ( BAP )', rate: 2000 },
  { name: 'ALLUMINIUM PIPE ( SAP )', rate: 1800 },
  { name: 'DISCOUNT', rate: 500 },
  { name: 'SMART ELBOW PIPE', rate: 70 },
  { name: 'STANZA CONDENSOR', rate: 100 },
  { name: 'VISTA OIL COLLECOR', rate: 100 },
  { name: 'STANZA LAMP', rate: 333 },
  { name: 'Multitech set (86/500) - per set', rate: 1500 },
  { name: 'VEGA DLX ( I )', rate: 850 },
  { name: 'VEGA DLX ( i ) CENSOR', rate: 339 },
];
const workingStatuses = ['WORK NOT DONE', 'WORK IN PROGRESS', 'WORK DONE', 'PARTS PENDING'];
const amcCollectionModes = ['Cash', 'Online', 'Bank Transfer', 'UPI', 'Cheque'];
const amcTypeOptions = ['AMC without spare', 'AMC with spare', 'Comprehensive AMC', 'Non-Comprehensive AMC'];
const serviceDurationOptions = ['3 Month Duration', '4 Month Duration', '6 Month Duration'];
const serviceNoOptions = ['1', '2', '3', '4', '5', '6'];

function generateAMCRefNo(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function addMonths(dateStr: string, months: number): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function formatDateDMY(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
}

function generateServiceDates(startDate: string, duration: string, totalServices: number): ServiceDateRow[] {
  if (!startDate || !totalServices) return [];
  const monthsInterval = duration.startsWith('3') ? 3 : duration.startsWith('4') ? 4 : duration.startsWith('6') ? 6 : 3;
  const rows: ServiceDateRow[] = [];
  for (let i = 0; i < totalServices; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + monthsInterval * (i + 1));
    rows.push({
      srlNo: i + 1,
      date: formatDateDMY(d.toISOString().split('T')[0]),
      note: '',
      selected: i === 0,
    });
  }
  return rows;
}

function saveSpareAdjustmentAsInward(spareName: string, rate: number) {
  if (!spareName) return;
  try {
    const STORAGE_KEY_INWARD = 'spareInwardRecords';
    const stored = localStorage.getItem(STORAGE_KEY_INWARD);
    const records = stored ? JSON.parse(stored) : [];
    const maxRef = records.length > 0 ? Math.max(...records.map((r: { refNo: number }) => r.refNo)) : 248;
    const newRecord = {
      id: Date.now().toString(),
      refNo: maxRef + 1,
      adjustmentNote: 'Spare Adjustment Return (from Invoice)',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      items: [{ id: '1', slNo: 1, spareName, qty: 1, rate, total: rate }],
      spareTotal: rate,
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEY_INWARD, JSON.stringify(records));
  } catch { }
}

export default function EditAllotmentModal({ open, docket, onClose, onPrint }: EditAllotmentModalProps) {
  const [serviceEngineer, setServiceEngineer] = useState(docket.serviceEngineer || '');
  const [serviceMode, setServiceMode] = useState(docket.natureOfDocket || '');
  const [selectedService, setSelectedService] = useState(docket.paymentType || '');
  const [serviceAmount, setServiceAmount] = useState(String(docket.serviceAmount ?? docket.totalAmount ?? 0));
  const [paymentMode, setPaymentMode] = useState(docket.paymentMode || '');
  const [allotmentDate, setAllotmentDate] = useState(docket.dateTime?.split(' ')[0] || '');
  const [allotmentTime, setAllotmentTime] = useState(docket.dateTime?.split(' ')[1] || '');
  const [spares, setSpares] = useState<SpareRow[]>(
    docket.spareItems && docket.spareItems.length > 0
      ? docket.spareItems
      : [{ id: 'sp-1', spareName: '', note: '', qty: 1, rate: 0, total: 0 }]
  );
  const [otherCharges, setOtherCharges] = useState(String(docket.otherCharges ?? 0));
  const [otherChargesNote, setOtherChargesNote] = useState('');
  const [discount, setDiscount] = useState('0');
  const [discountNote, setDiscountNote] = useState('');
  const [cashPaymentNote, setCashPaymentNote] = useState('');
  const [cashPaymentAmt, setCashPaymentAmt] = useState('0.00');
  const [bankPaymentNote, setBankPaymentNote] = useState('');
  const [bankPaymentAmt, setBankPaymentAmt] = useState('0.00');
  const [onlinePaymentNote, setOnlinePaymentNote] = useState('');
  const [onlinePaymentAmt, setOnlinePaymentAmt] = useState('0.00');
  const [remarks, setRemarks] = useState('');
  const [officeExecutive, setOfficeExecutive] = useState('DALIA');
  const [modularKitchen, setModularKitchen] = useState('');
  const [officeAttenBy, setOfficeAttenBy] = useState('SREYA');
  const [currentServiceNo, setCurrentServiceNo] = useState(`3|${docket.dateTime?.split(' ')[0] || ''}`);
  const [workingStatus, setWorkingStatus] = useState('WORK NOT DONE');
  const [saving, setSaving] = useState(false);

  // AMC Section State
  const [amcNextServiceNo, setAmcNextServiceNo] = useState('');
  const [amcNoOfService, setAmcNoOfService] = useState('1');
  const [amcNextServiceDate, setAmcNextServiceDate] = useState('');
  const [amcServiceGiven, setAmcServiceGiven] = useState('YES');
  const [amcStartDate, setAmcStartDate] = useState('');
  const [amcExpDate, setAmcExpDate] = useState('');
  const [amcTotalServices, setAmcTotalServices] = useState('3');
  const [amcServiceDuration, setAmcServiceDuration] = useState('4 Month Duration');
  const [amcCollectionDate, setAmcCollectionDate] = useState('');
  const [amcRefNo] = useState(generateAMCRefNo());
  const [amcDoneBy, setAmcDoneBy] = useState('');
  const [amcAmount, setAmcAmount] = useState('0.00');
  const [amcCollectionMode, setAmcCollectionMode] = useState('Cash');
  const [amcType, setAmcType] = useState('AMC without spare');
  const [amcCollectedBy, setAmcCollectedBy] = useState('');
  const [amcServiceDurationYear, setAmcServiceDurationYear] = useState('1 Year');
  const [serviceDateRows, setServiceDateRows] = useState<ServiceDateRow[]>([]);

  // Spare Adjustment State
  const [adjSpareName, setAdjSpareName] = useState('');
  const [adjSpareField2, setAdjSpareField2] = useState('');
  const [adjSpareField3, setAdjSpareField3] = useState('');
  const [adjSpareField4, setAdjSpareField4] = useState('');
  const [amcChargesType, setAmcChargesType] = useState('');
  const [amcChargesAmount, setAmcChargesAmount] = useState('0.00');
  const [othersChargesType, setOthersChargesType] = useState('');
  const [othersChargesAmount, setOthersChargesAmount] = useState('0.00');
  const [othersChargesType1, setOthersChargesType1] = useState('');
  const [othersChargesAmount1, setOthersChargesAmount1] = useState('0.00');

  // Regenerate service dates when relevant AMC fields change
  useEffect(() => {
    if (amcStartDate && amcTotalServices && amcServiceDuration) {
      const rows = generateServiceDates(amcStartDate, amcServiceDuration, Number(amcTotalServices));
      setServiceDateRows(rows);
      if (rows.length > 0) {
        setAmcNextServiceDate(rows[0].date.split('-').reverse().join('-'));
      }
    }
  }, [amcStartDate, amcTotalServices, amcServiceDuration]);

  // Auto-set AMC exp date (1 year from start)
  useEffect(() => {
    if (amcStartDate) {
      setAmcExpDate(addMonths(amcStartDate, 12));
      setAmcCollectionDate(amcStartDate);
    }
  }, [amcStartDate]);

  if (!open) return null;

  const spareTotal = spares.reduce((sum, s) => sum + s.total, 0);
  const grandTotal = (Number(serviceAmount) || 0) + spareTotal + (Number(otherCharges) || 0) - (Number(discount) || 0);

  const updateSpare = (id: string, field: keyof SpareRow, value: string | number) => {
    setSpares(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === 'spareName') {
        const master = masterSpares.find(m => m.name === value);
        if (master) {
          updated.rate = master.rate;
          updated.total = Number(updated.qty) * master.rate;
        }
      }
      if (field === 'qty' || field === 'rate') {
        updated.total = Number(updated.qty) * Number(updated.rate);
      }
      return updated;
    }));
  };

  const addSpareRow = () => {
    setSpares(prev => [...prev, { id: `sp-${Date.now()}`, spareName: '', note: '', qty: 1, rate: 0, total: 0 }]);
  };

  const removeSpare = (id: string) => {
    setSpares(prev => prev.filter(s => s.id !== id));
  };

  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
    const found = serviceOptions.find(s => s.name === serviceName);
    if (found) {
      setServiceAmount(found.amount.toFixed(2));
    }
  };

  const handleUpdate = () => {
    // Save spare adjustment as stock inward if spare name is set
    if (adjSpareName) {
      const master = masterSpares.find(m => m.name === adjSpareName);
      saveSpareAdjustmentAsInward(adjSpareName, master?.rate ?? 0);
      toast.success(`Spare adjustment for "${adjSpareName}" saved as Stock Inward entry.`);
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Allotment entry updated successfully!');
      onClose();
    }, 1000);
  };

  const inputCls = "w-full px-2 py-1.5 bg-input border border-border rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all";
  const selectCls = "w-full px-2 py-1.5 bg-white border border-border rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all appearance-auto";
  const labelCls = "block text-[11px] font-semibold text-foreground mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#4a7fa5] text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">🏠 EDIT ALLOTMENT ENTRY PANEL</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Info Panels */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border rounded p-3 bg-blue-50">
              <div className="text-[11px] font-bold text-white bg-cyan-500 px-2 py-1 rounded mb-2 inline-block">DOCKET DETAIL</div>
              <div className="space-y-1 text-[12px]">
                <p><span className="font-semibold">Docket No:-</span> {docket.docketNo}</p>
                <p><span className="font-semibold">Date &amp; Time:-</span> {docket.dateTime}</p>
                <p><span className="font-semibold">Card No. &amp; Detail:-</span> {docket.cardNo} {docket.cardDetail}</p>
              </div>
            </div>
            <div className="border border-border rounded p-3 bg-blue-50">
              <div className="text-[11px] font-bold text-white bg-blue-600 px-2 py-1 rounded mb-2 inline-block">CUSTOMER DETAIL</div>
              <div className="space-y-1 text-[12px]">
                <p><span className="font-semibold">Customer Name:-</span> {docket.customerName}</p>
                <p><span className="font-semibold">Mobile No:-</span> {docket.mobileNo}{docket.alternateMob ? `/${docket.alternateMob}` : ''}</p>
                <p><span className="font-semibold">Address:-</span> {docket.customerAddress}</p>
              </div>
            </div>
            <div className="border border-border rounded p-3 bg-red-50">
              <div className="text-[11px] font-bold text-white bg-red-500 px-2 py-1 rounded mb-2 inline-block">PRODUCT DETAIL</div>
              <div className="space-y-1 text-[12px]">
                <p><span className="font-semibold">Model No:-</span> {docket.model}</p>
                <p><span className="font-semibold">Sale Point:-</span> {docket.salePoint}</p>
                <p><span className="font-semibold">Sales Executive:-</span> {docket.salesExecutive}</p>
              </div>
            </div>
          </div>

          {/* Service Fields Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className={labelCls}>Service Engineer</label>
              <select value={serviceEngineer} onChange={e => setServiceEngineer(e.target.value)} className={selectCls}>
                <option value="">Select Engineer</option>
                {serviceEngineers.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Service Mode</label>
              <select value={serviceMode} onChange={e => setServiceMode(e.target.value)} className={selectCls}>
                <option value="">Select Mode</option>
                {serviceModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Payment Mode</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className={selectCls}>
                <option value="">Select Payment Mode</option>
                {paymentModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Allotment Date</label>
              <input type="date" value={allotmentDate} onChange={e => setAllotmentDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Allotment Time</label>
              <input type="time" value={allotmentTime} onChange={e => setAllotmentTime(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Service Selection & Amount */}
          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
            <h3 className="text-[12px] font-bold text-blue-800 mb-2 uppercase tracking-wide">Service Charge</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Select Service / Payment Type</label>
                <select
                  value={selectedService}
                  onChange={e => handleServiceSelect(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border-2 border-blue-400 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all appearance-auto"
                >
                  <option value="">-- Select Service --</option>
                  {serviceOptions.map(s => (
                    <option key={s.name} value={s.name}>{s.name} — ₹{s.amount.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Service Amount (₹)</label>
                <input
                  type="number"
                  value={serviceAmount}
                  onChange={e => setServiceAmount(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border-2 border-blue-400 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-400 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Spares Table */}
          <div className="border border-green-200 rounded-lg overflow-hidden">
            <div className="bg-green-600 px-3 py-2">
              <h3 className="text-[12px] font-bold text-white uppercase tracking-wide">Spare Parts</h3>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2 text-left font-semibold w-10">Sl.</th>
                  <th className="px-2 py-2 text-left font-semibold">Spare Name</th>
                  <th className="px-2 py-2 text-left font-semibold">Note</th>
                  <th className="px-2 py-2 text-left font-semibold w-16">Qty</th>
                  <th className="px-2 py-2 text-left font-semibold w-24">Rate (₹)</th>
                  <th className="px-2 py-2 text-right font-semibold w-24">Total (₹)</th>
                  <th className="px-2 py-2 text-center font-semibold w-12 bg-red-500 text-white">Del</th>
                </tr>
              </thead>
              <tbody>
                {spares.map((spare, idx) => (
                  <tr key={spare.id} className="border-t border-border">
                    <td className="px-2 py-1.5 text-muted-foreground">{idx + 1}.</td>
                    <td className="px-2 py-1.5">
                      <select
                        value={spare.spareName}
                        onChange={e => updateSpare(spare.id, 'spareName', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-border rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-ring appearance-auto"
                      >
                        <option value="">-- Select Spare --</option>
                        {masterSpares.map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={spare.note} onChange={e => updateSpare(spare.id, 'note', e.target.value)} className={inputCls} placeholder="Note" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" min={1} value={spare.qty} onChange={e => updateSpare(spare.id, 'qty', Number(e.target.value))} className={inputCls} />
                    </td>
                    <td className="px-2 py-1.5">
                      <input type="number" value={spare.rate} onChange={e => updateSpare(spare.id, 'rate', Number(e.target.value))} className={`${inputCls} bg-yellow-50`} />
                    </td>
                    <td className="px-2 py-1.5 font-mono font-semibold text-right text-green-700">₹{spare.total.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-center">
                      <button onClick={() => removeSpare(spare.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-green-300 bg-green-50">
                  <td colSpan={5} className="px-2 py-2 font-bold text-[12px] text-green-800">Spare Parts Total</td>
                  <td className="px-2 py-2 font-mono font-bold text-right text-green-800">₹{spareTotal.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className="px-3 py-2 border-t border-green-200 bg-green-50">
              <button onClick={addSpareRow} className="flex items-center gap-1 text-[11px] text-green-700 hover:text-green-900 font-semibold transition-colors">
                <Plus size={12} /> Add Spare Row
              </button>
            </div>
          </div>

          {/* Payment breakdown rows */}
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-[12px]">
              <tbody>
                <tr className="border-b border-border bg-yellow-50">
                  <td colSpan={2} className="px-3 py-2 font-semibold">Cash Payment</td>
                  <td className="px-2 py-1.5 w-48"><input value={cashPaymentNote} onChange={e => setCashPaymentNote(e.target.value)} placeholder="Note If Any" className={inputCls} /></td>
                  <td className="px-2 py-1.5 w-32"><input type="number" value={cashPaymentAmt} onChange={e => setCashPaymentAmt(e.target.value)} className={inputCls} /></td>
                </tr>
                <tr className="border-b border-border bg-yellow-50">
                  <td colSpan={2} className="px-3 py-2 font-semibold">Bank Payment</td>
                  <td className="px-2 py-1.5"><input value={bankPaymentNote} onChange={e => setBankPaymentNote(e.target.value)} placeholder="Note If Any" className={inputCls} /></td>
                  <td className="px-2 py-1.5"><input type="number" value={bankPaymentAmt} onChange={e => setBankPaymentAmt(e.target.value)} className={inputCls} /></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td colSpan={2} className="px-3 py-2 font-semibold">Online Payment</td>
                  <td className="px-2 py-1.5"><input value={onlinePaymentNote} onChange={e => setOnlinePaymentNote(e.target.value)} placeholder="Note If Any" className={inputCls} /></td>
                  <td className="px-2 py-1.5"><input type="number" value={onlinePaymentAmt} onChange={e => setOnlinePaymentAmt(e.target.value)} className={inputCls} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total Summary */}
          <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-3 py-2">
              <h3 className="text-[12px] font-bold text-white uppercase tracking-wide">Amount Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-border">
              <div className="p-3 bg-blue-50 text-center">
                <div className="text-[10px] font-semibold text-blue-600 uppercase mb-1">Service Amount</div>
                <div className="text-[18px] font-bold text-blue-800">₹{(Number(serviceAmount) || 0).toFixed(2)}</div>
                <div className="text-[10px] text-blue-500 mt-0.5 truncate">{selectedService || '—'}</div>
              </div>
              <div className="p-3 bg-green-50 text-center">
                <div className="text-[10px] font-semibold text-green-600 uppercase mb-1">Spare Parts Amount</div>
                <div className="text-[18px] font-bold text-green-800">₹{spareTotal.toFixed(2)}</div>
                <div className="text-[10px] text-green-500 mt-0.5">{spares.filter(s => s.spareName).length} item(s)</div>
              </div>
              <div className="p-3 bg-orange-50 text-center">
                <div className="text-[10px] font-semibold text-orange-600 uppercase mb-1">Other Charges</div>
                <input type="number" value={otherCharges} onChange={e => setOtherCharges(e.target.value)} className="w-full text-center text-[16px] font-bold text-orange-800 bg-transparent border-b-2 border-orange-300 focus:outline-none focus:border-orange-500 py-1" placeholder="0.00" />
                <input value={otherChargesNote} onChange={e => setOtherChargesNote(e.target.value)} placeholder="Note (optional)" className="w-full text-[10px] text-orange-500 bg-transparent border-none focus:outline-none text-center mt-0.5" />
              </div>
              <div className="p-3 bg-red-50 text-center">
                <div className="text-[10px] font-semibold text-red-600 uppercase mb-1">Discount (−)</div>
                <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full text-center text-[16px] font-bold text-red-700 bg-transparent border-b-2 border-red-300 focus:outline-none focus:border-red-500 py-1" placeholder="0.00" />
                <input value={discountNote} onChange={e => setDiscountNote(e.target.value)} placeholder="Reason (optional)" className="w-full text-[10px] text-red-400 bg-transparent border-none focus:outline-none text-center mt-0.5" />
              </div>
              <div className="p-3 bg-gray-800 text-center">
                <div className="text-[10px] font-semibold text-gray-300 uppercase mb-1">Grand Total</div>
                <div className="text-[20px] font-bold text-white">₹{grandTotal.toFixed(2)}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Service + Spare + Other − Discount</div>
              </div>
            </div>
          </div>

          {/* Bottom Fields */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className={labelCls}>Remarks If Any.</label>
              <input value={remarks} onChange={e => setRemarks(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Office Executive</label>
              <input value={officeExecutive} onChange={e => setOfficeExecutive(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Modular Kitchen Corr.</label>
              <input value={modularKitchen} onChange={e => setModularKitchen(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Office Atten By.</label>
              <input value={officeAttenBy} onChange={e => setOfficeAttenBy(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Current Service Number</label>
              <input value={currentServiceNo} onChange={e => setCurrentServiceNo(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Working Status</label>
              <select value={workingStatus} onChange={e => setWorkingStatus(e.target.value)} className={selectCls}>
                {workingStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ===== AMC SECTION ===== */}
          <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
            <div className="bg-blue-600 px-4 py-2">
              <h3 className="text-[13px] font-bold text-white uppercase tracking-wide">AMC Details</h3>
            </div>
            <div className="p-4 space-y-4 bg-blue-50/30">
              {/* Row 1: Next Service Detail, No of Service, Next Service Date, AMC Service Given */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Next Service Detail</label>
                  <select value={amcNextServiceNo} onChange={e => setAmcNextServiceNo(e.target.value)} className="w-full px-2 py-1.5 bg-white border-2 border-red-400 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-red-400 appearance-auto">
                    <option value="">Select Service No</option>
                    {serviceNoOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>No Of Service</label>
                  <input type="number" value={amcNoOfService} onChange={e => setAmcNoOfService(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Next Service Date</label>
                  <input type="date" value={amcNextServiceDate} onChange={e => setAmcNextServiceDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>AMC Service Given</label>
                  <select value={amcServiceGiven} onChange={e => setAmcServiceGiven(e.target.value)} className={selectCls}>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
              </div>

              {/* Row 2: AMC Start Date, AMC Exp Date, Total No of Service, Service Duration, AMC Collection Date */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={labelCls}>AMC Start. Date.</label>
                  <input type="date" value={amcStartDate} onChange={e => setAmcStartDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>AMC Exp. Date.</label>
                  <input type="date" value={amcExpDate} onChange={e => setAmcExpDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Total No Of Service</label>
                  <input type="number" value={amcTotalServices} onChange={e => setAmcTotalServices(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Service Duration</label>
                  <select value={amcServiceDuration} onChange={e => setAmcServiceDuration(e.target.value)} className={selectCls}>
                    {serviceDurationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>AMC Collection Date</label>
                  <input type="date" value={amcCollectionDate} onChange={e => setAmcCollectionDate(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Row 3: AMC Ref No, AMC Done By, AMC Amount, AMC Collection Mode, AMC Type, Collected By */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div>
                  <label className={labelCls}>AMC Ref No.</label>
                  <input value={amcRefNo} readOnly className={`${inputCls} bg-gray-100 font-mono font-bold`} />
                </div>
                <div>
                  <label className={labelCls}>AMC Done By</label>
                  <input value={amcDoneBy} onChange={e => setAmcDoneBy(e.target.value)} className={inputCls} placeholder="e.g. SWARNALI" />
                </div>
                <div>
                  <label className={labelCls}>AMC Amount</label>
                  <input type="number" value={amcAmount} onChange={e => setAmcAmount(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>AMC Collection Mode</label>
                  <select value={amcCollectionMode} onChange={e => setAmcCollectionMode(e.target.value)} className={selectCls}>
                    {amcCollectionModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>AMC Type</label>
                  <select value={amcType} onChange={e => setAmcType(e.target.value)} className={selectCls}>
                    {amcTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Collected By</label>
                  <input value={amcCollectedBy} onChange={e => setAmcCollectedBy(e.target.value)} className={inputCls} placeholder="e.g. SUBHASH DAS" />
                </div>
              </div>

              {/* Service Duration Year */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div>
                  <label className={labelCls}>Service Duration Year</label>
                  <input value={amcServiceDurationYear} onChange={e => setAmcServiceDurationYear(e.target.value)} className={inputCls} placeholder="e.g. 1 Year" />
                </div>
              </div>

              {/* Allocate Service Date Table */}
              {serviceDateRows.length > 0 && (
                <div>
                  <div className="border-t-2 border-green-500 pt-3">
                    <h4 className="text-[13px] font-bold text-center text-foreground mb-3">Allocate Service Date</h4>
                    <div className="border border-green-400 rounded overflow-hidden">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-gray-50 border-b border-green-400">
                            <th className="px-3 py-2 text-left font-bold w-20">Srl No.</th>
                            <th className="px-3 py-2 text-left font-bold w-36">Date</th>
                            <th className="px-3 py-2 text-left font-bold">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceDateRows.map((row, idx) => (
                            <tr key={idx} className="border-b border-green-200 hover:bg-green-50/50">
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="serviceDate"
                                    checked={row.selected}
                                    onChange={() => setServiceDateRows(prev => prev.map((r, i) => ({ ...r, selected: i === idx })))}
                                    className="accent-blue-600"
                                  />
                                  <span className="font-semibold">{row.srlNo}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 font-mono">{row.date}</td>
                              <td className="px-3 py-2">
                                <input
                                  value={row.note}
                                  onChange={e => setServiceDateRows(prev => prev.map((r, i) => i === idx ? { ...r, note: e.target.value } : r))}
                                  className="w-full px-2 py-1 border border-green-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                                  placeholder="Note..."
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">* Dates auto-generated based on AMC Start Date and Service Duration interval</p>
                  </div>
                </div>
              )}
              {!serviceDateRows.length && amcStartDate && (
                <p className="text-[11px] text-muted-foreground italic">Set AMC Start Date, Total Services and Duration to auto-generate service dates.</p>
              )}
              {!amcStartDate && (
                <p className="text-[11px] text-muted-foreground italic">Set AMC Start Date to generate the Allocate Service Date table.</p>
              )}
            </div>
          </div>

          {/* ===== SPARE ADJUSTMENT SECTION ===== */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-[14px] font-semibold text-foreground">Spare Adjustment</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">For spare returns — entry will be auto-added to Stock Inward</p>
            </div>
            <div className="p-4 space-y-3">
              {/* Spare Name Row — 4 fields */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <select
                    value={adjSpareName}
                    onChange={e => setAdjSpareName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-border rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-ring appearance-auto"
                  >
                    <option value="">Enter Spare Name</option>
                    {masterSpares.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <input value={adjSpareField2} onChange={e => setAdjSpareField2(e.target.value)} className={inputCls} placeholder="" />
                </div>
                <div>
                  <input value={adjSpareField3} onChange={e => setAdjSpareField3(e.target.value)} className={inputCls} placeholder="" />
                </div>
                <div>
                  <input value={adjSpareField4} onChange={e => setAdjSpareField4(e.target.value)} className={`${inputCls} bg-gray-100`} placeholder="" />
                </div>
              </div>

              {/* AMC Charges Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Amc Charges Type .</label>
                  <input value={amcChargesType} onChange={e => setAmcChargesType(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Amc Charges Amount .</label>
                  <input type="number" value={amcChargesAmount} onChange={e => setAmcChargesAmount(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Others Charges Row */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Others Charges Type.</label>
                  <input value={othersChargesType} onChange={e => setOthersChargesType(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Others Charges Amount.</label>
                  <input type="number" value={othersChargesAmount} onChange={e => setOthersChargesAmount(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Others Charges Type 1.</label>
                  <input value={othersChargesType1} onChange={e => setOthersChargesType1(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Others Charges Amount 1.</label>
                  <input type="number" value={othersChargesAmount1} onChange={e => setOthersChargesAmount1(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-cyan-500 text-white rounded font-semibold text-[13px] hover:bg-cyan-600 disabled:opacity-70 transition-all active:scale-95"
            >
              {saving ? <><Loader2 size={13} className="animate-spin" /> Updating…</> : 'UPDATE'}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-red-500 text-white rounded font-semibold text-[13px] hover:bg-red-600 transition-all active:scale-95"
            >
              CANCEL
            </button>
            <button
              onClick={() => onPrint({
                ...docket,
                serviceEngineer,
                paymentType: selectedService,
                paymentMode,
                serviceAmount: Number(serviceAmount),
                totalAmount: Number(serviceAmount),
                sparePartAmount: spareTotal,
                otherCharges: Number(otherCharges),
                grandTotal,
                spareItems: spares.filter(s => s.spareName),
                discount: Number(discount),
                discountNote,
              })}
              className="px-8 py-2.5 bg-blue-600 text-white rounded font-semibold text-[13px] hover:bg-blue-700 transition-all active:scale-95"
            >
              PRINT INVOICE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
