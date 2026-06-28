export const ORG_USER_STATUS = {
  ACTIVE: 'active',
  INVITED: 'invited',
  DISABLED: 'disabled',
} as const;

export type OrgUserStatus =
  (typeof ORG_USER_STATUS)[keyof typeof ORG_USER_STATUS];
