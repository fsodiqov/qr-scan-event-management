import { z } from 'zod';

export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 12 characters and include uppercase, lowercase, number, and special character';

export const passwordPolicySchema = z
  .string()
  .min(12, PASSWORD_POLICY_MESSAGE)
  .max(128)
  .regex(/[A-Z]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[a-z]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[0-9]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[^A-Za-z0-9]/, PASSWORD_POLICY_MESSAGE);

/** Optional password that, when present, must meet the policy. */
export const optionalPasswordPolicySchema = passwordPolicySchema.optional();
