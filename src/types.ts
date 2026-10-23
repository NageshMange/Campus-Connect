export type UserRole = 'student' | 'organizer' | 'admin';

export type OrganizerType =
  | 'Student Club / Society'
  | 'Department'
  | 'Faculty / Committee'
  | 'Placement Cell';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organizerType?: OrganizerType;
  department: string;
  prn?: string; // Roll number / Permanent Registration Number for students
  designation?: string; // For faculty / admin
  verified: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  avatar?: string;
  createdAt: string;
}

export type EventStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface EventPOItem {
  po: string; // e.g. "PO1 (Knowledge)"
  peo: string; // e.g. "PEO1"
  pso: string; // e.g. "PSO1, PSO2"
}

export interface CollegeEvent {
  _id: string;
  title: string;
  category: 'Technical' | 'Workshop' | 'Co-Curricular' | 'Placement' | 'Cultural' | 'Seminar';
  organizerId: string;
  organizerName: string;
  organizerType: OrganizerType;
  facultyCoordinator: string;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  bannerUrl: string;
  description: string;
  objectives: string[];
  briefDescription: string;
  outcomes: string[];
  mappedPO: EventPOItem[];
  status: EventStatus;
  adminRemarks?: string;
  feedbackEnabled: boolean;
  qrCodeSecret: string;
  createdAt: string;
}

export interface Registration {
  _id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  prn?: string;
  ticketCode: string;
  registeredAt: string;
  attended: boolean;
  attendedAt?: string;
  feedbackSubmitted: boolean;
}

export interface FeedbackSubmission {
  _id: string;
  eventId: string;
  userId: string;
  userName: string;
  prn?: string;
  ratings: {
    overallImpression: number; // 1 - 5
    wellOrganized: number; // 1 - 5
    speakerClarity: number; // 1 - 5
    preparedness: number; // 1 - 5
    understandingImprovement: number; // 1 - 5
  };
  comments: string;
  submittedAt: string;
}

export interface FeedbackRatingSummary {
  question: string;
  key: keyof FeedbackSubmission['ratings'];
  avgRating: number;
  counts: Record<number, number>; // rating 1..5 -> count
  percentages: Record<number, number>; // rating 1..5 -> percentage
}

export interface FeedbackAnalysis {
  totalResponses: number;
  overallAverage: number;
  questions: FeedbackRatingSummary[];
}

export interface GeoTaggedPhoto {
  url: string;
  caption: string;
  location: string;
  latLong: string;
  timestamp: string;
}

export interface InstitutionalReport {
  _id: string;
  eventId: string;
  collegeHeader: {
    trustName: string;
    collegeName: string;
    recordNo: string; // "ACA/D/021"
    revision: string; // "00"
    doi: string; // "01/02/2025"
  };
  nameOfEvent: string;
  dateOfEvent: string;
  timeOfEvent: string;
  nameOfCoordinator: string;
  department: string;
  organizerType: OrganizerType;
  objectives: string[];
  briefAboutEvent: string;
  beneficiariesCount: number;
  outcomes: string[];
  mappedCOPO: EventPOItem[];
  photographs: GeoTaggedPhoto[];
  feedbackSummary?: FeedbackAnalysis;
  verification: {
    status: 'draft' | 'submitted_for_verification' | 'verified_by_faculty' | 'approved_by_admin';
    eventCoordinatorSign: { signed: boolean; name: string; date?: string };
    headOfDepartmentSign: { signed: boolean; name: string; date?: string };
    iqacCoordinatorSign: { signed: boolean; name: string; date?: string };
    principalSign: { signed: boolean; name: string; date?: string };
    remarks?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SystemNotification {
  _id: string;
  userId: string | 'ALL';
  title: string;
  message: string;
  type: 'event_announced' | 'registration_reminder' | 'approval' | 'attendance_confirmed' | 'report_ready';
  eventId?: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  pendingApprovalEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  attendanceRate: number;
  totalFeedbackCount: number;
  overallSatisfactionRate: number;
  organizerTypeBreakdown: Record<string, number>;
  departmentBreakdown: Record<string, number>;
}
