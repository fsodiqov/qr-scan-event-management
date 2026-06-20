export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: unknown) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', id] as const,
    qr: (id: string) => ['users', id, 'qr'] as const,
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
};
