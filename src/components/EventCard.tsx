import React from 'react';
import { CollegeEvent, Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Ticket,
  FileText,
  Star,
  CheckCircle2,
  Users,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface EventCardProps {
  event: CollegeEvent;
  userRegistration?: Registration;
  onRegister: (event: CollegeEvent) => void;
  onViewTicket: (reg: Registration) => void;
  onScanQR: (event: CollegeEvent) => void;
  onViewReport: (event: CollegeEvent) => void;
  onSubmitFeedback: (event: CollegeEvent) => void;
  onApproveEvent?: (event: CollegeEvent) => void;
  onEraseEvent?: (event: CollegeEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  userRegistration,
  onRegister,
  onViewTicket,
  onScanQR,
  onViewReport,
  onSubmitFeedback,
  onApproveEvent,
  onEraseEvent,
}) => {
  const { user } = useAuth();

  const isStudent = user?.role === 'student';
  const isOrganizer = user?.role === 'organizer';
  const isAdmin = user?.role === 'admin';

  const isRegistered = !!userRegistration;
  const hasAttended = userRegistration?.attended;
  const feedbackSubmitted = userRegistration?.feedbackSubmitted;

  const capacityPercent = event.capacity
    ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Banner with subtle overlay & category */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={event.bannerUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded text-[11px] font-medium">
            <span>{event.category}</span>
            <span aria-hidden="true">·</span>
            <span>{event.organizerType}</span>
          </div>

          {/* Status Flag */}
          <div className="absolute top-3 right-3">
            {event.status === 'approved' && (
              <span className="bg-emerald-600/90 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                Open for Registration
              </span>
            )}
            {event.status === 'pending_approval' && (
              <span className="bg-amber-600/90 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Pending Admin Approval
              </span>
            )}
            {event.status === 'completed' && (
              <span className="bg-slate-700/90 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed & Compiled
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Metadata clean unboxed text */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{event.department}</span>
            <span aria-hidden="true">·</span>
            <span>Coord: {event.facultyCoordinator}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
            {event.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2">
            {event.briefDescription || event.description}
          </p>

          {/* Logistics Strip */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.date}</span>
              <Clock className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
              <span>
                {event.startTime} - {event.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Registration Progress */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Registrations
              </span>
              <span className="font-mono tabular-nums">
                {event.registeredCount} / {event.capacity} ({capacityPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  capacityPercent >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${capacityPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
        {/* Student View Options */}
        {isStudent && (
          <>
            {event.status === 'approved' && !isRegistered && (
              <button
                onClick={() => onRegister(event)}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-4 h-4" /> Register & Generate Pass
              </button>
            )}

            {isRegistered && !hasAttended && (
              <button
                onClick={() => onViewTicket(userRegistration)}
                className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" /> View My QR Ticket Badge
              </button>
            )}

            {isRegistered && hasAttended && !feedbackSubmitted && (
              <button
                onClick={() => onSubmitFeedback(event)}
                className="w-full py-2 px-3 text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Star className="w-4 h-4 text-amber-600" /> Submit Student Feedback (ACA/R/008A)
              </button>
            )}

            {isRegistered && hasAttended && feedbackSubmitted && (
              <div className="w-full flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attendance & Feedback Recorded
                </span>
                <button
                  onClick={() => onViewReport(event)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View Report
                </button>
              </div>
            )}

            {event.status === 'completed' && !isRegistered && (
              <button
                onClick={() => onViewReport(event)}
                className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-slate-500" /> View Institutional Report
              </button>
            )}
          </>
        )}

        {/* Organizer / Admin Actions */}
        {(isOrganizer || isAdmin) && (
          <div className="w-full flex items-center gap-2">
            {event.status === 'approved' && (
              <button
                onClick={() => onScanQR(event)}
                className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1"
                title="Scan attendee passes at entrance"
              >
                <QrCode className="w-3.5 h-3.5" /> Scan Attendance
              </button>
            )}

            {event.status === 'pending_approval' && isAdmin && onApproveEvent && (
              <button
                onClick={() => onApproveEvent(event)}
                className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Event (Step 4)
              </button>
            )}

            <button
              onClick={() => onViewReport(event)}
              className="py-1.5 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1"
              title="Official Institutional Report (ACA/D/021)"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Report
            </button>

            {isAdmin && onEraseEvent && (
              <button
                onClick={() => onEraseEvent(event)}
                className="py-1.5 px-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Admin privilege: Erase event completely from website"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Erase</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
