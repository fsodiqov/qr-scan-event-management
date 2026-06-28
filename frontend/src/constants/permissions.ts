import type { OrgRole, Role } from '@/types';

export const PERMISSIONS = {
  PLATFORM_MANAGE_ORGANIZATIONS: 'platform:manage_organizations',
  PLATFORM_MANAGE_SUBSCRIPTIONS: 'platform:manage_subscriptions',
  PLATFORM_DASHBOARD: 'platform:dashboard',

  ORG_SETTINGS: 'org:settings',
  ORG_USERS_MANAGE: 'org:users_manage',
  ORG_EVENTS_MANAGE: 'org:events_manage',
  ORG_PARTICIPANTS_MANAGE: 'org:participants_manage',
  ORG_ATTENDANCE_MANAGE: 'org:attendance_manage',
  ORG_ATTENDANCE_SCAN: 'org:attendance_scan',
  ORG_DASHBOARD: 'org:dashboard',
  ORG_EVENTS_READ: 'org:events_read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ORG_ROLE_PERMISSIONS: Record<OrgRole, Permission[]> = {
  owner: [
    PERMISSIONS.ORG_SETTINGS,
    PERMISSIONS.ORG_USERS_MANAGE,
    PERMISSIONS.ORG_EVENTS_MANAGE,
    PERMISSIONS.ORG_PARTICIPANTS_MANAGE,
    PERMISSIONS.ORG_ATTENDANCE_MANAGE,
    PERMISSIONS.ORG_ATTENDANCE_SCAN,
    PERMISSIONS.ORG_DASHBOARD,
    PERMISSIONS.ORG_EVENTS_READ,
  ],
  admin: [
    PERMISSIONS.ORG_EVENTS_MANAGE,
    PERMISSIONS.ORG_PARTICIPANTS_MANAGE,
    PERMISSIONS.ORG_ATTENDANCE_MANAGE,
    PERMISSIONS.ORG_ATTENDANCE_SCAN,
    PERMISSIONS.ORG_DASHBOARD,
    PERMISSIONS.ORG_EVENTS_READ,
  ],
  operator: [
    PERMISSIONS.ORG_ATTENDANCE_SCAN,
    PERMISSIONS.ORG_EVENTS_READ,
    PERMISSIONS.ORG_PARTICIPANTS_MANAGE,
  ],
};

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  PERMISSIONS.PLATFORM_MANAGE_ORGANIZATIONS,
  PERMISSIONS.PLATFORM_MANAGE_SUBSCRIPTIONS,
  PERMISSIONS.PLATFORM_DASHBOARD,
];

export function getPermissionsForRole(role: Role | null | undefined): Permission[] {
  if (!role) return [];
  if (role === 'super_admin') return SUPER_ADMIN_PERMISSIONS;
  return ORG_ROLE_PERMISSIONS[role as OrgRole] ?? [];
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(
  role: Role | null | undefined,
  permissions: Permission[],
): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return permissions.some((p) => rolePermissions.includes(p));
}
