'use client';
import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, XCircle, Bell, FileText, ExternalLink } from 'lucide-react';

interface Docket {
  docketNo: string;
  customerName: string;
  mobileNo: string;
  model: string;
  serviceEngineer: string;
  status: string;
  totalAmount: number;
  sparePartAmount: number;
  customerAddress?: string;
  natureOfDocket?: string;
}

interface WhatsAppSharePanelProps {
  docket: Docket;
  onClose: () => void;
}

type MessageType = 'completion' | 'cancellation' | 'notification' | 'invoice';

const messageTemplates: Record<MessageType, { label: string; icon: React.ReactNode; color: string; compose: (d: Docket) => string }> = {
  completion: {
    label: 'Job Completion',
    icon: <CheckCircle2 size={16} />,
    color: 'bg-green-100 text-green-700 border-green-200',
    compose: (d) =>
      `Dear ${d.customerName},\n\nYour service request (Docket No: ${d.docketNo}) for *${d.model}* has been successfully completed.\n\n✅ *Service Completed*\n👨‍🔧 Technician: ${d.serviceEngineer}\n📍 Address: ${d.customerAddress || 'N/A'}\n\nThank you for choosing Indo Sales and Service. For any queries, please contact us.\n\n*Indo Sales and Service Desk*`,
  },
  cancellation: {
    label: 'Cancellation',
    icon: <XCircle size={16} />,
    color: 'bg-red-100 text-red-700 border-red-200',
    compose: (d) =>
      `Dear ${d.customerName},\n\nWe regret to inform you that your service request (Docket No: ${d.docketNo}) for *${d.model}* has been cancelled.\n\n❌ *Service Cancelled*\nIf you wish to reschedule, please contact us at your earliest convenience.\n\nWe apologize for any inconvenience caused.\n\n*Indo Sales and Service Desk*`,
  },
  notification: {
    label: 'Notification',
    icon: <Bell size={16} />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    compose: (d) =>
      `Dear ${d.customerName},\n\nThis is a notification regarding your service request (Docket No: ${d.docketNo}) for *${d.model}*.\n\n📋 *Status Update*\nCurrent Status: ${d.status}\n👨‍🔧 Assigned Technician: ${d.serviceEngineer}\n\nOur technician will visit you shortly. Please ensure someone is available at the service address.\n\n*Indo Sales and Service Desk*`,
  },
  invoice: {
    label: 'Invoice with AMC',
    icon: <FileText size={16} />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    compose: (d) =>
      `Dear ${d.customerName},\n\nPlease find your invoice details for Docket No: *${d.docketNo}*\n\n🧾 *Invoice Summary*\nModel: ${d.model}\nNature: ${d.natureOfDocket || 'Service'}\nService Charges: ₹${d.totalAmount.toFixed(2)}\nSpare Parts: ₹${d.sparePartAmount.toFixed(2)}\nTotal Amount: ₹${(d.totalAmount + d.sparePartAmount).toFixed(2)}\n\n📅 *AMC Details*\nYour AMC has been registered. Our team will contact you for the next scheduled service.\n\nThank you for your payment!\n\n*Indo Sales and Service Desk*`,
  },
};

export default function WhatsAppSharePanel({ docket, onClose }: WhatsAppSharePanelProps) {
  const [selectedType, setSelectedType] = useState<MessageType>('completion');
  const [customMessage, setCustomMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const template = messageTemplates[selectedType];
  const composedMessage = editMode ? customMessage : template.compose(docket);

  const handleTypeChange = (type: MessageType) => {
    setSelectedType(type);
    setEditMode(false);
    setCustomMessage('');
  };

  const handleEdit = () => {
    setCustomMessage(template.compose(docket));
    setEditMode(true);
  };

  const handleSendWhatsApp = () => {
    const mobile = docket.mobileNo.replace(/\D/g, '');
    const fullMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;
    const msg = encodeURIComponent(composedMessage);
    window.open(`https://wa.me/${fullMobile}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-green-600 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} />
            <span className="font-bold text-[15px]">Send WhatsApp Message</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-[12px] flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{docket.customerName}</p>
              <p className="text-gray-500">📱 {docket.mobileNo} &nbsp;|&nbsp; Docket: {docket.docketNo}</p>
            </div>
            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">WhatsApp</span>
          </div>

          {/* Message Type Selector */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Select Message Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(messageTemplates) as MessageType[]).map(type => {
                const t = messageTemplates[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${
                      selectedType === type
                        ? t.color + ' border-current shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Message Preview</p>
              {!editMode ? (
                <button onClick={handleEdit} className="text-[11px] text-blue-600 hover:underline">Edit</button>
              ) : (
                <button onClick={() => setEditMode(false)} className="text-[11px] text-gray-500 hover:underline">Reset</button>
              )}
            </div>
            {editMode ? (
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={8}
                className="w-full border border-gray-200 rounded-lg p-3 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-[12px] whitespace-pre-wrap text-gray-700 max-h-48 overflow-y-auto">
                {composedMessage}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-[13px] font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={14} />
              Open in WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
