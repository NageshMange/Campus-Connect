import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Registration, CollegeEvent } from '../types';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  QrCode,
  Star,
  Trophy,
} from 'lucide-react';

interface StudentHistoryViewProps {
  onViewTicket: (reg: Registration) => void;
  onSubmitFeedback: (event: CollegeEvent) => void;
  onViewReport: (event: CollegeEvent) => void;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({
  onViewTicket,
  onSubmitFeedback,
  onViewReport,
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<{
    totalRegistered: number;
    totalAttended: number;
    attendancePercentage: number;
    registrations: Registration[];
    poAchievements: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api
        .getStudentAnalytics(user._id)
        .then((data) => setAnalytics(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading student participation history...</div>;
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No participation records found for this student.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Profile & Achievement Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Student Participation History & Outcome Matrix (Step 13)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{user?.name}</span>
              <span aria-hidden="true">·</span>
              <span>PRN: {user?.prn || 'Not assigned'}</span>
              <span aria-hidden="true">·</span>
              <span>{user?.department}</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled Events
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {analytics.totalRegistered}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Verified Attendance
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              {analytics.totalAttended}
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
            <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
              Attendance Rate
            </div>
            <div className="text-2xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
              {analytics.attendancePercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Program Outcomes (PO) Attainment Matrix */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Co-Curricular Program Outcome (PO) Attainment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accumulated credits and exposure mapped from attended college events
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            NBA Criterion 3 Mapping
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(analytics.poAchievements).map(([po, count]) => (
            <div
              key={po}
              className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900">{po}</span>
                <div className="text-[10px] text-slate-500">Activity instances</div>
              </div>
              <span className="text-sm font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Events List */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Enrolled Event Records ({analytics.registrations.length})
        </h3>

        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
          {analytics.registrations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              You have not registered for any events yet. Browse events to register!
            </div>
          ) : (
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-2.5 text-left">Event Title</th>
                  <th className="px-4 py-2.5 text-left">Date & Venue</th>
                  <th className="px-4 py-2.5 text-left">Ticket Code</th>
                  <th className="px-4 py-2.5 text-center">Attendance</th>
                  <th className="px-4 py-2.5 text-center">Feedback</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {reg.eventTitle}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <div>{reg.eventDate}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {reg.eventVenue}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {reg.ticketCode}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {reg.attended ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Registered
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {reg.feedbackSubmitted ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">
                          ✓ Submitted
                        </span>
                      ) : reg.attended ? (
                        <span className="text-amber-700 font-semibold text-[11px]">
                          Pending
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewTicket(reg)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
