export type Role = 'super_admin' | 'owner' | 'admin' | 'operator';

export type OrgRole = 'owner' | 'admin' | 'operator';

export type StaffRole = 'admin' | 'operator';

export type EventStatus = 'draft' | 'active' | 'closed';

export type AttendanceStatus = 'checked_in' | 'checked_out';

export type ScanResult = 'check_in' | 'check_out' | 'already_out' | 'invalid';

export type OrganizationStatus = 'active' | 'suspended';

export type SubscriptionStatus = 'active' | 'inactive';

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
  code?: string;
  details?: unknown;
}

export interface AuthUser {
  id: string;
  name: string;
  login?: string;
  phone?: string;
  photoUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status?: OrganizationStatus;
  subscriptionId?: string | Subscription;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthProfile {
  user: AuthUser;
  organization?: Organization;
  role?: Role;
}

export interface Participant {
  _id: string;
  organizationId: string;
  eventId: string | Event;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  qrToken?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffUser {
  id: string;
  name: string;
  login?: string;
  phone?: string;
  photoUrl?: string;
  role: OrgRole;
  isActive: boolean;
  createdAt: string;
}

export interface OrganizationUser {
  id: string;
  userId: string;
  name: string;
  login?: string;
  phone?: string;
  photoUrl?: string;
  role: OrgRole;
  status: string;
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  name: string;
  planCode: string;
  status: SubscriptionStatus;
  limits?: Record<string, unknown>;
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
  organizationId?: string;
  createdBy: string | { _id: string; name: string; login?: string };
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
  participantId: string | Participant;
  eventId: string | Event;
  organizationId?: string;
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
  activeEvents: number;
  scansToday: number;
  invalidScansToday: number;
  checkInRate: number;
}

export interface ReportTrendPoint {
  date: string;
  scans: number;
  checkIns: number;
  checkOuts: number;
  invalid: number;
}

export interface ReportResultBreakdown {
  check_in: number;
  check_out: number;
  already_out: number;
  invalid: number;
}

export interface DashboardReport {
  from: string;
  to: string;
  stats: DashboardStats;
  trend: ReportTrendPoint[];
  byResult: ReportResultBreakdown;
}

export type ReportPeriod = 'day' | 'week' | 'month' | 'custom';

export interface DashboardReportParams {
  eventId?: string;
  from?: string;
  to?: string;
  period?: ReportPeriod;
}

export interface PlatformDashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalEvents: number;
  totalParticipants: number;
  totalAttendanceRecords: number;
}

export interface RecentActivity {
  _id: string;
  result: ScanResult;
  scannedAt: string;
  participantId?: { name: string; phone?: string };
  eventId?: { title: string };
  scannedBy?: { name: string };
}

export interface QrCodeData {
  qrToken: string;
  qrUrl: string;
  qrDataUrl: string;
}

export interface LoginPayload {
  login: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  organization?: Organization;
  role: Role;
}

export interface UpdateProfilePayload {
  name?: string;
  login?: string;
  currentPassword?: string;
  newPassword?: string;
  photoUrl?: string | null;
}

export interface CreateStaffPayload {
  name: string;
  login: string;
  phone?: string;
  password?: string;
  photoUrl?: string;
  role?: StaffRole;
}

export interface UpdateStaffPayload {
  name?: string;
  login?: string;
  phone?: string;
  password?: string;
  photoUrl?: string;
  isActive?: boolean;
  role?: StaffRole;
}

export interface CreateStaffResponse {
  user: StaffUser;
  tempPassword?: string;
}

export interface CreateParticipantPayload {
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export interface UpdateParticipantPayload {
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isActive?: boolean;
}

export interface CreateOrganizationUserPayload {
  name: string;
  login: string;
  phone?: string;
  password?: string;
  photoUrl?: string;
  role: StaffRole;
}

export interface UpdateOrganizationUserPayload {
  name?: string;
  login?: string;
  phone?: string;
  password?: string;
  photoUrl?: string;
  role?: StaffRole;
  status?: 'active' | 'disabled';
  isActive?: boolean;
}

export interface CreateOrganizationUserResponse {
  member: OrganizationUser;
  tempPassword?: string;
}

export interface CreateOrganizationOwnerPayload {
  name: string;
  login: string;
  phone?: string;
  password?: string;
}

export interface CreateOrganizationPayload {
  name: string;
  slug?: string;
  logo?: string;
  subscriptionId?: string;
  owner: CreateOrganizationOwnerPayload;
}

export interface CreateOrganizationOwnerInfo {
  id: string;
  name: string;
  login: string;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  owner: CreateOrganizationOwnerInfo;
  tempPassword?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  slug?: string;
  logo?: string | null;
  subscriptionId?: string | null;
  status?: OrganizationStatus;
}

export interface UpdateMyOrganizationPayload {
  name?: string;
  logo?: string | null;
}

export interface CreateSubscriptionPayload {
  name: string;
  planCode: 'starter';
  status?: SubscriptionStatus;
  limits?: Record<string, unknown>;
}

export interface UpdateSubscriptionPayload {
  name?: string;
  status?: SubscriptionStatus;
  limits?: Record<string, unknown>;
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

export interface ScanParticipantInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface ScanResponse {
  result: ScanResult;
  attendance: Attendance;
  participant: ScanParticipantInfo;
  message: string;
}

export interface ListStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: OrgRole;
  isActive?: boolean;
}

export interface ListParticipantsParams {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  isActive?: boolean;
}

export interface ListOrganizationUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: OrgRole;
  status?: string;
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
  participantId?: string;
  status?: AttendanceStatus;
  from?: string;
  to?: string;
}

export interface ListOrganizationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrganizationStatus;
}

export interface ListSubscriptionsParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
}
