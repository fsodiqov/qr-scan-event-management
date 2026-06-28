export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  participants: {
    all: ['participants'] as const,
    list: (params?: unknown) => ['participants', 'list', params] as const,
    detail: (id: string) => ['participants', id] as const,
    qr: (id: string) => ['participants', id, 'qr'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (params?: unknown) => ['staff', 'list', params] as const,
    detail: (id: string) => ['staff', id] as const,
  },
  organizationUsers: {
    all: ['organizationUsers'] as const,
    list: (params?: unknown) => ['organizationUsers', 'list', params] as const,
    detail: (id: string) => ['organizationUsers', id] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    list: (params?: unknown) => ['organizations', 'list', params] as const,
    detail: (id: string) => ['organizations', id] as const,
    members: (id: string, params?: unknown) => ['organizations', id, 'members', params] as const,
    me: ['organizations', 'me'] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    list: (params?: unknown) => ['subscriptions', 'list', params] as const,
    detail: (id: string) => ['subscriptions', id] as const,
    me: ['subscriptions', 'me'] as const,
  },
  events: {
    all: ['events'] as const,
    list: (params?: unknown) => ['events', 'list', params] as const,
    detail: (id: string) => ['events', id] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    list: (params?: unknown) => ['attendance', 'list', params] as const,
  },
  dashboard: {
    stats: (eventId?: string) => ['dashboard', 'stats', eventId] as const,
    recent: (eventId?: string) => ['dashboard', 'recent', eventId] as const,
  },
  platformDashboard: {
    stats: ['platformDashboard', 'stats'] as const,
  },
};
