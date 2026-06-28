export const PLATFORM_ROLES = {
  SUPER_ADMIN: 'super_admin',
} as const;

export const ORG_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  OPERATOR: 'operator',
} as const;

export const ROLES = {
  ...PLATFORM_ROLES,
  ...ORG_ROLES,
} as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[keyof typeof PLATFORM_ROLES];
export type OrgRole = (typeof ORG_ROLES)[keyof typeof ORG_ROLES];
export type Role = PlatformRole | OrgRole;

export function isPlatformRole(role: Role): role is PlatformRole {
  return role === PLATFORM_ROLES.SUPER_ADMIN;
}

export function isOrgRole(role: Role): role is OrgRole {
  return Object.values(ORG_ROLES).includes(role as OrgRole);
}
