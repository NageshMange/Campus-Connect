import React, { useState, useEffect } from 'react';
import { User, CollegeEvent, InstitutionalReport } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  FileText,
  BarChart3,
  Award,
  Layers,
  Lock,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  Trash2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

interface AdminVerificationPanelProps {
  onEventUpdated: () => void;
  onOpenReport: (event: CollegeEvent) => void;
}

export const AdminVerificationPanel: React.FC<AdminVerificationPanelProps> = ({
  onEventUpdated,
  onOpenReport,
}) => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [reports, setReports] = useState<InstitutionalReport[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'reports' | 'security'>('events');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'pending_organizers' | 'organizer' | 'student'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Erase Previous Events Confirmation Modal
  const [showEraseModal, setShowEraseModal] = useState(false);

  // New User Modal inside Admin Panel
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'organizer' as 'student' | 'organizer',
    department: 'Computer Engineering',
    organizerType: 'Faculty / Committee',
    designation: 'Assistant Professor',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uList, eList, rList] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getEvents().catch(() => []),
        api.getAllReports().catch(() => []),
      ]);
      setUsers(uList);
      setEvents(eList);
      setReports(rList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      setActionLoading(`user_${userId}`);
      await api.verifyUser(userId, verified);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, verified } : u))
      );
      showNotification(`User verification status updated to ${verified ? 'Verified' : 'Unverified'}`);
    } catch (e: any) {
      alert(e.message || 'Failed to update user verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveOrganizer = async (userId: string) => {
    try {
      setActionLoading(`user_${userId}`);
      await api.approveUser(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, verified: true, approvalStatus: 'approved' } : u
        )
      );
      showNotification('Organizer registration approved. Account is now active.');
    } catch (e: any) {
      alert(e.message || 'Failed to approve organizer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOrganizer = async (userId: string) => {
    if (!window.confirm('Decline this organizer registration?')) return;
    try {
      setActionLoading(`user_${userId}`);
      await api.rejectUser(userId, 'Application declined by College Administration.');
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, verified: false, approvalStatus: 'rejected' } : u
        )
      );
      showNotification('Organizer registration declined.');
    } catch (e: any) {
      alert(e.message || 'Failed to decline organizer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      setActionLoading(`user_${userId}`);
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showNotification('User account removed.');
    } catch (e: any) {
      alert(e.message || 'Failed to remove user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateEventStatus = async (
    eventId: string,
    status: string,
    adminRemarks?: string
  ) => {
    try {
      setActionLoading(`event_${eventId}`);
      await api.updateEventStatus(eventId, status, adminRemarks);
      await fetchData();
      onEventUpdated();
      showNotification(`Event ${status === 'approved' ? 'approved and published' : 'status updated'}`);
    } catch (e: any) {
      alert(e.message || 'Failed to update event status');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Privilege: Erase single event completely from website & database
  const handleEraseEvent = async (eventId: string, eventTitle: string) => {
    const confirmed = window.confirm(
      `PERMANENT EVENT ERASURE (Principal / Admin Privilege):\n\nAre you sure you want to completely erase "${eventTitle}" from the website?\n\nThis will permanently delete:\n• The event entry\n• All student registration passes\n• All attendance check-in records\n• All student feedback ratings\n• The institutional report (ACA/D/021)\n\nThis operation CANNOT be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(`erase_${eventId}`);
      const res = await api.eraseEventCompletely(eventId);
      await fetchData();
      onEventUpdated();
      showNotification(res.message || `Event "${eventTitle}" erased completely from the website.`);
    } catch (e: any) {
      alert(e.message || 'Failed to erase event');
    } finally {
      setActionLoading(null);
    }
  };

  // Admin Privilege: Erase all previous/completed events completely
  const handleErasePreviousEvents = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetPrevious = events.filter(
      (e) => e.status === 'completed' || (e.date && e.date < todayStr)
    );

    if (targetPrevious.length === 0) {
      alert('There are no previous or completed events in the database to erase.');
      setShowEraseModal(false);
      return;
    }

    try {
      setActionLoading('erase_bulk_previous');
      const res = await api.erasePreviousEvents({ includeCompleted: true, beforeDate: todayStr });
      await fetchData();
      onEventUpdated();
      setShowEraseModal(false);
      showNotification(res.message || `Erased ${res.erasedCount} previous events completely.`);
    } catch (e: any) {
      alert(e.message || 'Failed to erase previous events');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignReportAsPrincipal = async (reportId: string) => {
    try {
      setActionLoading(`report_${reportId}`);
      await api.verifyReport(
        reportId,
        'principalSign',
        user?.name || 'Dr. Sunil Thakare (Principal)',
        'Approved institutional report for academic and NBA/NAAC audit record.'
      );
      const updatedReports = await api.getAllReports();
      setReports(updatedReports);
      showNotification('Report officially signed and approved by Principal.');
    } catch (e: any) {
      alert(e.message || 'Failed to sign report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create_user');
      await api.register({
        ...newUserData,
        verified: true,
      });
      setShowAddUserModal(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'organizer',
        department: 'Computer Engineering',
        organizerType: 'Faculty / Committee',
        designation: 'Assistant Professor',
      });
      await fetchData();
      showNotification('New account created and verified successfully.');
    } catch (e: any) {
      alert(e.message || 'Failed to create user account');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingOrganizers = users.filter((u) => u.role === 'organizer' && !u.verified);
  const pendingUsers = users.filter((u) => !u.verified);
  const pendingEvents = events.filter((e) => e.status === 'pending_approval');
  const approvedEvents = events.filter((e) => e.status === 'approved');
  const completedEvents = events.filter((e) => e.status === 'completed');
  const todayStr = new Date().toISOString().split('T')[0];
  const previousEvents = events.filter(
    (e) => e.status === 'completed' || (e.date && e.date < todayStr)
  );

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter === 'pending_organizers') {
      if (u.role !== 'organizer' || u.verified) return false;
    } else if (userRoleFilter !== 'all' && u.role !== userRoleFilter) {
      return false;
    }
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        (u.prn && u.prn.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredEvents = events.filter((e) => {
    if (eventSearchQuery.trim()) {
      const q = eventSearchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.facultyCoordinator.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-700 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Institutional Top Header */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src="/assets/aistudio/ap1_3c1c1923.jpg"
              alt="APCOER Logo"
              className="w-14 h-16 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xs shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  APCOER Institutional Administration
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Administrative Control & Accreditation Center
              </h1>

              <p className="text-xs text-slate-600 max-w-2xl">
                Anantrao Pawar College of Engineering & Research, Pune · Institutional workflow governance for event approvals, student and organizer verification, NBA/NAAC compliance, and official record audits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Sign off from website"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Off</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] font-medium text-slate-500">Pending Event Approvals</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span>{pendingEvents.length}</span>
              {pendingEvents.length > 0 && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                  Action Required
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] font-medium text-slate-500">Published / Active Events</div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">
              {approvedEvents.length + completedEvents.length}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] font-medium text-slate-500">Pending Organizer Approvals</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span>{pendingOrganizers.length}</span>
              {pendingOrganizers.length > 0 && (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                  Approval Required
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="text-[11px] font-medium text-slate-500">Institutional Records (ACA)</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">
              {reports.length}
            </div>
          </div>
        </div>

        {/* Tab Navigation inside Admin Panel */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Event Moderation & Approvals</span>
            {pendingEvents.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingEvents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Organizer Approvals & Users</span>
            {pendingOrganizers.length > 0 ? (
              <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                {pendingOrganizers.length} pending
              </span>
            ) : pendingUsers.length > 0 ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingUsers.length}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Accreditation Records (ACA/D/021)</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>System Governance</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EVENT APPROVALS & MODERATION (Steps 4 & 5) */}
      {/* ======================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Pending Events Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Pending Event Approvals (Step 4)</span>
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-mono px-2 py-0.5 rounded-full">
                    {pendingEvents.length} awaiting review
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review proposed events submitted by departments and student clubs before publishing to the college catalog.
                </p>
              </div>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-slate-900">
                  No Pending Event Submissions
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All submitted college events have been reviewed. New submissions from faculty coordinators and student clubs will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingEvents.map((evt) => (
                  <div
                    key={evt._id}
                    className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {evt.category}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-slate-700">{evt.organizerType}</span>
                          <span>·</span>
                          <span>Dept: {evt.department}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                          {evt.briefDescription || evt.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateEventStatus(
                              evt._id,
                              'approved',
                              'Approved by APCOER Principal & Administration for college-wide registration.'
                            )
                          }
                          disabled={actionLoading === `event_${evt._id}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Publish (Step 4 → 5)</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdateEventStatus(
                              evt._id,
                              'rejected',
                              'Please revise objectives and target CO-PO mapping before resubmitting.'
                            )
                          }
                          disabled={actionLoading === `event_${evt._id}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleEraseEvent(evt._id, evt.title)}
                          disabled={actionLoading === `erase_${evt._id}`}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-800 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Erase completely from database"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Erase</span>
                        </button>
                      </div>
                    </div>

                    {/* Event Logistics Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: {evt.date}</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                        <span>{evt.startTime} - {evt.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Coordinator: </span>
                        <span>{evt.facultyCoordinator}</span>
                      </div>
                    </div>

                    {/* Stated Objectives */}
                    {evt.objectives && evt.objectives.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 block mb-1">
                          Academic & Skill Objectives:
                        </span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {evt.objectives.slice(0, 3).map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Master Events Catalog & Status Management */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  College Event Registry ({filteredEvents.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Manage published, ongoing, completed, and archived events across all departments.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowEraseModal(true)}
                  disabled={previousEvents.length === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    previousEvents.length > 0
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-2xs cursor-pointer'
                      : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                  title="Admin privilege to permanently erase previous and completed events completely from database"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Erase Previous Events ({previousEvents.length})</span>
                </button>

                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    placeholder="Filter events..."
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-2xs">
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Event Title & Dept</th>
                    <th className="px-4 py-3 text-left">Category / Organizer</th>
                    <th className="px-4 py-3 text-left">Date & Venue</th>
                    <th className="px-4 py-3 text-center">Registrations</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((evt) => (
                    <tr key={evt._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="font-bold text-slate-900">{evt.title}</div>
                        <div className="text-[11px] text-slate-500">Dept: {evt.department}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="font-medium text-blue-700">{evt.category}</span>
                        <div className="text-[10px] text-slate-400">{evt.organizerType}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{evt.date}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{evt.venue}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums">
                        <span className="font-bold text-slate-900">{evt.registeredCount}</span>
                        <span className="text-slate-400"> / {evt.capacity}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {evt.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Approved
                          </span>
                        )}
                        {evt.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Completed
                          </span>
                        )}
                        {evt.status === 'pending_approval' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Pending Review
                          </span>
                        )}
                        {evt.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenReport(evt)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                          >
                            ACA Report
                          </button>
                          <button
                            onClick={() => handleEraseEvent(evt._id, evt.title)}
                            disabled={actionLoading === `erase_${evt._id}`}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Erase event completely from website"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ORGANIZER APPROVALS & USER DIRECTORY */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Organizer Approval & Institutional Directory</span>
                {pendingOrganizers.length > 0 && (
                  <span className="bg-amber-500 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {pendingOrganizers.length} organizer{pendingOrganizers.length > 1 ? 's' : ''} awaiting approval
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve event organizer registrations (Student registration is instant and requires no admin approval).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Pre-Verified Account</span>
              </button>
            </div>
          </div>

          {/* Pending Organizer Approvals Dedicated Callout Box */}
          {pendingOrganizers.length > 0 && (
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Pending Organizer Applications ({pendingOrganizers.length})
                    </h3>
                    <p className="text-[11px] text-amber-800">
                      Action required by Dr. Sunil Thakare (Principal / Admin) before organizers can log in and publish events.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Policy: Approval Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {pendingOrganizers.map((org) => (
                  <div
                    key={org._id}
                    className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{org.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{org.email}</div>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                          {org.organizerType || 'Organizer'}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                        <div>Department: <span className="font-semibold text-slate-800">{org.department}</span></div>
                        {org.designation && <div>Role: <span className="font-semibold text-slate-800">{org.designation}</span></div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApproveOrganizer(org._id)}
                        disabled={actionLoading === `user_${org._id}`}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Organizer
                      </button>
                      <button
                        onClick={() => handleRejectOrganizer(org._id)}
                        disabled={actionLoading === `user_${org._id}`}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name, PRN, email, or department..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                  userRoleFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Accounts ({users.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('pending_organizers')}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                  userRoleFilter === 'pending_organizers'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : pendingOrganizers.length > 0
                    ? 'text-amber-800 bg-amber-100 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending Approvals</span>
                {pendingOrganizers.length > 0 && (
                  <span className={`text-[10px] px-1.5 rounded-full ${userRoleFilter === 'pending_organizers' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'}`}>
                    {pendingOrganizers.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setUserRoleFilter('organizer')}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                  userRoleFilter === 'organizer'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organizers ({users.filter((u) => u.role === 'organizer').length})
              </button>
              <button
                onClick={() => setUserRoleFilter('student')}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                  userRoleFilter === 'student'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Students ({users.filter((u) => u.role === 'student').length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-2xs">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">User Name & Institutional Email</th>
                  <th className="px-4 py-3 text-left">Role / Entity</th>
                  <th className="px-4 py-3 text-left">Department / PRN</th>
                  <th className="px-4 py-3 text-center">Approval Status</th>
                  <th className="px-4 py-3 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No matching accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {u.name}
                          {u.role === 'admin' && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                              Admin (Principal)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-semibold capitalize text-slate-900">{u.role}</div>
                        {u.organizerType && (
                          <div className="text-[10px] text-blue-700 font-medium">{u.organizerType}</div>
                        )}
                        {u.designation && (
                          <div className="text-[10px] text-slate-400">{u.designation}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-medium text-slate-900">{u.department}</div>
                        {u.prn && <div className="text-[10px] font-mono text-slate-400">PRN: {u.prn}</div>}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {u.role === 'student' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" title="Instant student access - no admin approval required">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Instant Access</span>
                          </span>
                        ) : u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            <span>Administrator</span>
                          </span>
                        ) : u.verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved Organizer</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Admin Approval</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.role === 'organizer' && !u.verified ? (
                            <>
                              <button
                                onClick={() => handleApproveOrganizer(u._id)}
                                disabled={actionLoading === `user_${u._id}`}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectOrganizer(u._id)}
                                disabled={actionLoading === `user_${u._id}`}
                                className="px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          ) : u.role === 'organizer' && u.verified ? (
                            <button
                              onClick={() => handleVerifyUser(u._id, false)}
                              disabled={actionLoading === `user_${u._id}`}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                              title="Revoke access"
                            >
                              Revoke
                            </button>
                          ) : null}

                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={actionLoading === `user_${u._id}`}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove user account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ACCREDITATION RECORDS & REPORTS (ACA/D/021) */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Institutional Accreditation Reports (ACA/D/021)</span>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-mono px-2 py-0.5 rounded-full">
                  {reports.length} generated
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliance archive matching the official APCOER Alumni & Event Report format with CO-PO mapping and photo proof.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-2xs">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Event Report & Record No.</th>
                  <th className="px-4 py-3 text-left">Department & Coordinator</th>
                  <th className="px-4 py-3 text-left">Event Date</th>
                  <th className="px-4 py-3 text-center">Beneficiaries</th>
                  <th className="px-4 py-3 text-center">Verification Status</th>
                  <th className="px-4 py-3 text-right">Administrative Sign-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">{rep.nameOfEvent}</div>
                      <div className="text-[11px] font-mono text-blue-700">
                        {rep.collegeHeader.recordNo} · Rev: {rep.collegeHeader.revision}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-medium text-slate-900">{rep.department}</div>
                      <div className="text-[10px] text-slate-400">{rep.nameOfCoordinator}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {rep.dateOfEvent}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {rep.beneficiariesCount || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rep.verification.principalSign.signed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Principal Approved</span>
                        </span>
                      ) : rep.verification.headOfDepartmentSign.signed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          HOD Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Coordinator Signed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!rep.verification.principalSign.signed ? (
                        <button
                          onClick={() => handleSignReportAsPrincipal(rep._id)}
                          disabled={actionLoading === `report_${rep._id}`}
                          className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          Sign as Principal
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Signed on {rep.verification.principalSign.date}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SYSTEM & GOVERNANCE */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-700" />
              <span>Institutional Access & System Security</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configuration and security parameters for APCOER CampusConnect platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">Administrator Credentials</div>
              <p className="text-xs text-slate-600">
                Primary administrative account assigned to the Principal and Chief Academic Officer.
              </p>
              <div className="space-y-1 text-xs pt-1 font-mono">
                <div className="text-slate-600">
                  Account Email:{' '}
                  <span className="font-bold text-slate-900">admin@apcoer.edu.in</span>
                </div>
                <div className="text-slate-600">
                  Password Status:{' '}
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Active & Encrypted (Bcrypt)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">Document Persistence & Database</div>
              <p className="text-xs text-slate-600">
                MongoDB-compatible document store maintaining all event records, registrations, QR ticket hashes, and feedback rubrics.
              </p>
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Persistent storage operational</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Provision Verified Account</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Prof. Vivek Patil"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="name@apcoer.edu.in"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="organizer">Faculty / Organizer</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newUserData.department}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                  <option value="First Year Engineering">First Year Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create_user'}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  {actionLoading === 'create_user' ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Erase Previous Events Confirmation Modal */}
      {showEraseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Erase Previous Events Completely
                </h3>
                <p className="text-xs text-slate-500">
                  Administrative Privilege · Dr. Sunil Thakare (Principal)
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                Permanent Database Deletion Notice
              </div>
              <p className="leading-relaxed">
                This action will completely erase all <strong>{previousEvents.length}</strong> previous / completed event(s) from the website, along with all associated student registrations, QR passes, attendance records, and feedback ratings.
              </p>
            </div>

            {/* List of Previous Events Detected */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Events Queued for Erasure ({previousEvents.length}):
              </label>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50 text-xs">
                {previousEvents.map((e) => (
                  <div key={e._id} className="py-2 px-1 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate">{e.title}</div>
                      <div className="text-[10px] text-slate-500">
                        {e.date} · Dept: {e.department}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEraseModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleErasePreviousEvents}
                disabled={actionLoading === 'erase_bulk_previous'}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {actionLoading === 'erase_bulk_previous'
                    ? 'Erasing...'
                    : `Confirm & Erase ${previousEvents.length} Event(s)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
