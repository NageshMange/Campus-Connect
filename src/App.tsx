import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { WorkflowMapModal } from './components/WorkflowMapModal';
import { AuthModal } from './components/AuthModal';
import { CreateEventModal } from './components/CreateEventModal';
import { EventCard } from './components/EventCard';
import { TicketModal } from './components/TicketModal';
import { QRScannerModal } from './components/QRScannerModal';
import { FeedbackFormModal } from './components/FeedbackFormModal';
import { InstitutionalReportView } from './components/InstitutionalReportView';
import { FeedbackReportView } from './components/FeedbackReportView';
import { AdminVerificationPanel } from './components/AdminVerificationPanel';
import { StudentHistoryView } from './components/StudentHistoryView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { OrganizerDeskView } from './components/OrganizerDeskView';
import { api } from './services/api';
import {
  CollegeEvent,
  Registration,
  InstitutionalReport,
  FeedbackAnalysis,
} from './types';
import {
  Calendar,
  Search,
  Filter,
  Sparkles,
  GitBranch,
  ShieldCheck,
  FileText,
  Building,
  GraduationCap,
  Users,
} from 'lucide-react';

function CampusConnectApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('events');
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [organizerFilter, setOrganizerFilter] = useState('ALL');

  // Modals & Active Views
  const [isFlowchartOpen, setIsFlowchartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'admin' | 'register'>('signin');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [selectedScannerEvent, setSelectedScannerEvent] = useState<CollegeEvent | null>(null);
  const [selectedFeedbackEvent, setSelectedFeedbackEvent] = useState<CollegeEvent | null>(null);

  // Report View State
  const [activeReport, setActiveReport] = useState<InstitutionalReport | null>(null);
  const [activeFeedbackReport, setActiveFeedbackReport] = useState<{
    event: CollegeEvent;
    feedback: FeedbackAnalysis;
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const eventList = await api.getEvents();
      setEvents(eventList);

      if (user && user.role === 'student') {
        const regs = await api.getMyRegistrations();
        setMyRegistrations(regs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (user && user.role === 'admin' && authModalMode === 'admin') {
      setCurrentTab('admin');
    }
  }, [user]);

  const handleRegisterEvent = async (event: CollegeEvent) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const reg = await api.registerForEvent(event._id);
      setMyRegistrations((prev) => [...prev, reg]);
      setSelectedTicket(reg);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  const handleOpenReport = async (eventOrId: CollegeEvent | string) => {
    try {
      const eventId = typeof eventOrId === 'string' ? eventOrId : eventOrId._id;
      const report = await api.getEventReport(eventId);
      setActiveReport(report);
      setActiveFeedbackReport(null);
      setCurrentTab('reports');
    } catch (err: any) {
      console.error('Failed to load report:', err);
    }
  };

  const handleOpenFeedbackReport = async (event: CollegeEvent) => {
    try {
      const res = await api.getEventFeedback(event._id);
      setActiveFeedbackReport({ event, feedback: res.analysis });
      setActiveReport(null);
      setCurrentTab('reports');
    } catch (err: any) {
      console.error('Failed to load feedback analysis:', err);
    }
  };

  const handleNavigateWorkflowStep = (stepId: number, targetTab: string) => {
    if (stepId === 1) {
      setIsAuthOpen(true);
    } else if (stepId === 3) {
      setCurrentTab('organizer');
      setIsCreateEventOpen(true);
    } else if (stepId === 7) {
      setCurrentTab('events');
      if (events.length > 0) {
        setSelectedScannerEvent(events[0]);
      }
    } else if (stepId === 10 || stepId === 11 || stepId === 12) {
      setCurrentTab('reports');
      if (events.length > 0) {
        handleOpenReport(events[0]);
      }
    } else {
      setCurrentTab(targetTab);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.facultyCoordinator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || evt.category === categoryFilter;
    const matchesOrganizer =
      organizerFilter === 'ALL' || evt.organizerType === organizerFilter;

    // Student view only shows approved or completed events
    if (user?.role === 'student' && evt.status === 'pending_approval') {
      return false;
    }

    return matchesSearch && matchesCategory && matchesOrganizer;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Bar adhering to 3-zone contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'reports') {
            setActiveReport(null);
            setActiveFeedbackReport(null);
          }
        }}
        onOpenFlowchart={() => setIsFlowchartOpen(true)}
        onOpenLoginModal={(mode = 'signin') => {
          setAuthModalMode(mode);
          setIsAuthOpen(true);
        }}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Institutional Hero Banner (Shown on main Events tab) */}
        {currentTab === 'events' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="max-w-3xl space-y-3 relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <img
                  src="/assets/aistudio/ap1_3c1c1923.jpg"
                  alt="APCOER Logo"
                  className="w-12 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-xs"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  <Building className="w-3.5 h-3.5" />
                  <span>APCOER Pune · Smart College Event Management System</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Automated College Event Management & Institutional Accreditation Hub
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                Seamless digital pipeline from organizer registration to QR-based attendance, student feedback analytics (Record ACA/R/008A), and automated institutional event reporting (Record ACA/D/021).
              </p>

              {/* Action shortcuts */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsFlowchartOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  View 14-Step Flowchart Guide
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Open Admin Panel
                  </button>
                )}

                {(user?.role === 'organizer' || user?.role === 'admin') && (
                  <button
                    onClick={() => setIsCreateEventOpen(true)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    + Create New Event (Step 3)
                  </button>
                )}

                {user?.role === 'student' && (
                  <button
                    onClick={() => setCurrentTab('tickets')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    View My Passes ({myRegistrations.length})
                  </button>
                )}

                {!user && (
                  <button
                    onClick={() => {
                      setAuthModalMode('admin');
                      setIsAuthOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Admin Portal
                  </button>
                )}
              </div>
            </div>

            {/* Subtle background APCOER logo watermark */}
            <div className="absolute right-4 bottom-2 opacity-20 pointer-events-none hidden md:block">
              <img
                src="/assets/aistudio/ap1_3c1c1923.jpg"
                alt="APCOER Crest Watermark"
                className="w-44 h-52 object-contain"
              />
            </div>
          </div>
        )}

        {/* TAB 1: EVENTS CATALOG */}
        {currentTab === 'events' && (
          <div className="space-y-6">
            {/* Search & Category Filter Strip */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title, department, coordinator..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Segmented Controls for Category */}
              <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0">
                {['ALL', 'Co-Curricular', 'Technical', 'Workshop', 'Placement'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading college events...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-12 bg-white border border-slate-200 rounded-xl text-center space-y-3">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-800">
                  {events.length === 0 ? 'No Published Events At This Time' : 'No events matched your search'}
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {events.length === 0
                    ? 'Faculty coordinators and student clubs can submit proposed events for administrative review. Approved events will appear here for student registrations.'
                    : 'Try clearing the category filter or searching for another keyword.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => {
                  const userReg = myRegistrations.find((r) => r.eventId === evt._id);
                  return (
                    <EventCard
                      key={evt._id}
                      event={evt}
                      userRegistration={userReg}
                      onRegister={handleRegisterEvent}
                      onViewTicket={(reg) => setSelectedTicket(reg)}
                      onScanQR={(e) => setSelectedScannerEvent(e)}
                      onViewReport={handleOpenReport}
                      onSubmitFeedback={(e) => setSelectedFeedbackEvent(e)}
                      onApproveEvent={(e) => {
                        api.updateEventStatus(e._id, 'approved', 'Approved by Principal').then(() => loadData());
                      }}
                      onEraseEvent={async (e) => {
                        const confirmed = window.confirm(
                          `PERMANENT EVENT ERASURE (Principal / Admin Privilege):\n\nAre you sure you want to completely erase "${e.title}" from the website?\n\nThis will permanently delete the event, attendee passes, attendance records, and feedback ratings from the database.`
                        );
                        if (!confirmed) return;
                        try {
                          await api.eraseEventCompletely(e._id);
                          loadData();
                        } catch (err: any) {
                          alert(err.message || 'Failed to erase event');
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENT PASSES & HISTORY */}
        {currentTab === 'tickets' && (
          <StudentHistoryView
            onViewTicket={(reg) => setSelectedTicket(reg)}
            onSubmitFeedback={(evt) => setSelectedFeedbackEvent(evt)}
            onViewReport={handleOpenReport}
          />
        )}

        {/* TAB 3: ORGANIZER DESK */}
        {currentTab === 'organizer' && (
          <OrganizerDeskView
            onOpenCreateEvent={() => setIsCreateEventOpen(true)}
            onOpenQRScanner={(evt) => setSelectedScannerEvent(evt)}
            onOpenReport={handleOpenReport}
            onOpenFeedback={handleOpenFeedbackReport}
          />
        )}

        {/* TAB 4: INSTITUTIONAL REPORTS (ACA/D/021 & ACA/R/008A) */}
        {currentTab === 'reports' && (
          <div className="space-y-6">
            {/* View Selector if no active report selected */}
            {!activeReport && !activeFeedbackReport ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Official College Reports & Feedback Records
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select an institutional document to view, sign, and export in accreditation-compliant format.
                  </p>
                </div>

                {events.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-slate-300 rounded-xl space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="text-sm font-semibold text-slate-700">No institutional reports yet</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Official Record ACA/D/021 and Feedback Reports ACA/R/008A will automatically populate as events are conducted.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((evt) => (
                      <div
                        key={evt._id}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {evt.category}
                          </span>
                          <span className="text-xs text-slate-500">{evt.date}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {evt.briefDescription || evt.description}
                        </p>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                          <button
                            onClick={() => handleOpenReport(evt)}
                            className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Event Report (ACA/D/021)
                          </button>
                          <button
                            onClick={() => handleOpenFeedbackReport(evt)}
                            className="py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Feedback (ACA/R/008A)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeReport ? (
              <InstitutionalReportView
                report={activeReport}
                onReportUpdated={(updated) => setActiveReport(updated)}
                onBack={() => setActiveReport(null)}
              />
            ) : activeFeedbackReport ? (
              <FeedbackReportView
                event={activeFeedbackReport.event}
                feedbackData={activeFeedbackReport.feedback}
                onBack={() => setActiveFeedbackReport(null)}
              />
            ) : null}
          </div>
        )}

        {/* TAB 5: ANALYTICS & STATS */}
        {currentTab === 'analytics' && (
          <AnalyticsDashboardView onOpenReport={(id) => handleOpenReport(id)} />
        )}

        {/* TAB 6: ADMIN CONSOLE */}
        {currentTab === 'admin' && (
          <AdminVerificationPanel
            onEventUpdated={loadData}
            onOpenReport={handleOpenReport}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">CampusConnect</span>
            <span aria-hidden="true">·</span>
            <span>APCOER Pune Institutional Event Operations</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Record ACA/D/021 & ACA/R/008A</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFlowchartOpen(true)}
              className="hover:text-blue-600 transition-colors"
            >
              14-Step Flowchart Guide
            </button>
            <span aria-hidden="true">·</span>
            <span>NBA / NAAC Compliance</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <WorkflowMapModal
        isOpen={isFlowchartOpen}
        onClose={() => setIsFlowchartOpen(false)}
        onNavigateStep={handleNavigateWorkflowStep}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthOpen(false)}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={() => {
          loadData();
          setCurrentTab('events');
        }}
      />

      <TicketModal
        registration={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

      <QRScannerModal
        event={selectedScannerEvent}
        isOpen={!!selectedScannerEvent}
        onClose={() => setSelectedScannerEvent(null)}
        onAttendanceMarked={loadData}
      />

      <FeedbackFormModal
        event={selectedFeedbackEvent}
        isOpen={!!selectedFeedbackEvent}
        onClose={() => setSelectedFeedbackEvent(null)}
        onSubmitted={() => {
          loadData();
          if (selectedFeedbackEvent) {
            handleOpenFeedbackReport(selectedFeedbackEvent);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusConnectApp />
    </AuthProvider>
  );
}
