import React, { useState, useEffect } from 'react';
import { Registration } from '../types';
import { api } from '../services/api';
import { X, Printer, CheckCircle, Calendar, Clock, MapPin, Hash, User } from 'lucide-react';

interface TicketModalProps {
  registration: Registration | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ registration, isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registration) {
      setLoading(true);
      api
        .getTicketQR(registration.ticketCode)
        .then((res) => setQrUrl(res.qrDataUrl))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Pass Header */}
        <div className="bg-slate-900 text-white p-5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-widest font-mono uppercase text-slate-300">
              CampusConnect Verified Pass
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white rounded-lg p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-base font-bold mt-2 leading-snug">
            {registration.eventTitle}
          </h2>
          <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <span>Ticket: {registration.ticketCode}</span>
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6 bg-slate-50 flex flex-col items-center justify-center border-b border-dashed border-slate-300 relative">
          {/* Side notches for ticket appearance */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900/60 rounded-full"></div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900/60 rounded-full"></div>

          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            {loading ? (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            ) : qrUrl ? (
              <img src={qrUrl} alt="Event QR Code" className="w-48 h-48 object-contain" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400 font-mono">
                {registration.ticketCode}
              </div>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-2 font-bold tracking-wider">
            {registration.ticketCode}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Present this QR at the venue entrance for automated attendance scan
          </p>

          {registration.attended && (
            <div className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Attendance Confirmed
            </div>
          )}
        </div>

        {/* Attendee Details */}
        <div className="p-6 space-y-3 text-xs bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Attendee</div>
              <div className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> {registration.userName}
              </div>
              <div className="text-slate-500 text-[11px]">{registration.department}</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">PRN / Roll No</div>
              <div className="font-mono font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> {registration.prn || 'N/A'}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Date & Time</div>
              <div className="text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {registration.eventDate}
              </div>
              <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" /> {registration.eventTime}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Venue</div>
              <div className="text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{registration.eventVenue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            APCOER Institutional ID
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save Pass
          </button>
        </div>
      </div>
    </div>
  );
};
