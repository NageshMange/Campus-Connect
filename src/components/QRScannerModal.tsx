import React, { useState, useEffect, useRef } from 'react';
import { CollegeEvent, Registration } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  X,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  UserCheck,
  UserPlus,
  Download,
  Copy,
  Check,
  Filter,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface QRScannerModalProps {
  event: CollegeEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onAttendanceMarked: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  event,
  isOpen,
  onClose,
  onAttendanceMarked,
}) => {
  const [fastInput, setFastInput] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableFilter, setTableFilter] = useState<'all' | 'present' | 'pending'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [showSpotEntry, setShowSpotEntry] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [spotPrn, setSpotPrn] = useState('');
  const [spotDept, setSpotDept] = useState('Computer Engineering');
  const [copiedPrns, setCopiedPrns] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    studentName?: string;
    prn?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRegistrations = async () => {
    if (!event) return;
    try {
      setLoading(true);
      const list = await api.getEventRegistrations(event._id);
      setRegistrations(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event) {
      fetchRegistrations();
      setScanResult(null);
      setFastInput('');
      setShowSpotEntry(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  // Universal Quick Check-in (accepts PRN, Ticket Code, Email, or Name)
  const handleQuickCheckin = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    try {
      setActionLoading('quick');
      const res = await api.scanAttendance(code, event._id);
      setScanResult({
        success: true,
        message: res.message,
        studentName: res.registration.userName,
        prn: res.registration.prn,
      });

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
      });

      setFastInput('');
      await fetchRegistrations();
      onAttendanceMarked();
      inputRef.current?.focus();
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || 'No matching student record found.',
      });
      inputRef.current?.focus();
    } finally {
      setActionLoading(null);
    }
  };

  // 1-Click Toggle Attendance (Present <-> Absent)
  const handleToggleAttendance = async (regId: string, attended: boolean) => {
    try {
      setActionLoading(regId);
      await api.toggleAttendance(regId, attended);
      setRegistrations((prev) =>
        prev.map((r) =>
          r._id === regId
            ? { ...r, attended, attendedAt: attended ? new Date().toISOString() : undefined }
            : r
        )
      );
      onAttendanceMarked();
    } catch (e: any) {
      alert(e.message || 'Failed to update attendance');
    } finally {
      setActionLoading(null);
    }
  };

  // Spot registration & check-in
  const handleSpotEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotName.trim()) return;

    try {
      setActionLoading('spot');
      const res = await api.spotRegisterAttendance(event._id, {
        name: spotName.trim(),
        prn: spotPrn.trim() || undefined,
        department: spotDept,
      });

      setScanResult({
        success: true,
        message: res.message,
        studentName: res.registration.userName,
        prn: res.registration.prn,
      });

      setSpotName('');
      setSpotPrn('');
      setShowSpotEntry(false);
      await fetchRegistrations();
      onAttendanceMarked();
    } catch (e: any) {
      alert(e.message || 'Failed to process spot registration');
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk mark all registered as present
  const handleMarkAllPresent = async () => {
    if (!window.confirm(`Mark all ${registrations.length} registered students as Present?`)) {
      return;
    }
    try {
      setActionLoading('mark_all');
      await api.markAllAttendance(event._id);
      await fetchRegistrations();
      onAttendanceMarked();
      setScanResult({
        success: true,
        message: `All ${registrations.length} students marked present successfully.`,
      });
    } catch (e: any) {
      alert(e.message || 'Failed to mark all attendance');
    } finally {
      setActionLoading(null);
    }
  };

  // Copy present PRNs to clipboard
  const handleCopyPresentPRNs = () => {
    const presentPRNs = registrations
      .filter((r) => r.attended && r.prn)
      .map((r) => r.prn)
      .join(', ');

    if (!presentPRNs) {
      alert('No students marked present yet.');
      return;
    }

    navigator.clipboard.writeText(presentPRNs);
    setCopiedPrns(true);
    setTimeout(() => setCopiedPrns(false), 2500);
  };

  // Export Attendance CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to export.');
      return;
    }
    const headers = ['Student Name', 'PRN', 'Department', 'Ticket Code', 'Attended', 'Check-in Time'];
    const rows = registrations.map((r) => [
      `"${r.userName}"`,
      `"${r.prn || 'N/A'}"`,
      `"${r.department}"`,
      `"${r.ticketCode}"`,
      r.attended ? 'Present' : 'Absent',
      r.attendedAt ? `"${new Date(r.attendedAt).toLocaleString()}"` : 'N/A',
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_${event.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const attendedCount = registrations.filter((r) => r.attended).length;
  const pendingCount = registrations.length - attendedCount;
  const attendanceRate =
    registrations.length > 0 ? Math.round((attendedCount / registrations.length) * 100) : 0;

  // Filtered Roster
  const filteredRegistrations = registrations.filter((r) => {
    if (tableFilter === 'present' && !r.attended) return false;
    if (tableFilter === 'pending' && r.attended) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        r.userName.toLowerCase().includes(q) ||
        (r.prn && r.prn.toLowerCase().includes(q)) ||
        r.ticketCode.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <ScanLine className="w-5 h-5 text-blue-600" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Simplified Attendance Check-in Terminal
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                  {event.title} · {event.venue} ({event.date})
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Attendance Counter Strip */}
        <div className="px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">REGISTERED:</span>
              <span className="font-bold text-white text-sm">{registrations.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">PRESENT:</span>
              <span className="font-bold text-emerald-400 text-sm tabular-nums">
                {attendedCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">PENDING:</span>
              <span className="font-bold text-amber-400 text-sm tabular-nums">
                {pendingCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">CHECK-IN RATE:</span>
              <span className="font-bold text-blue-400 text-sm tabular-nums">{attendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Universal Fast Check-In Input Bar */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick PRN / Ticket / Name Check-in (Press Enter)
              </label>
              <span className="text-[11px] text-blue-700 font-medium">
                Type Student PRN & hit Enter to mark present
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={fastInput}
                  onChange={(e) => setFastInput(e.target.value)}
                  placeholder="Enter Student PRN (e.g. 72120045B) or scan Ticket QR..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 bg-white shadow-2xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQuickCheckin(fastInput);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleQuickCheckin(fastInput)}
                disabled={actionLoading === 'quick' || !fastInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Present</span>
              </button>
            </div>

            {/* Scan Feedback Banner */}
            {scanResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                  scanResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold">{scanResult.message}</div>
                  {scanResult.studentName && (
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      Student: <strong>{scanResult.studentName}</strong> · PRN: <strong>{scanResult.prn || 'N/A'}</strong>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Walk-in / Spot Entry Drawer */}
          {showSpotEntry ? (
            <form
              onSubmit={handleSpotEntry}
              className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <UserPlus className="w-4 h-4 text-amber-700" />
                  <span>On-the-Spot Walk-in Check-in (Instant Pass & Attendance)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSpotEntry(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. Rahul Shinde"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    PRN / Roll Number
                  </label>
                  <input
                    type="text"
                    value={spotPrn}
                    onChange={(e) => setSpotPrn(e.target.value)}
                    placeholder="e.g. 72120088C"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={spotDept}
                    onChange={(e) => setSpotDept(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electronics & Telecommunication">E&TC</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="First Year Engineering">First Year</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSpotEntry(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'spot'}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Register & Mark Present</span>
                </button>
              </div>
            </form>
          ) : null}

          {/* Roster Controls: Search, Filters, and Quick Tools */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTableFilter('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tableFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({registrations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter('present')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tableFilter === 'present'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  Present ({attendedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter('pending')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tableFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {!showSpotEntry && (
                  <button
                    type="button"
                    onClick={() => setShowSpotEntry(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ Spot Entry</span>
                  </button>
                )}

                {registrations.length > 0 && pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    disabled={actionLoading === 'mark_all'}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark All Present</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyPresentPRNs}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                  title="Copy Present Student PRNs"
                >
                  {copiedPrns ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{copiedPrns ? 'Copied PRNs!' : 'Copy PRNs'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                  title="Export Attendance Sheet to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search registered students by name, PRN, or department..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            {/* Registered Student Roster Table with 1-Click Toggle */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading roster...</div>
              ) : registrations.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-slate-600 font-medium">No registrations yet for this event</div>
                  <p className="text-xs text-slate-400">
                    Use the Quick PRN bar or "+ Spot Entry" above to record walk-in attendees.
                  </p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No students match the current filter.
                </div>
              ) : (
                <table className="w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left">Student Name</th>
                      <th className="px-3.5 py-2.5 text-left">PRN / Dept</th>
                      <th className="px-3.5 py-2.5 text-left">Pass Code</th>
                      <th className="px-3.5 py-2.5 text-center">Status</th>
                      <th className="px-3.5 py-2.5 text-right">1-Click Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRegistrations.map((reg) => (
                      <tr
                        key={reg._id}
                        className={`transition-colors ${
                          reg.attended ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">
                          <div>{reg.userName}</div>
                          <div className="text-[10px] text-slate-400">{reg.userEmail}</div>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600">
                          <div className="font-mono font-semibold text-slate-800">{reg.prn || '—'}</div>
                          <div className="text-[10px] text-slate-400">{reg.department}</div>
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-500">
                          {reg.ticketCode}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          {reg.attended ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          {reg.attended ? (
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(reg._id, false)}
                              disabled={actionLoading === reg._id}
                              className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                              title="Undo and mark absent"
                            >
                              <RotateCcw className="w-3 h-3 text-slate-400" />
                              <span>Undo</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(reg._id, true)}
                              disabled={actionLoading === reg._id}
                              className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Present</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live attendance auto-syncs with Institutional Record ACA/D/021</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
