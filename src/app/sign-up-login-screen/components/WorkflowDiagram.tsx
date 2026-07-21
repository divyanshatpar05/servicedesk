import React from 'react';
import { ArrowDown } from 'lucide-react';

const workflowSteps = [
  { id: 'wf-company', label: 'Company Setup', level: 0 },
  { id: 'wf-user', label: 'User & Role Management', level: 0 },
  {
    id: 'wf-master', label: 'Master Setup', level: 0,
    children: [
      'Brand', 'Product Category', 'Product Model', 'Service Type',
      'Complaint Type', 'Service Area', 'Technician', 'Spare Parts',
      'Supplier', 'Service Charge', 'Payment Mode',
    ]
  },
  { id: 'wf-customer', label: 'Customer Registration', level: 0 },
  { id: 'wf-custprod', label: 'Customer Product Registration', level: 0 },
  { id: 'wf-docket', label: 'Service Docket (Job Card)', level: 0, highlight: true },
  { id: 'wf-techassign', label: 'Technician Assignment', level: 0 },
  { id: 'wf-visit', label: 'Technician Visit', level: 0 },
  { id: 'wf-diagnosis', label: 'Diagnosis / Inspection', level: 0 },
  { id: 'wf-repair', label: 'Repair / Service', level: 0 },
  { id: 'wf-spares', label: 'Spare Parts Used (Optional)', level: 0, optional: true },
  { id: 'wf-completion', label: 'Service Completion', level: 0 },
  { id: 'wf-invoice', label: 'Invoice & Payment', level: 0, highlight: true },
  { id: 'wf-warranty', label: 'Warranty Registration / Update', level: 0 },
  { id: 'wf-amc', label: 'AMC Registration / Renewal (Optional)', level: 0, optional: true },
  { id: 'wf-history', label: 'Service History', level: 0 },
  { id: 'wf-reports', label: 'Reports & Dashboard', level: 0, highlight: true },
];

export default function WorkflowDiagram() {
  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin px-6 py-8">
      <div className="flex flex-col items-start gap-0 max-w-[260px] mx-auto">
        {workflowSteps?.map((step, idx) => (
          <div key={step?.id} className="w-full">
            <div className={`rounded-md px-3 py-2 text-[12px] font-semibold border transition-all ${
              step?.highlight
                ? 'bg-primary/10 border-primary/30 text-primary'
                : step?.optional
                  ? 'bg-muted/60 border-dashed border-border text-muted-foreground'
                  : 'bg-card border-border text-foreground'
            }`}>
              {step?.label}
              {step?.optional && <span className="ml-1 text-[9px] font-normal text-muted-foreground">(Optional)</span>}
            </div>

            {/* Children for Master Setup */}
            {'children' in step && step?.children && (
              <div className="ml-4 border-l-2 border-border pl-3 my-1 space-y-1">
                {step?.children?.map(child => (
                  <div key={`wf-child-${child}`} className="text-[11px] text-muted-foreground py-0.5 flex items-center gap-1.5">
                    <span className="w-3 h-px bg-border flex-shrink-0" />
                    {child}
                  </div>
                ))}
              </div>
            )}

            {/* Arrow connector */}
            {idx < workflowSteps?.length - 1 && (
              <div className="flex items-center justify-start pl-4 py-0.5">
                <div className="flex flex-col items-center">
                  <div className="w-px h-3 bg-border" />
                  <ArrowDown size={10} className="text-muted-foreground -mt-1" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}