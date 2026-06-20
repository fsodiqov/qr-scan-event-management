export type Role = 'admin' | 'participant';

export type EventStatus = 'draft' | 'active' | 'closed';

export type AttendanceStatus = 'checked_in' | 'checked_out';

export type ScanResult = 'check_in' | 'check_out' | 'already_out' | 'invalid';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  photoUrl?: string;
  role: Role;
  qrToken?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  status: EventStatus;
  createdBy: string | { _id: string; name: string; email?: string };
  createdAt: string;
  updatedAt: string;
}

export interface EventDetail {
  event: Event;
  stats: {
    totalAttendance: number;
    checkedIn: number;
    checkedOut: number;
    currentlyInside: number;
  };
}

export interface Attendance {
  _id: string;
  userId: string | User;
  eventId: string | Event;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalParticipants: number;
  checkedIn: number;
  checkedOut: number;
  currentlyInside: number;
}

export interface RecentActivity {
  _id: string;
  result: ScanResult;
  scannedAt: string;
  userId?: { name: string; phone?: string };
  eventId?: { title: string };
  scannedBy?: { name: string };
}

export interface QrCodeData {
  qrToken: string;
  qrUrl: string;
  qrDataUrl: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserPayload {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  organization?: string;
  photoUrl?: string;
  role?: Role;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  organization?: string;
  photoUrl?: string;
  isActive?: boolean;
}

export interface CreateUserResponse {
  user: User;
  tempPassword?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  status?: EventStatus;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  location?: string;
  eventDate?: string;
  status?: EventStatus;
}

export interface ScanPayload {
  qrToken: string;
  eventId: string;
}

export interface ScanResponse {
  result: ScanResult;
  attendance: Attendance;
  user: {
    id: string;
    name: string;
    phone?: string;
    organization?: string;
  };
  message: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export interface ListEventsParams {
  page?: number;
  limit?: number;
  status?: EventStatus;
}

export interface ListAttendanceParams {
  page?: number;
  limit?: number;
  eventId?: string;
  userId?: string;
  status?: AttendanceStatus;
}
