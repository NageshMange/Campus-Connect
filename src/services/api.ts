import {
  User,
  CollegeEvent,
  Registration,
  FeedbackSubmission,
  FeedbackAnalysis,
  InstitutionalReport,
  SystemNotification,
  DashboardStats,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('campusconnect_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password?: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () => request<{ user: User }>('/auth/me'),

  // Users (Admin)
  getUsers: () => request<User[]>('/users'),
  verifyUser: (userId: string, verified: boolean) =>
    request<User>(`/users/${userId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verified }),
    }),
  approveUser: (userId: string) =>
    request<{ message: string; user: User }>(`/users/${userId}/approve`, {
      method: 'PUT',
    }),
  rejectUser: (userId: string, reason?: string) =>
    request<{ message: string; user: User }>(`/users/${userId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
  deleteUser: (userId: string) =>
    request<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    }),

  // Events
  getEvents: () => request<CollegeEvent[]>('/events'),
  getEvent: (id: string) => request<CollegeEvent>(`/events/${id}`),
  createEvent: (payload: Partial<CollegeEvent>) =>
    request<CollegeEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateEventStatus: (id: string, status: string, adminRemarks?: string) =>
    request<CollegeEvent>(`/events/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminRemarks }),
    }),
  completeEvent: (id: string) =>
    request<CollegeEvent>(`/events/${id}/complete`, {
      method: 'PUT',
    }),
  deleteEvent: (id: string) =>
    request<{ message: string; erasedEventId?: string }>(`/events/${id}`, {
      method: 'DELETE',
    }),
  eraseEventCompletely: (id: string) =>
    request<{
      message: string;
      erasedEventId: string;
      title: string;
      cascaded: { registrations: number; feedbacks: number; reports: number };
    }>(`/events/${id}`, {
      method: 'DELETE',
    }),
  erasePreviousEvents: (options?: {
    includeCompleted?: boolean;
    beforeDate?: string;
    specificEventIds?: string[];
  }) =>
    request<{
      message: string;
      erasedCount: number;
      erasedEvents: Array<{ _id: string; title: string; date: string; status: string }>;
      cascaded: { registrations: number; feedbacks: number; reports: number };
    }>('/events/erase-previous', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  // Registrations & Tickets
  registerForEvent: (eventId: string) =>
    request<Registration>(`/events/${eventId}/register`, {
      method: 'POST',
    }),
  getMyRegistrations: () => request<Registration[]>('/registrations/my'),
  getEventRegistrations: (eventId: string) =>
    request<Registration[]>(`/events/${eventId}/registrations`),
  getTicketQR: (ticketCode: string) =>
    request<{ ticketCode: string; qrDataUrl: string }>(`/qr/ticket/${ticketCode}`),

  // Attendance & Check-in (Universal & Simplified)
  scanAttendance: (identifierOrTicket: string, eventId?: string) =>
    request<{ message: string; registration: Registration; alreadyAttended: boolean; spotEntry?: boolean }>(
      '/attendance/scan',
      {
        method: 'POST',
        body: JSON.stringify({ identifier: identifierOrTicket, ticketCode: identifierOrTicket, eventId }),
      }
    ),
  toggleAttendance: (registrationId: string, attended: boolean) =>
    request<{ message: string; registration: Registration }>(
      `/registrations/${registrationId}/attendance`,
      {
        method: 'PUT',
        body: JSON.stringify({ attended }),
      }
    ),
  spotRegisterAttendance: (
    eventId: string,
    payload: { name: string; prn?: string; department?: string; email?: string }
  ) =>
    request<{ message: string; registration: Registration }>(
      `/events/${eventId}/attendance/spot-entry`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  markAllAttendance: (eventId: string) =>
    request<{ message: string; count: number }>(`/events/${eventId}/attendance/mark-all`, {
      method: 'POST',
    }),

  // Feedback
  submitFeedback: (eventId: string, ratings: any, comments: string) =>
    request<FeedbackSubmission>(`/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ ratings, comments }),
    }),
  getEventFeedback: (eventId: string) =>
    request<{ analysis: FeedbackAnalysis; feedbacks: FeedbackSubmission[] }>(
      `/events/${eventId}/feedback`
    ),

  // Institutional Reports (ACA/D/021)
  getEventReport: (eventId: string) => request<InstitutionalReport>(`/events/${eventId}/report`),
  updateReport: (reportId: string, payload: Partial<InstitutionalReport>) =>
    request<InstitutionalReport>(`/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  verifyReport: (reportId: string, signType: string, signerName?: string, remarks?: string) =>
    request<InstitutionalReport>(`/reports/${reportId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ signType, signerName, remarks }),
    }),
  getAllReports: () => request<InstitutionalReport[]>('/reports'),

  // Analytics
  getDashboardAnalytics: () => request<DashboardStats>('/analytics/dashboard'),
  getStudentAnalytics: (userId: string) =>
    request<{
      totalRegistered: number;
      totalAttended: number;
      attendancePercentage: number;
      registrations: Registration[];
      poAchievements: Record<string, number>;
    }>(`/analytics/student/${userId}`),

  // Notifications
  getNotifications: () => request<SystemNotification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<SystemNotification>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
};
