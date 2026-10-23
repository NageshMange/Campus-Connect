import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CollegeEvent, Registration } from '../types';
import {
  CalendarPlus,
  QrCode,
  FileText,
  Star,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Trash2,
} from 'lucide-react';

interface OrganizerDeskViewProps {
  onOpenCreateEvent: () => void;
  onOpenQRScanner: (event: CollegeEvent) => void;
  onOpenReport: (event: CollegeEvent) => void;
  onOpenFeedback: (event: CollegeEvent) => void;
}

export const OrganizerDeskView: React.FC<OrganizerDeskViewProps> = ({
  onOpenCreateEvent,
  onOpenQRScanner,
  onOpenReport,
  onOpenFeedback,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const list = await api.getEvents();
      // Show events created by this organizer or if admin, show all
      if (user?.role === 'admin') {
        setEvents(list);
      } else {
        setEvents(list.filter((e) => e.organizerId === user?._id || e.facultyCoordinator === user?.name));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleCompleteEvent = async (eventId: string) => {
    try {
      setCompletingId(eventId);
      await api.completeEvent(eventId);
      await fetchEvents();
    } catch (e) {
      console.error(e);
    } finally {
      setCompletingId(null);
    }
  };

  const handleEraseEvent = async (eventId: string, title: string) => {
    const confirmed = window.confirm(
      `PERMANENT EVENT ERASURE (Admin Privilege):\n\nAre you sure you want to completely erase "${title}" from the website?\n\nAll attendee records, attendance check-ins, and feedbacks will be permanently purged from the database.`
    );
    if (!confirmed) return;
    try {
      await api.eraseEventCompletely(eventId);
      await fetchEvents();
    } catch (e: any) {
      alert(e.message || 'Failed to erase event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {user?.organizerType || 'Faculty Coordinator'}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Organizer Desk & Event Operations
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Coordinating department: {user?.department} · Account: {user?.name}
            </p>
          </div>

          <button
            onClick={onOpenCreateEvent}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <CalendarPlus className="w-4 h-4" /> Create New Event (Step 3)
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Managed Events ({events.length})
          </h3>
          <span className="text-xs text-slate-400">
            Scan attendee passes, complete sessions, and compile institutional reports
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-3">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No events created yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first event with objectives and PO mappings to submit for administrative approval.
            </p>
            <button
              onClick={onOpenCreateEvent}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4" /> Create Event Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((evt) => (
              <div
                key={evt._id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-600">{evt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{evt.organizerType}</span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {evt.status.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{evt.title}</h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {evt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {evt.startTime} - {evt.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {evt.venue}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-medium text-slate-800">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {evt.attendedCount} / {evt.registeredCount} Attended
                    </span>
                  </div>
                </div>

                {/* Organizer Control Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {(evt.status === 'approved' || evt.status === 'completed') && (
                    <button
                      onClick={() => onOpenQRScanner(evt)}
                      className="flex-1 md:flex-initial px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      title="Simplified Attendance & Check-in Terminal"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Attendance Check-in ({evt.attendedCount || 0}/{evt.registeredCount || 0})
                    </button>
                  )}

                  {evt.status === 'approved' && (
                    <button
                      onClick={() => handleCompleteEvent(evt._id)}
                      disabled={completingId === evt._id}
                      className="flex-1 md:flex-initial px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      title="Step 9: Event Completion & Data Compilation"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete Event (Step 9)
                    </button>
                  )}

                  <button
                    onClick={() => onOpenReport(evt)}
                    className="flex-1 md:flex-initial px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    title="Step 10: Automated Report Generation ACA/D/021"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" /> Report ACA/D/021
                  </button>

                  <button
                    onClick={() => onOpenFeedback(evt)}
                    className="flex-1 md:flex-initial px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    title="Student Feedback Summary ACA/R/008A"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-600" /> Feedback (ACA/R/008A)
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleEraseEvent(evt._id, evt.title)}
                      className="flex-1 md:flex-initial px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Admin Privilege: Erase event completely from website"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Erase
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
