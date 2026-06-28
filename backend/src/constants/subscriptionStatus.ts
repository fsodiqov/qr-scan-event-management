export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export const SUBSCRIPTION_PLAN_CODE = {
  STARTER: 'starter',
} as const;

export type SubscriptionPlanCode =
  (typeof SUBSCRIPTION_PLAN_CODE)[keyof typeof SUBSCRIPTION_PLAN_CODE];
