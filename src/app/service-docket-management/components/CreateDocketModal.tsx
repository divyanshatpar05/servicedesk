'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';

interface DocketFormData {
  docketNo: string;
  cardNo: string;
  cardDetail: string;
  date: string;
  time: string;
  customerName: string;
  mobileNo: string;
  alternateMobNo: string;
  customerAddress: string;
  modelNo: string;
  natureOfDocket: string;
  detail: string;
  reminder1: string;
  docketStatus: string;
  feedback: string;
  salePoint: string;
  salesExecutive: string;
  customerZipcode: string;
}

interface CreateDocketModalProps {
  open: boolean;
  onClose: () => void;
  onDocketCreated?: (data: DocketFormData) => void;
}

const defaultModelNumbers = [
  'KUTCHINA CLASSICO 60',
  'KUTCHINA CLASSICO 90',
  'KUTCHINA ELEGANTE 60',
  'KUTCHINA ELEGANTE 90',
  'KUTCHINA SUPREMO 60',
  'KUTCHINA SUPREMO 90',
  'KUTCHINA ROYALE 60',
  'KUTCHINA ROYALE 90',
];

const natureOfDocketOptions = ['AMC', 'Repair', 'Installation', 'Warranty', 'Inspection', 'Maintenance'];
const docketStatusOptions = ['RUNNING', 'COMPLETED', 'CANCELLED', 'PENDING', 'CLOSED'];

function generateDocketNo(): string {
  const base = 100000000 + Math.floor(Math.random() * 899999999);
  return String(base);
}

function getTodayDate(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getCurrentTime(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function CreateDocketModal({ open, onClose, onDocketCreated }: CreateDocketModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [modelNumberOptions, setModelNumberOptions] = useState<string[]>(defaultModelNumbers);
  const [form, setForm] = useState<DocketFormData>({
    docketNo: generateDocketNo(),
    cardNo: '',
    cardDetail: '',
    date: getTodayDate(),
    time: getCurrentTime(),
    customerName: '',
    mobileNo: '',
    alternateMobNo: '',
    customerAddress: '',
    modelNo: '',
    natureOfDocket: '',
    detail: '',
    reminder1: '',
    docketStatus: 'RUNNING',
    feedback: '',
    salePoint: '',
    salesExecutive: '',
    customerZipcode: '',
  });

  // Load model numbers from Master Setup (localStorage) when modal opens
  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('masterSetupData');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.modelNumbers && Array.isArray(parsed.modelNumbers) && parsed.modelNumbers.length > 0) {
            setModelNumberOptions(parsed.modelNumbers.map((item: { value: string }) => item.value));
          }
        }
      } catch {
        // fallback to defaults
      }
    }
  }, [open]);

  const handleChange = (field: keyof DocketFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.customerName.trim()) { toast.error('Customer Name is required'); return; }
    if (!form.mobileNo.trim()) { toast.error('Mobile No. is required'); return; }
    if (!form.modelNo.trim()) { toast.error('Model No. is required'); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Docket #${form.docketNo} created successfully!`);
      if (onDocketCreated) onDocketCreated(form);
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setForm({
      docketNo: generateDocketNo(),
      cardNo: '',
      cardDetail: '',
      date: getTodayDate(),
      time: getCurrentTime(),
      customerName: '',
      mobileNo: '',
      alternateMobNo: '',
      customerAddress: '',
      modelNo: '',
      natureOfDocket: '',
      detail: '',
      reminder1: '',
      docketStatus: 'RUNNING',
      feedback: '',
      salePoint: '',
      salesExecutive: '',
      customerZipcode: '',
    });
    onClose();
  };

  const inputCls = "w-full px-3 py-2 bg-input border border-border rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all";
  const labelCls = "block text-[12px] font-semibold text-foreground mb-1";

  return (
    <Modal open={open} onClose={handleClose} title="DOCKET CREATION" size="xl">
      <div className="space-y-5">
        {/* Row 1: Docket No, Card No, Card Detail, Date & Time */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Docket No</label>
            <input
              value={form.docketNo}
              readOnly
              className={`${inputCls} bg-muted/50 text-muted-foreground cursor-not-allowed`}
              placeholder="System Generate"
            />
          </div>
          <div>
            <label className={labelCls}>Card No</label>
            <input
              value={form.cardNo}
              onChange={e => handleChange('cardNo', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Card Detail</label>
            <input
              value={form.cardDetail}
              onChange={e => handleChange('cardDetail', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Date &amp; Time</label>
            <div className="flex gap-1">
              <input
                type="date"
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <input
                type="time"
                value={form.time}
                onChange={e => handleChange('time', e.target.value)}
                className={`${inputCls} w-24`}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Customer Name, Mobile No, Alternate Mob No, Customer Address */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Customer Name <span className="text-danger">*</span></label>
            <input
              value={form.customerName}
              onChange={e => handleChange('customerName', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Mobile No. <span className="text-danger">*</span></label>
            <input
              value={form.mobileNo}
              onChange={e => handleChange('mobileNo', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Alternate Mob No</label>
            <input
              value={form.alternateMobNo}
              onChange={e => handleChange('alternateMobNo', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Customer Address</label>
            <input
              value={form.customerAddress}
              onChange={e => handleChange('customerAddress', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 3: Model No (dropdown), Nature of Docket, Detail, Reminder 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Model No <span className="text-danger">*</span></label>
            <select
              value={form.modelNo}
              onChange={e => handleChange('modelNo', e.target.value)}
              className={inputCls}
            >
              <option value="">Select Model No</option>
              {modelNumberOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Nature Of Docket</label>
            <select
              value={form.natureOfDocket}
              onChange={e => handleChange('natureOfDocket', e.target.value)}
              className={inputCls}
            >
              <option value="">Select Docket Type</option>
              {natureOfDocketOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Detail</label>
            <input
              value={form.detail}
              onChange={e => handleChange('detail', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Reminder 1</label>
            <input
              value={form.reminder1}
              onChange={e => handleChange('reminder1', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Row 4: Docket Status, Feedback, Sale Point, Sales Executive + Customer Zipcode */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Docket Status</label>
            <select
              value={form.docketStatus}
              onChange={e => handleChange('docketStatus', e.target.value)}
              className={inputCls}
            >
              {docketStatusOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Feedback</label>
            <input
              value={form.feedback}
              onChange={e => handleChange('feedback', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Sale Point</label>
            <input
              value={form.salePoint}
              onChange={e => handleChange('salePoint', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Sales Executive</label>
              <input
                value={form.salesExecutive}
                onChange={e => handleChange('salesExecutive', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Customer Zipcode</label>
              <input
                value={form.customerZipcode}
                onChange={e => handleChange('customerZipcode', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-2.5 bg-cyan-500 text-white rounded font-semibold text-[14px] hover:bg-cyan-600 disabled:opacity-70 transition-all active:scale-95"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'SAVE'}
          </button>
          <button
            onClick={handleClose}
            className="px-8 py-2.5 bg-red-500 text-white rounded font-semibold text-[14px] hover:bg-red-600 transition-all active:scale-95"
          >
            CANCEL
          </button>
        </div>
      </div>
    </Modal>
  );
}