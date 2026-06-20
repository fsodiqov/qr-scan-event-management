export const TOKEN_KEY = 'qr_event_token';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  USER_NEW: '/admin/users/new',
  USER_EDIT: (id: string) => `/admin/users/${id}/edit`,
  USER_QR: (id: string) => `/admin/users/${id}/qr`,
  EVENTS: '/admin/events',
  ATTENDANCE: '/admin/attendance',
  SCANNER: '/admin/scanner',
} as const;

export const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
};

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
};

export const SCAN_RESULT_LABELS: Record<string, string> = {
  check_in: 'Check In',
  check_out: 'Check Out',
  already_out: 'Already Out',
  invalid: 'Invalid',
};
