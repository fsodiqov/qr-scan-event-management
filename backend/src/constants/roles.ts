export const ROLES = {
  ADMIN: 'admin',
  PARTICIPANT: 'participant',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
