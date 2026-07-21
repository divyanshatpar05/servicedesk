'use client';
import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

interface SpareRow {
  id: string;
  spareName: string;
  note: string;
  qty: number;
  rate: number;
  total: number;
}

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

interface PrintInvoiceModalProps {
  open: boolean;
  docket: Docket;
  onClose: () => void;
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
}

export default function PrintInvoiceModal({ open, docket, onClose }: PrintInvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const serviceAmt = docket.serviceAmount ?? docket.totalAmount ?? 0;
  const spareAmt = docket.sparePartAmount ?? 0;
  const otherAmt = docket.otherCharges ?? 0;
  const discountAmt = docket.discount ?? 0;
  const grandTotal = docket.grandTotal ?? (serviceAmt + spareAmt + otherAmt - discountAmt);
  const amountInWords = numberToWords(Math.floor(grandTotal));
  const invoiceNo = `W${docket.docketNo.slice(-4)}/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000 + 10000)}`;
  const refNo = `INDO/${new Date().getMonth() + 1}/${Math.floor(Math.random() * 9000 + 1000)}/${new Date().getFullYear()}`;
  const spareItems = docket.spareItems ?? [];

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Invoice Cum Money Receipt - ${docket.docketNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            .no-border td { border: none; }
            .header-title { color: #c00; font-size: 20px; font-weight: bold; text-decoration: underline; }
            .logo { font-size: 22px; font-weight: 900; color: #003399; }
            .logo span { color: #cc0000; }
            .section-title { text-align: center; font-weight: bold; font-size: 14px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#4a7fa5] text-white rounded-t-lg">
          <span className="text-sm font-bold">🖨️ INVOICE CUM MONEY RECEIPT — #{docket.docketNo}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#4a7fa5] rounded text-[12px] font-semibold hover:bg-gray-100 transition-colors"
            >
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6" ref={printRef}>
          {/* Company Header */}
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '8px' }}>
            <tbody>
              <tr>
                <td style={{ border: 'none', verticalAlign: 'top', width: '70%' }}>
                  <div style={{ color: '#c00', fontSize: '20px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>
                    INDO SALES &amp; SERVICES
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <strong>Contact:</strong> 033 4849 5787 / 033 4066 2107 / 9123672407<br />
                    7, RED CROSS PLACE 2ND FLOOR KOLKATA-700001 West Bengal India<br />
                    <strong>Email id.:</strong> kutchinaindo1@gmail.com / kutchinaindoservices@gmail.com
                  </div>
                </td>
                <td style={{ border: 'none', verticalAlign: 'top', textAlign: 'right', width: '30%' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#003399', letterSpacing: '-1px' }}>
                    <span style={{ color: '#cc0000' }}>KUTCH</span><span style={{ color: '#003399' }}>iNA</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', fontStyle: 'italic' }}>Designed for Convenience</div>
                  <div style={{ marginTop: '8px', border: '1px dashed #999', padding: '6px', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                    <div style={{ width: '70px', height: '70px', background: '#f0f0f0', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999', border: '1px solid #ccc' }}>
                      UPI QR CODE
                    </div>
                    <div>Scan to Pay</div>
                    <div style={{ fontSize: '9px' }}>(Configure UPI ID in Company Setup)</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <hr style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', margin: '8px 0' }}>
            INVOICE CUM MONEY RECEIPT
          </div>

          {/* Invoice Details Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', width: '20%' }}>Service Type.</td>
                <td style={{ border: '1px solid #000', padding: '6px', width: '30%' }}>{docket.natureOfDocket}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', width: '25%' }}>Service Date &amp; Time.</td>
                <td style={{ border: '1px solid #000', padding: '6px', width: '25%' }}>{docket.dateTime?.split(' ')[0]}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Card No.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.cardNo}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Serial No.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>—</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Invoice No.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{invoiceNo}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Payment Mode</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.paymentMode || '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Docket Number.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={3}>{docket.docketNo}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Customer Name</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.customerName}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>REF. No</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{refNo}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Customer Address</td>
                <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={3}>{docket.customerAddress}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Mobile No.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.mobileNo}{docket.alternateMob ? `/${docket.alternateMob}` : ''}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Model No.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.model}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Sale Point</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.salePoint}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Office Executive</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>DALIA</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Sales Executive</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.salesExecutive}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Service Engineer</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.serviceEngineer}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Office Atten By</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>SREYA</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Service / Payment Type</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{docket.paymentType || '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Install Date</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>—</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Expiry. Date.</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>—</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>Warranty Card Given:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={3}>Yes / No / Missing</td>
              </tr>
            </tbody>
          </table>

          {/* Spare Parts Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '8px' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', width: '40px' }}>Sl.</th>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left' }}>Spare Parts &amp; Accessories</th>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left' }}>Note</th>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '50px' }}>Qty</th>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', width: '80px' }}>Rate (₹)</th>
                <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', width: '90px' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {spareItems.length > 0 ? spareItems.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{s.spareName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{s.note}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{s.qty}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{s.rate.toFixed(2)}</td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{s.total.toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={6}>&nbsp;</td>
                </tr>
              )}

              {/* Spare Parts Sub Total */}
              <tr style={{ background: '#f9f9f9' }}>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }} colSpan={5}>SPARE PARTS AMOUNT</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{spareAmt.toFixed(2)}</td>
              </tr>

              {/* Service Charge Row */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }} colSpan={5}>
                  SERVICE CHARGE [{docket.paymentType || docket.natureOfDocket}]
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{serviceAmt.toFixed(2)}</td>
              </tr>

              {/* Other Charges Row */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }} colSpan={5}>OTHER CHARGES</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{otherAmt.toFixed(2)}</td>
              </tr>

              {/* Discount Row — only show if discount > 0 */}
              {discountAmt > 0 && (
                <tr style={{ background: '#fff5f5' }}>
                  <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', color: '#c00' }} colSpan={5}>
                    DISCOUNT{docket.discountNote ? ` (${docket.discountNote})` : ''}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold', color: '#c00' }}>
                    − {discountAmt.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Grand Total */}
              <tr style={{ background: '#e8f4e8' }}>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', fontSize: '13px' }} colSpan={5}>GRAND TOTAL</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 'bold', fontSize: '13px' }}>{grandTotal.toFixed(2)}</td>
              </tr>

              {/* Amount in Words */}
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }} colSpan={6}>
                  <strong>In Words :</strong> Rupees <em>{amountInWords} Only.</em>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Notes */}
          <div style={{ marginTop: '12px', fontSize: '11px' }}>
            <strong>Note:</strong><br />
            1. Subject to realisation of cheque.<br />
            2. Valid only when signed by an Authorised representative of the company
          </div>

          {/* Signature Section */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '32px' }}>
            <tbody>
              <tr>
                <td style={{ border: 'none', width: '50%', textAlign: 'center', paddingTop: '40px', verticalAlign: 'bottom' }}>
                  <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                    Customer Signature
                  </div>
                </td>
                <td style={{ border: 'none', width: '50%', textAlign: 'center', paddingTop: '40px', verticalAlign: 'bottom' }}>
                  <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                    Authorised Signature
                  </div>
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>Indo Sales &amp; Services</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
