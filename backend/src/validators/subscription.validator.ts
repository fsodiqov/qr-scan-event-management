import { z } from 'zod';
import {
  SUBSCRIPTION_PLAN_CODE,
  SUBSCRIPTION_STATUS,
} from '../constants/subscriptionStatus';

export const createSubscriptionSchema = z.object({
  name: z.string().min(2).max(120),
  planCode: z.enum([SUBSCRIPTION_PLAN_CODE.STARTER]),
  status: z.enum([SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.INACTIVE]).optional(),
  limits: z.record(z.unknown()).optional(),
});

export const updateSubscriptionSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    status: z.enum([SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.INACTIVE]).optional(),
    limits: z.record(z.unknown()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listSubscriptionsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.enum([SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.INACTIVE]).optional(),
});

export const subscriptionIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid subscription ID'),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsSchema>;
