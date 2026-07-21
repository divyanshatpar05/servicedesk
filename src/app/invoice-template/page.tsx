'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Eye, Save, RotateCcw, Printer, ChevronDown, ChevronUp, Palette, Type, Layout, FileText, Image, AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from 'lucide-react';

interface InvoiceField {
  id: string;
  label: string;
  visible: boolean;
  editable?: boolean;
}

interface CustomField {
  id: string;
  label: string;
  value: string;
}

const DEFAULT_HEADER_FIELDS: InvoiceField[] = [
  { id: 'company_name', label: 'Company Name', visible: true },
  { id: 'company_address', label: 'Company Address', visible: true },
  { id: 'company_phone', label: 'Company Phone', visible: true },
  { id: 'company_email', label: 'Company Email', visible: true },
  { id: 'company_gst', label: 'GST Number', visible: true },
  { id: 'company_logo', label: 'Company Logo', visible: true },
];

const DEFAULT_CUSTOMER_FIELDS: InvoiceField[] = [
  { id: 'customer_name', label: 'Customer Name', visible: true },
  { id: 'customer_address', label: 'Customer Address', visible: true },
  { id: 'customer_phone', label: 'Customer Phone', visible: true },
  { id: 'customer_email', label: 'Customer Email', visible: false },
  { id: 'customer_gst', label: 'Customer GST', visible: false },
  { id: 'product_model', label: 'Product / Model', visible: true },
  { id: 'serial_no', label: 'Serial Number', visible: true },
];

const DEFAULT_DOCKET_FIELDS: InvoiceField[] = [
  { id: 'docket_no', label: 'Docket Number', visible: true },
  { id: 'invoice_no', label: 'Invoice Number', visible: true },
  { id: 'invoice_date', label: 'Invoice Date', visible: true },
  { id: 'technician_name', label: 'Technician Name', visible: true },
  { id: 'complaint_type', label: 'Complaint Type', visible: true },
  { id: 'nature_of_complaint', label: 'Nature of Complaint', visible: true },
  { id: 'service_mode', label: 'Service Mode', visible: false },
  { id: 'amc_ref', label: 'AMC Reference', visible: false },
];

const DEFAULT_FOOTER_FIELDS: InvoiceField[] = [
  { id: 'terms_conditions', label: 'Terms & Conditions', visible: true },
  { id: 'signature_tech', label: 'Technician Signature', visible: true },
  { id: 'signature_customer', label: 'Customer Signature', visible: true },
  { id: 'thank_you', label: 'Thank You Note', visible: true },
  { id: 'warranty_note', label: 'Warranty Note', visible: false },
];

type TextAlign = 'left' | 'center' | 'right';
type PaperSize = 'A4' | 'A5' | 'Letter';
type FontFamily = 'Arial' | 'Times New Roman' | 'Courier New' | 'Georgia';

interface TemplateSettings {
  paperSize: PaperSize;
  primaryColor: string;
  accentColor: string;
  fontFamily: FontFamily;
  fontSize: number;
  headerAlign: TextAlign;
  showBorder: boolean;
  showWatermark: boolean;
  watermarkText: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGST: string;
  invoiceTitle: string;
  termsText: string;
  thankYouText: string;
  warrantyText: string;
  showSparePartsTable: boolean;
  showServiceCharges: boolean;
  showAmcSection: boolean;
  showTechnicianRate: boolean;
}

const DEFAULT_SETTINGS: TemplateSettings = {
  paperSize: 'A4',
  primaryColor: '#0d9488',
  accentColor: '#134e4a',
  fontFamily: 'Arial',
  fontSize: 12,
  headerAlign: 'center',
  showBorder: true,
  showWatermark: false,
  watermarkText: 'INDO SALES',
  companyName: 'INDO SALES AND SERVICE',
  companyAddress: 'Mumbai, Maharashtra',
  companyPhone: '+91 98765 43210',
  companyEmail: 'info@indosales.in',
  companyGST: '27AAAAA0000A1Z5',
  invoiceTitle: 'SERVICE INVOICE',
  termsText: 'Payment is due within 30 days. All disputes subject to Mumbai jurisdiction.',
  thankYouText: 'Thank you for choosing Indo Sales and Service!',
  warrantyText: 'Spare parts carry 90-day warranty from date of service.',
  showSparePartsTable: true,
  showServiceCharges: true,
  showAmcSection: true,
  showTechnicianRate: false,
};

type SectionKey = 'header' | 'customer' | 'docket' | 'footer' | 'appearance' | 'content' | 'custom';

export default function InvoiceTemplatePage() {
  const [settings, setSettings] = useState<TemplateSettings>(DEFAULT_SETTINGS);
  const [headerFields, setHeaderFields] = useState<InvoiceField[]>(DEFAULT_HEADER_FIELDS);
  const [customerFields, setCustomerFields] = useState<InvoiceField[]>(DEFAULT_CUSTOMER_FIELDS);
  const [docketFields, setDocketFields] = useState<InvoiceField[]>(DEFAULT_DOCKET_FIELDS);
  const [footerFields, setFooterFields] = useState<InvoiceField[]>(DEFAULT_FOOTER_FIELDS);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set(['appearance', 'header']));
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSection = (key: SectionKey) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleField = (
    fields: InvoiceField[],
    setFields: React.Dispatch<React.SetStateAction<InvoiceField[]>>,
    id: string
  ) => {
    setFields(fields.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  const updateSetting = <K extends keyof TemplateSettings>(key: K, value: TemplateSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHeaderFields(DEFAULT_HEADER_FIELDS);
    setCustomerFields(DEFAULT_CUSTOMER_FIELDS);
    setDocketFields(DEFAULT_DOCKET_FIELDS);
    setFooterFields(DEFAULT_FOOTER_FIELDS);
    setCustomFields([]);
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { id: `cf-${Date.now()}`, label: 'New Field', value: '' }]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const updateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const isExpanded = (key: SectionKey) => expandedSections.has(key);

  const SectionHeader = ({ title, icon, sectionKey }: { title: string; icon: React.ReactNode; sectionKey: SectionKey }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
        {icon}
        {title}
      </div>
      {isExpanded(sectionKey) ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
    </button>
  );

  const FieldToggleList = ({
    fields,
    setFields,
  }: {
    fields: InvoiceField[];
    setFields: React.Dispatch<React.SetStateAction<InvoiceField[]>>;
  }) => (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {fields.map(f => (
        <label key={f.id} className="flex items-center gap-2 cursor-pointer group">
          <div
            onClick={() => toggleField(fields, setFields, f.id)}
            className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative cursor-pointer ${f.visible ? 'bg-primary' : 'bg-border'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${f.visible ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-[12px] text-muted-foreground group-hover:text-foreground transition-colors">{f.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Invoice Template Customisation</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Configure the layout and content of your service invoice</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              <Eye size={13} />
              Preview
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 text-[12px] rounded-lg font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
            >
              <Save size={13} />
              {saved ? 'Saved!' : 'Save Template'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel — Settings */}
          <div className="col-span-12 lg:col-span-5 space-y-3">

            {/* Appearance */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader title="Appearance & Layout" icon={<Palette size={15} />} sectionKey="appearance" />
              {isExpanded('appearance') && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Paper Size</label>
                      <select
                        value={settings.paperSize}
                        onChange={e => updateSetting('paperSize', e.target.value as PaperSize)}
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      >
                        <option>A4</option>
                        <option>A5</option>
                        <option>Letter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Font Family</label>
                      <select
                        value={settings.fontFamily}
                        onChange={e => updateSetting('fontFamily', e.target.value as FontFamily)}
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      >
                        <option>Arial</option>
                        <option>Times New Roman</option>
                        <option>Courier New</option>
                        <option>Georgia</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Primary Colour</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={e => updateSetting('primaryColor', e.target.value)}
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.primaryColor}
                          onChange={e => updateSetting('primaryColor', e.target.value)}
                          className="flex-1 border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Accent Colour</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.accentColor}
                          onChange={e => updateSetting('accentColor', e.target.value)}
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.accentColor}
                          onChange={e => updateSetting('accentColor', e.target.value)}
                          className="flex-1 border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Font Size (pt)</label>
                      <input
                        type="number"
                        min={8}
                        max={16}
                        value={settings.fontSize}
                        onChange={e => updateSetting('fontSize', Number(e.target.value))}
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Header Alignment</label>
                      <div className="flex border border-border rounded-md overflow-hidden">
                        {(['left', 'center', 'right'] as TextAlign[]).map(a => (
                          <button
                            key={a}
                            onClick={() => updateSetting('headerAlign', a)}
                            className={`flex-1 py-1.5 flex items-center justify-center transition-colors ${settings.headerAlign === a ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
                          >
                            {a === 'left' && <AlignLeft size={13} />}
                            {a === 'center' && <AlignCenter size={13} />}
                            {a === 'right' && <AlignRight size={13} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showBorder}
                        onChange={e => updateSetting('showBorder', e.target.checked)}
                        className="w-3.5 h-3.5 accent-primary"
                      />
                      <span className="text-[12px] text-muted-foreground">Show Border</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showWatermark}
                        onChange={e => updateSetting('showWatermark', e.target.checked)}
                        className="w-3.5 h-3.5 accent-primary"
                      />
                      <span className="text-[12px] text-muted-foreground">Show Watermark</span>
                    </label>
                  </div>
                  {settings.showWatermark && (
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Watermark Text</label>
                      <input
                        type="text"
                        value={settings.watermarkText}
                        onChange={e => updateSetting('watermarkText', e.target.value)}
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Company Header */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader title="Company Header Details" icon={<Image size={15} />} sectionKey="header" />
              {isExpanded('header') && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Invoice Title</label>
                    <input
                      type="text"
                      value={settings.invoiceTitle}
                      onChange={e => updateSetting('invoiceTitle', e.target.value)}
                      className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Company Name</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={e => updateSetting('companyName', e.target.value)}
                      className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Address</label>
                    <input
                      type="text"
                      value={settings.companyAddress}
                      onChange={e => updateSetting('companyAddress', e.target.value)}
                      className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Phone</label>
                      <input
                        type="text"
                        value={settings.companyPhone}
                        onChange={e => updateSetting('companyPhone', e.target.value)}
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Email</label>
                      <input
                        type="text"
                        value={settings.companyEmail}
                        onChange={e => updateSetting('companyEmail', e.target.value)}
                        className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">GST Number</label>
                    <input
                      type="text"
                      value={settings.companyGST}
                      onChange={e => updateSetting('companyGST', e.target.value)}
                      className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1">Visible Header Fields</p>
                    <FieldToggleList fields={headerFields} setFields={setHeaderFields} />
                  </div>
                </div>
              )}
            </div>

            {/* Customer Info Fields */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader title="Customer Info Fields" icon={<Layout size={15} />} sectionKey="customer" />
              {isExpanded('customer') && (
                <div className="p-4">
                  <p className="text-[11px] text-muted-foreground mb-2">Toggle which customer fields appear on the invoice</p>
                  <FieldToggleList fields={customerFields} setFields={setCustomerFields} />
                </div>
              )}
            </div>

            {/* Docket Fields */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader title="Docket / Service Fields" icon={<FileText size={15} />} sectionKey="docket" />
              {isExpanded('docket') && (
                <div className="p-4">
                  <p className="text-[11px] text-muted-foreground mb-2">Toggle which docket fields appear on the invoice</p>
                  <FieldToggleList fields={docketFields} setFields={setDocketFields} />
                </div>
              )}
            </div>

            {/* Content Sections */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader title="Invoice Content Sections" icon={<Type size={15} />} sectionKey="content" />
              {isExpanded('content') && (
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    {[
                      { key: 'showSparePartsTable', label: 'Spare Parts Table' },
                      { key: 'showServiceCharges', label: 'Service Charges Section' },
                      { key: 'showAmcSection', label: 'AMC Details Section' },
                      { key: 'showTechnicianRate', label: 'Technician Rate' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[key as keyof TemplateSettings] as boolean}
                          onChange={e => updateSetting(key as keyof TemplateSettings, e.target.checked as never)}
                          className="w-3.5 h-3.5 accent-primary"
                        />
                        <span className="text-[12px] text-muted-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader title="Footer Fields & Text" icon={<AlignLeft size={15} />} sectionKey="footer" />
              {isExpanded('footer') && (
                <div className="p-4 space-y-3">
                  <FieldToggleList fields={footerFields} setFields={setFooterFields} />
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Terms & Conditions Text</label>
                    <textarea
                      rows={3}
                      value={settings.termsText}
                      onChange={e => updateSetting('termsText', e.target.value)}
                      className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Thank You Note</label>
                    <input
                      type="text"
                      value={settings.thankYouText}
                      onChange={e => updateSetting('thankYouText', e.target.value)}
                      className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Warranty Note</label>
                    <input
                      type="text"
                      value={settings.warrantyText}
                      onChange={e => updateSetting('warrantyText', e.target.value)}
                      className="w-full border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Custom Fields */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader title="Custom Fields" icon={<Plus size={15} />} sectionKey="custom" />
              {isExpanded('custom') && (
                <div className="p-4 space-y-3">
                  <p className="text-[11px] text-muted-foreground">Add extra fields that will appear in the invoice body</p>
                  {customFields.map(cf => (
                    <div key={cf.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Field Label"
                        value={cf.label}
                        onChange={e => updateCustomField(cf.id, 'label', e.target.value)}
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Default Value"
                        value={cf.value}
                        onChange={e => updateCustomField(cf.id, 'value', e.target.value)}
                        className="flex-1 border border-border rounded-md px-2 py-1.5 text-[12px] bg-background text-foreground"
                      />
                      <button onClick={() => removeCustomField(cf.id)} className="text-danger hover:text-danger/80 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addCustomField}
                    className="flex items-center gap-1.5 text-[12px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <Plus size={13} />
                    Add Custom Field
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel — Live Preview */}
          <div className="col-span-12 lg:col-span-7">
            <div className="sticky top-6">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                    <Eye size={14} />
                    Live Preview
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Printer size={13} />
                    Print Preview
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-secondary/20 overflow-auto max-h-[780px]">
                  {/* Invoice Preview */}
                  <div
                    className="bg-white mx-auto shadow-lg"
                    style={{
                      width: settings.paperSize === 'A5' ? '420px' : '595px',
                      minHeight: settings.paperSize === 'A5' ? '594px' : '842px',
                      fontFamily: settings.fontFamily,
                      fontSize: `${settings.fontSize}px`,
                      border: settings.showBorder ? `2px solid ${settings.primaryColor}` : 'none',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Watermark */}
                    {settings.showWatermark && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                        style={{ zIndex: 0 }}
                      >
                        <span
                          style={{
                            fontSize: '72px',
                            fontWeight: 'bold',
                            color: settings.primaryColor,
                            opacity: 0.06,
                            transform: 'rotate(-35deg)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {settings.watermarkText}
                        </span>
                      </div>
                    )}

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {/* Header */}
                      <div
                        style={{
                          backgroundColor: settings.primaryColor,
                          color: 'white',
                          padding: '16px 20px',
                          textAlign: settings.headerAlign,
                        }}
                      >
                        {headerFields.find(f => f.id === 'company_name')?.visible && (
                          <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>
                            {settings.companyName}
                          </div>
                        )}
                        {headerFields.find(f => f.id === 'company_address')?.visible && (
                          <div style={{ fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>{settings.companyAddress}</div>
                        )}
                        <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '2px' }}>
                          {headerFields.find(f => f.id === 'company_phone')?.visible && settings.companyPhone}
                          {headerFields.find(f => f.id === 'company_phone')?.visible && headerFields.find(f => f.id === 'company_email')?.visible && ' | '}
                          {headerFields.find(f => f.id === 'company_email')?.visible && settings.companyEmail}
                        </div>
                        {headerFields.find(f => f.id === 'company_gst')?.visible && (
                          <div style={{ fontSize: '10px', opacity: 0.85, marginTop: '2px' }}>GST: {settings.companyGST}</div>
                        )}
                      </div>

                      {/* Invoice Title Bar */}
                      <div
                        style={{
                          backgroundColor: settings.accentColor,
                          color: 'white',
                          textAlign: 'center',
                          padding: '6px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          letterSpacing: '2px',
                        }}
                      >
                        {settings.invoiceTitle}
                      </div>

                      {/* Invoice Meta */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: `1px solid ${settings.primaryColor}30` }}>
                        <div>
                          {docketFields.find(f => f.id === 'invoice_no')?.visible && (
                            <div style={{ fontSize: '11px' }}><strong>Invoice No:</strong> INV-2024-0001</div>
                          )}
                          {docketFields.find(f => f.id === 'docket_no')?.visible && (
                            <div style={{ fontSize: '11px' }}><strong>Docket No:</strong> DKT-2024-0001</div>
                          )}
                          {docketFields.find(f => f.id === 'invoice_date')?.visible && (
                            <div style={{ fontSize: '11px' }}><strong>Date:</strong> 14/07/2026</div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {docketFields.find(f => f.id === 'technician_name')?.visible && (
                            <div style={{ fontSize: '11px' }}><strong>Technician:</strong> Ramesh Kumar</div>
                          )}
                          {docketFields.find(f => f.id === 'complaint_type')?.visible && (
                            <div style={{ fontSize: '11px' }}><strong>Complaint:</strong> Not Cooling</div>
                          )}
                          {docketFields.find(f => f.id === 'service_mode')?.visible && (
                            <div style={{ fontSize: '11px' }}><strong>Mode:</strong> Paid Service</div>
                          )}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div style={{ padding: '10px 20px', borderBottom: `1px solid ${settings.primaryColor}30` }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: settings.primaryColor, marginBottom: '4px', textTransform: 'uppercase' }}>Customer Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                          {customerFields.find(f => f.id === 'customer_name')?.visible && <div style={{ fontSize: '11px' }}><strong>Name:</strong> Suresh Sharma</div>}
                          {customerFields.find(f => f.id === 'customer_phone')?.visible && <div style={{ fontSize: '11px' }}><strong>Phone:</strong> 9876543210</div>}
                          {customerFields.find(f => f.id === 'customer_address')?.visible && <div style={{ fontSize: '11px', gridColumn: '1 / -1' }}><strong>Address:</strong> 123, MG Road, Mumbai - 400001</div>}
                          {customerFields.find(f => f.id === 'product_model')?.visible && <div style={{ fontSize: '11px' }}><strong>Product:</strong> Water Purifier RO</div>}
                          {customerFields.find(f => f.id === 'serial_no')?.visible && <div style={{ fontSize: '11px' }}><strong>Serial No:</strong> WP-2023-XYZ</div>}
                        </div>
                      </div>

                      {/* Spare Parts Table */}
                      {settings.showSparePartsTable && (
                        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${settings.primaryColor}30` }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: settings.primaryColor, marginBottom: '6px', textTransform: 'uppercase' }}>Spare Parts</div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                            <thead>
                              <tr style={{ backgroundColor: settings.primaryColor, color: 'white' }}>
                                <th style={{ padding: '4px 6px', textAlign: 'left' }}>Part Name</th>
                                <th style={{ padding: '4px 6px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '4px 6px', textAlign: 'right' }}>Rate</th>
                                <th style={{ padding: '4px 6px', textAlign: 'right' }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ backgroundColor: '#f9f9f9' }}>
                                <td style={{ padding: '4px 6px' }}>MEMBRANE 75 GPD</td>
                                <td style={{ padding: '4px 6px', textAlign: 'center' }}>1</td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>₹850</td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>₹850</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '4px 6px' }}>SEDIMENT FILTER</td>
                                <td style={{ padding: '4px 6px', textAlign: 'center' }}>2</td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>₹120</td>
                                <td style={{ padding: '4px 6px', textAlign: 'right' }}>₹240</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Service Charges */}
                      {settings.showServiceCharges && (
                        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${settings.primaryColor}30` }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: settings.primaryColor, marginBottom: '4px', textTransform: 'uppercase' }}>Charges Summary</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                            <span>Service Charge (PAID SERVICE - DEEP CLEANING)</span>
                            <span>₹1,500.00</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                            <span>Spare Parts Amount</span>
                            <span>₹1,090.00</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                            <span>Other Charges</span>
                            <span>₹0.00</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', padding: '4px 0', borderTop: `1px solid ${settings.primaryColor}40`, marginTop: '4px', color: settings.primaryColor }}>
                            <span>GRAND TOTAL</span>
                            <span>₹2,590.00</span>
                          </div>
                        </div>
                      )}

                      {/* AMC Section */}
                      {settings.showAmcSection && (
                        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${settings.primaryColor}30` }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: settings.primaryColor, marginBottom: '4px', textTransform: 'uppercase' }}>AMC Details</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '10px' }}>
                            <div><strong>AMC Ref:</strong> AMC-2024-0001</div>
                            <div><strong>AMC Type:</strong> 3 Month</div>
                            <div><strong>Start Date:</strong> 14/07/2026</div>
                            <div><strong>Exp Date:</strong> 14/10/2026</div>
                          </div>
                        </div>
                      )}

                      {/* Custom Fields */}
                      {customFields.length > 0 && (
                        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${settings.primaryColor}30` }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: settings.primaryColor, marginBottom: '4px', textTransform: 'uppercase' }}>Additional Information</div>
                          {customFields.map(cf => (
                            <div key={cf.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '1px 0' }}>
                              <span><strong>{cf.label}:</strong></span>
                              <span>{cf.value || '—'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ padding: '10px 20px' }}>
                        {footerFields.find(f => f.id === 'terms_conditions')?.visible && (
                          <div style={{ fontSize: '9px', color: '#666', marginBottom: '8px' }}>
                            <strong>Terms:</strong> {settings.termsText}
                          </div>
                        )}
                        {footerFields.find(f => f.id === 'warranty_note')?.visible && (
                          <div style={{ fontSize: '9px', color: '#666', marginBottom: '8px' }}>
                            <strong>Warranty:</strong> {settings.warrantyText}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                          {footerFields.find(f => f.id === 'signature_tech')?.visible && (
                            <div style={{ textAlign: 'center', fontSize: '10px' }}>
                              <div style={{ borderTop: `1px solid #999`, paddingTop: '4px', width: '100px' }}>Technician Sign</div>
                            </div>
                          )}
                          {footerFields.find(f => f.id === 'signature_customer')?.visible && (
                            <div style={{ textAlign: 'center', fontSize: '10px' }}>
                              <div style={{ borderTop: `1px solid #999`, paddingTop: '4px', width: '100px' }}>Customer Sign</div>
                            </div>
                          )}
                        </div>
                        {footerFields.find(f => f.id === 'thank_you')?.visible && (
                          <div style={{ textAlign: 'center', fontSize: '10px', color: settings.primaryColor, marginTop: '10px', fontStyle: 'italic' }}>
                            {settings.thankYouText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
