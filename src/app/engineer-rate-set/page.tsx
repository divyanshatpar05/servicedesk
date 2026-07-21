'use client';
import React, { useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { AlertTriangle, Plus, Edit2, Save, X, Check, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ServiceRate {
  id: string;
  serviceName: string;
  serviceAmount: number;
  serviceCharge: number;
  ta: number;
  commission: number;
  commission1: number;
  commission2: number;
}

interface EngineerRates {
  [engineerName: string]: ServiceRate[];
}

const DEFAULT_SERVICES: Omit<ServiceRate, 'id'>[] = [
  { serviceName: 'INSTALLATION CHARGES', serviceAmount: 699.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'AMC-SERVICE CHARGES ( WITHOUT SPARE )', serviceAmount: 1999.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'RE- INSTALLATION CHARGES', serviceAmount: 699.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'COMPLAIN ATTEND CHARGES', serviceAmount: 499.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'AMC SERVICE CHARGES ( WITH SPARE )', serviceAmount: 2999.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'PIPE-FITTINGS CHARGES', serviceAmount: 499.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'INSPECTION-CHARGES', serviceAmount: 299.00, serviceCharge: 1.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'PAID SERVICE ( NORMAL CLEANING )', serviceAmount: 799.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'AMC PAYMENT COLLECTION ( OFFICE )', serviceAmount: 1999.00, serviceCharge: 50.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'AMC PAYEMNT COLLECTION ( DIRECT )', serviceAmount: 1999.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'FREE SERVICE ( WARRANTY )', serviceAmount: 1.00, serviceCharge: 1.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'DISPLAY CHARGES', serviceAmount: 1.00, serviceCharge: 50.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'COMPLAIN ATTEND ( IW ) & INCUDING ALL', serviceAmount: 1.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'ASC DRY SERVICE', serviceAmount: 1.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'ASC COMPLAIN ATTEND', serviceAmount: 299.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'CHIMNEY DISMENTAL CHARGES', serviceAmount: 699.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'NEW ASC COLLETION', serviceAmount: 2000.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'MODULAR KITCHEN INSPECTION & SERVICE CHARGES', serviceAmount: 500.00, serviceCharge: 0.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'PAID SERVICE ( DEEP CLEANING )', serviceAmount: 1500.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'DISPLAY', serviceAmount: 0.00, serviceCharge: 50.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'BAP ( PVC PIPE ADJUSTED )', serviceAmount: 1500.00, serviceCharge: 1.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'SAP ( PVC PIPE ADJUSTED )', serviceAmount: 1200.00, serviceCharge: 1.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'SPARE CHANGE ( INCLUDING ALL )', serviceAmount: 499.00, serviceCharge: 1.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'ASC SERVICE & COMPLAIN ATTEND', serviceAmount: 499.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'ASC SERVICE & SPARE FITTINGS', serviceAmount: 299.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'ASC DEEP CLEAN SERVICE', serviceAmount: 1.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'PAID SERVICE', serviceAmount: 799.00, serviceCharge: 100.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
  { serviceName: 'AMC SERVICE CHARGES ( NORMAL + OPEN ) WITHOUT SPARE', serviceAmount: 2399.00, serviceCharge: 1.00, ta: 0.00, commission: 0.00, commission1: 0.00, commission2: 0.00 },
];

const ENGINEERS = [
  'JALAL SARDAR',
  'PRITAM SARKAR',
  'RAJAN K.',
  'ARJUN M.',
  'DEEPA V.',
  'SUNIL P.',
  'PRIYA S.',
  'KAVITHA R.',
];

function makeDefaultRates(engineerName: string): ServiceRate[] {
  return DEFAULT_SERVICES.map((s, i) => ({
    ...s,
    id: `${engineerName}-svc-${i}`,
  }));
}

function initAllRates(): EngineerRates {
  const rates: EngineerRates = {};
  ENGINEERS.forEach(eng => {
    rates[eng] = makeDefaultRates(eng);
  });
  return rates;
}

interface ServiceModalProps {
  mode: 'add' | 'edit';
  service: Partial<ServiceRate>;
  onSave: (s: Partial<ServiceRate>) => void;
  onClose: () => void;
}

function ServiceModal({ mode, service, onSave, onClose }: ServiceModalProps) {
  const [form, setForm] = useState<Partial<ServiceRate>>({ ...service });

  const handleChange = (field: keyof ServiceRate, value: string) => {
    if (field === 'serviceName') {
      setForm(prev => ({ ...prev, serviceName: value }));
    } else {
      setForm(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-5 py-3 bg-[#4a7fa5] rounded-t-lg">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
            {mode === 'add' ? 'Add New Service' : 'Edit Service'}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Service Name</label>
            <input
              type="text"
              value={form.serviceName || ''}
              onChange={e => handleChange('serviceName', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#4a7fa5]"
              placeholder="Enter service name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['serviceAmount', 'serviceCharge', 'ta', 'commission', 'commission1', 'commission2'] as (keyof ServiceRate)[]).map(field => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">
                  {field === 'serviceAmount' ? 'Service Amount' :
                   field === 'serviceCharge' ? 'Service Charge' :
                   field === 'ta' ? 'TA' :
                   field === 'commission' ? 'Commission' :
                   field === 'commission1' ? 'Commission1' : 'Commission2'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(form[field] as number) ?? 0}
                  onChange={e => handleChange(field, e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#4a7fa5]"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-1.5 text-sm bg-[#4a7fa5] text-white rounded hover:bg-[#3d6e91] flex items-center gap-1.5"
          >
            <Check size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EngineerRateSetPage() {
  const [selectedEngineer, setSelectedEngineer] = useState<string>(ENGINEERS[0]);
  const [allRates, setAllRates] = useState<EngineerRates>(initAllRates);
  const [savedEngineers, setSavedEngineers] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRate | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentRates = allRates[selectedEngineer] || [];

  const updateRate = useCallback((serviceId: string, field: keyof ServiceRate, value: string) => {
    setAllRates(prev => ({
      ...prev,
      [selectedEngineer]: prev[selectedEngineer].map(r =>
        r.id === serviceId
          ? { ...r, [field]: field === 'serviceName' ? value : parseFloat(value) || 0 }
          : r
      ),
    }));
  }, [selectedEngineer]);

  const handleSave = () => {
    setSavedEngineers(prev => new Set(prev).add(selectedEngineer));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddService = (form: Partial<ServiceRate>) => {
    if (!form.serviceName?.trim()) return;
    const newService: ServiceRate = {
      id: `${selectedEngineer}-svc-${Date.now()}`,
      serviceName: form.serviceName,
      serviceAmount: form.serviceAmount ?? 0,
      serviceCharge: form.serviceCharge ?? 0,
      ta: form.ta ?? 0,
      commission: form.commission ?? 0,
      commission1: form.commission1 ?? 0,
      commission2: form.commission2 ?? 0,
    };
    setAllRates(prev => ({
      ...prev,
      [selectedEngineer]: [...prev[selectedEngineer], newService],
    }));
    setShowModal(false);
  };

  const handleEditService = (form: Partial<ServiceRate>) => {
    if (!editingService || !form.serviceName?.trim()) return;
    setAllRates(prev => ({
      ...prev,
      [selectedEngineer]: prev[selectedEngineer].map(r =>
        r.id === editingService.id ? { ...r, ...form } : r
      ),
    }));
    setEditingService(null);
  };

  const handleDeleteService = (serviceId: string) => {
    setAllRates(prev => ({
      ...prev,
      [selectedEngineer]: prev[selectedEngineer].filter(r => r.id !== serviceId),
    }));
  };

  const handleExport = () => {
    const exportData = currentRates.map(r => ({
      'Engineer': selectedEngineer,
      'Service Name': r.serviceName,
      'Service Amount (₹)': r.serviceAmount,
      'Service Charge (₹)': r.serviceCharge,
      'TA (₹)': r.ta,
      'Commission (₹)': r.commission,
      'Commission 1 (₹)': r.commission1,
      'Commission 2 (₹)': r.commission2,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Engineer Rates');
    XLSX.writeFile(wb, `engineer-rates-${selectedEngineer.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header bar */}
        <div className="bg-[#4a7fa5] px-6 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-white" />
          <h1 className="text-white font-bold text-sm uppercase tracking-widest">SERVICE ENGINEER RATE SET</h1>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Engineer Selector */}
          <div className="flex flex-col items-center mb-8">
            <label className="text-sm font-semibold text-gray-700 mb-2">Service Engineer</label>
            <select
              value={selectedEngineer}
              onChange={e => setSelectedEngineer(e.target.value)}
              className="border-2 border-red-400 rounded px-4 py-2 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-[#4a7fa5] min-w-[280px] cursor-pointer"
            >
              {ENGINEERS.map(eng => (
                <option key={eng} value={eng}>{eng}</option>
              ))}
            </select>
          </div>

          {/* Section title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-gray-700" />
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">SERVICE ENGINEER RATE</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditingService(null); setShowModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4a7fa5] text-white text-sm rounded hover:bg-[#3d6e91] transition-colors"
              >
                <Plus size={15} /> Add Service
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Download size={15} /> Export Excel
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded transition-colors ${
                  saveSuccess
                    ? 'bg-green-600 text-white' :'bg-green-700 text-white hover:bg-green-800'
                }`}
              >
                {saveSuccess ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Rates</>}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#4a7fa5] text-white">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide w-[280px]">Service Name</th>
                    <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wide w-[110px]">Service Amount</th>
                    <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wide w-[130px]">Service Charge</th>
                    <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wide w-[110px]">TA</th>
                    <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wide w-[120px]">Commission</th>
                    <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wide w-[120px]">Commission1</th>
                    <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wide w-[120px]">Commission2</th>
                    <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wide w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRates.map((rate, idx) => (
                    <tr
                      key={rate.id}
                      className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}
                    >
                      {/* Service Name */}
                      <td className="px-4 py-2.5 text-xs font-medium text-gray-800 align-middle">
                        {rate.serviceName}
                      </td>
                      {/* Service Amount - display only */}
                      <td className="px-3 py-2.5 text-xs text-gray-700 align-middle">
                        {rate.serviceAmount.toFixed(2)}
                      </td>
                      {/* Editable fields */}
                      {(['serviceCharge', 'ta', 'commission', 'commission1', 'commission2'] as (keyof ServiceRate)[]).map(field => (
                        <td key={field} className="px-3 py-2 align-middle">
                          <input
                            type="number"
                            step="0.01"
                            value={(rate[field] as number).toFixed(2)}
                            onChange={e => updateRate(rate.id, field, e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-[#4a7fa5] bg-white"
                          />
                        </td>
                      ))}
                      {/* Actions */}
                      <td className="px-3 py-2 align-middle text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingService(rate)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit service"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(rate.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Remove service"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom save */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded transition-colors ${
                saveSuccess ? 'bg-green-600 text-white' : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              {saveSuccess ? <><Check size={15} /> Rates Saved for {selectedEngineer}!</> : <><Save size={15} /> Save Rates for {selectedEngineer}</>}
            </button>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showModal && (
        <ServiceModal
          mode="add"
          service={{ serviceAmount: 0, serviceCharge: 0, ta: 0, commission: 0, commission1: 0, commission2: 0 }}
          onSave={handleAddService}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <ServiceModal
          mode="edit"
          service={editingService}
          onSave={handleEditService}
          onClose={() => setEditingService(null)}
        />
      )}
    </AppLayout>
  );
}
