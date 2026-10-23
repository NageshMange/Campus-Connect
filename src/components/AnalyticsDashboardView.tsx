import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardStats, InstitutionalReport } from '../types';
import {
  BarChart3,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  Building2,
  FileText,
  Star,
  Download,
  Printer,
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  onOpenReport: (reportId: string) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  onOpenReport,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<InstitutionalReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardAnalytics(), api.getAllReports()])
      .then(([s, r]) => {
        setStats(s);
        setReports(r);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading analytics...</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Participation Analytics & Institutional Intelligence (Steps 13 & 14)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time analytics for NAAC / NBA criteria, attendance trends, and departmental performance.
            </p>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Events
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {stats.totalEvents}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {stats.upcomingEvents} active / {stats.completedEvents} completed
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Registrations
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
              {stats.totalRegistrations}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Digital passes issued
            </span>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Verified Attendance
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block tabular-nums">
              {stats.totalAttendance}
            </span>
            <span className="text-[10px] text-emerald-600 mt-1 block">
              Scanned via QR terminal
            </span>
          </div>

          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
              Attendance Rate
            </span>
            <span className="text-2xl font-bold font-mono text-blue-700 mt-1 block tabular-nums">
              {stats.attendanceRate}%
            </span>
            <span className="text-[10px] text-blue-600 mt-1 block">
              Show-up ratio
            </span>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Feedback Quality
            </span>
            <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block tabular-nums">
              {stats.overallSatisfactionRate}%
            </span>
            <span className="text-[10px] text-amber-600 mt-1 block">
              {stats.totalFeedbackCount} survey responses
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Organizer Type Distribution & Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organizer Type Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Organizer Entity Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Step 1 Taxonomy</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.organizerTypeBreakdown).map(([type, count]) => {
              const pct = stats.totalEvents > 0 ? Math.round((count / stats.totalEvents) * 100) : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{type}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {count} events ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Department Activity Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Cross-Disciplinary Reach</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.departmentBreakdown).map(([dept, count]) => {
              const pct = stats.totalEvents > 0 ? Math.round((count / stats.totalEvents) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Institutional Accreditation Archive (ACA/D/021 & ACA/R/008A) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Institutional Accreditation Documentation Archive
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pre-compiled institutional compliance reports adhering to Record ACA/D/021 and ACA/R/008A
            </p>
          </div>
          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            Audit-Ready
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="px-4 py-2.5 text-left">Record No.</th>
                <th className="px-4 py-2.5 text-left">Event Title & Coordinator</th>
                <th className="px-4 py-2.5 text-left">Event Date</th>
                <th className="px-4 py-2.5 text-center">Beneficiaries</th>
                <th className="px-4 py-2.5 text-center">Accreditation Status</th>
                <th className="px-4 py-2.5 text-right">View / Print (Step 12)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <tr key={rep._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">
                    {rep.collegeHeader.recordNo}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{rep.nameOfEvent}</div>
                    <div className="text-[11px] text-slate-500">
                      Coord: {rep.nameOfCoordinator} · {rep.department}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600">{rep.dateOfEvent}</td>

                  <td className="px-4 py-3 text-center font-mono font-bold tabular-nums">
                    {rep.beneficiariesCount}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />{' '}
                      {rep.verification.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onOpenReport(rep.eventId)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> View ACA/D/021
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
