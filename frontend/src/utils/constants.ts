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
