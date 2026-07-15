export const TOKEN_KEY = 'qr_event_token';
export const THEME_PREFERENCE_KEY = 'qr_event_theme';

export const ROUTES = {
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',

  PLATFORM_DASHBOARD: '/platform/dashboard',
  ORGANIZATIONS: '/platform/organizations',
  ORGANIZATION_DETAIL: (id: string) => `/platform/organizations/${id}`,
  SUBSCRIPTIONS: '/platform/subscriptions',
  PLATFORM_SETTINGS: '/platform/settings',

  DASHBOARD: '/admin/dashboard',
  EVENTS: '/admin/events',
  PARTICIPANTS: '/admin/participants',
  PARTICIPANT_NEW: '/admin/participants/new',
  PARTICIPANT_EDIT: (id: string) => `/admin/participants/${id}/edit`,
  PARTICIPANT_QR: (id: string) => `/admin/participants/${id}/qr`,
  ATTENDANCE: '/admin/attendance',
  SCANNER: '/admin/scanner',
  STAFF: '/admin/staff',
  STAFF_NEW: '/admin/staff/new',
  STAFF_EDIT: (id: string) => `/admin/staff/${id}/edit`,
  ORG_USERS: '/admin/organization-users',
  ORG_USER_NEW: '/admin/organization-users/new',
  ORG_USER_EDIT: (id: string) => `/admin/organization-users/${id}/edit`,
  REPORTS: '/admin/reports',
  ORG_SETTINGS: '/admin/organization-settings',
  ACCOUNT_SETTINGS: '/account/settings',

  // Legacy redirects
  USERS: '/admin/users',
  USER_NEW: '/admin/users/new',
  USER_EDIT: (id: string) => `/admin/users/${id}/edit`,
  USER_QR: (id: string) => `/admin/users/${id}/qr`,
  LEGACY_ORG_SETTINGS: '/admin/settings',
} as const;
