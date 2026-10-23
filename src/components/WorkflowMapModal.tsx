import React from 'react';
import {
  UserPlus,
  ShieldCheck,
  CalendarPlus,
  FileCheck,
  Megaphone,
  Ticket,
  QrCode,
  Star,
  Database,
  FileText,
  Stamp,
  Download,
  BarChart3,
  LayoutDashboard,
  X,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';

interface WorkflowMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateStep: (stepId: number, tabName: string) => void;
}

export const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Organizer & Student Registration',
    desc: 'Students & organizers register. Types: Student Club / Society, Department, Faculty / Committee, Placement Cell.',
    icon: UserPlus,
    tab: 'auth',
    targetRole: 'All Roles',
    color: 'border-blue-500 text-blue-600 bg-blue-50',
  },
  {
    step: 2,
    title: 'Admin Verification',
    desc: 'Admin verifies student and organizer accounts before granting privileges.',
    icon: ShieldCheck,
    tab: 'admin',
    targetRole: 'Admin',
    color: 'border-indigo-500 text-indigo-600 bg-indigo-50',
  },
  {
    step: 3,
    title: 'Organizer Creates Event',
    desc: 'Event details: name, date, time, venue, dept, faculty coordinator, objectives, outcomes, and PO/PEO/PSO mapping.',
    icon: CalendarPlus,
    tab: 'organizer',
    targetRole: 'Organizer / Admin',
    color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
  },
  {
    step: 4,
    title: 'Admin Approves Event',
    desc: 'Institutional administration reviews event details, objectives, and approves or requests revision.',
    icon: FileCheck,
    tab: 'admin',
    targetRole: 'Admin',
    color: 'border-amber-500 text-amber-600 bg-amber-50',
  },
  {
    step: 5,
    title: 'Event Published & Notifications Sent',
    desc: 'Approved event becomes visible to eligible students. System broadcasts event announcements & reminders.',
    icon: Megaphone,
    tab: 'events',
    targetRole: 'All Roles',
    color: 'border-sky-500 text-sky-600 bg-sky-50',
  },
  {
    step: 6,
    title: 'Student Registration',
    desc: 'Students register online in one click; system generates verified digital event pass with secure ticket code.',
    icon: Ticket,
    tab: 'events',
    targetRole: 'Student',
    color: 'border-purple-500 text-purple-600 bg-purple-50',
  },
  {
    step: 7,
    title: 'QR-Based Attendance',
    desc: 'Attendance is recorded through instant QR scanning at the event entrance using camera scanner or ticket verification.',
    icon: QrCode,
    tab: 'organizer',
    targetRole: 'Organizer / Admin',
    color: 'border-emerald-600 text-emerald-700 bg-emerald-50',
  },
  {
    step: 8,
    title: 'Participation & Feedback Recorded',
    desc: 'Attendance recorded. Students fill 5-question feedback rubric conforming to institutional format Record No. ACA/R/008A.',
    icon: Star,
    tab: 'events',
    targetRole: 'Student / Organizer',
    color: 'border-rose-500 text-rose-600 bg-rose-50',
  },
  {
    step: 9,
    title: 'Event Completion & Data Compilation',
    desc: 'Event marked complete. System compiles verified beneficiary headcount, feedback distribution, and PO attainment.',
    icon: Database,
    tab: 'organizer',
    targetRole: 'Organizer',
    color: 'border-teal-600 text-teal-700 bg-teal-50',
  },
  {
    step: 10,
    title: 'Automated Report Generation (ACA/D/021)',
    desc: 'Generates official college report in prescribed APCOER format with geo-tagged photograph overlays and PO/PEO/PSO matrix.',
    icon: FileText,
    tab: 'reports',
    targetRole: 'All Roles',
    color: 'border-indigo-600 text-indigo-700 bg-indigo-50',
  },
  {
    step: 11,
    title: 'Admin / Faculty Verification',
    desc: 'Four-tier institutional sign-off: Event Coordinator → Head of Department → IQAC Coordinator → Principal.',
    icon: Stamp,
    tab: 'reports',
    targetRole: 'Faculty / Admin',
    color: 'border-amber-600 text-amber-700 bg-amber-50',
  },
  {
    step: 12,
    title: 'Final Report Export (PDF / Print)',
    desc: 'Export finalized accreditation-compliant report in PDF / DOC / College Letterhead format with official stamps.',
    icon: Download,
    tab: 'reports',
    targetRole: 'All Roles',
    color: 'border-blue-600 text-blue-700 bg-blue-50',
  },
  {
    step: 13,
    title: 'Participation History & Analytics',
    desc: 'Student personal achievement records, PO mapping matrix, and admin participation metrics.',
    icon: BarChart3,
    tab: 'analytics',
    targetRole: 'Student / Admin',
    color: 'border-teal-700 text-teal-800 bg-teal-50',
  },
  {
    step: 14,
    title: 'Admin Dashboard & Accreditation Hub',
    desc: 'Central control room to track event stats, live attendance, verify accounts, and monitor compliance metrics.',
    icon: LayoutDashboard,
    tab: 'admin',
    targetRole: 'Admin',
    color: 'border-slate-800 text-slate-800 bg-slate-100',
  },
];

export const WorkflowMapModal: React.FC<WorkflowMapModalProps> = ({
  isOpen,
  onClose,
  onNavigateStep,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              CampusConnect Architecture Flowchart
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Smart College Event Management System</span>
              <span aria-hidden="true">·</span>
              <span>14-Step Institutional Pipeline</span>
              <span aria-hidden="true">·</span>
              <span>APCOER Pune Framework</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/60 rounded-lg p-4 text-xs text-blue-900 flex items-center justify-between">
            <div>
              <p className="font-semibold">Interactive Workflow Navigation</p>
              <p className="text-blue-700 mt-0.5">
                Click any step below to jump directly to that module in the system. Use the Demo Role Switcher in the top bar to test permissions.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {WORKFLOW_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex flex-col items-center">
                  <div
                    onClick={() => {
                      onNavigateStep(item.step, item.tab);
                      onClose();
                    }}
                    className="w-full group cursor-pointer p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all bg-white flex items-start gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 font-bold ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            STEP {String(item.step).padStart(2, '0')}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.targetRole}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    <div className="shrink-0 text-slate-400 group-hover:text-blue-600 self-center">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>

                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className="my-1 text-slate-300">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl text-xs text-slate-500">
          <span>Aligned with NBA / NAAC Institutional Co-curricular Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close Flowchart
          </button>
        </div>
      </div>
    </div>
  );
};
