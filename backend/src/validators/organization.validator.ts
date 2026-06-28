import { z } from 'zod';
import { ORGANIZATION_STATUS } from '../constants/organizationStatus';
import { loginFieldSchema } from './loginField';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createOrganizationOwnerSchema = z.object({
  name: z.string().min(2).max(120),
  login: loginFieldSchema,
  phone: z.string().max(20).optional(),
  password: z.string().min(6).max(128).optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(slugRegex, 'Invalid slug format').optional(),
  logo: z.string().url().max(500).optional(),
  subscriptionId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid subscription ID').optional(),
  owner: createOrganizationOwnerSchema,
});

export const updateOrganizationSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    slug: z.string().min(2).max(100).regex(slugRegex, 'Invalid slug format').optional(),
    logo: z.string().url().max(500).optional().nullable(),
    subscriptionId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid subscription ID').optional().nullable(),
    status: z.enum([ORGANIZATION_STATUS.ACTIVE, ORGANIZATION_STATUS.SUSPENDED]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateMyOrganizationSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    logo: z.string().url().max(500).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listOrganizationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.enum([ORGANIZATION_STATUS.ACTIVE, ORGANIZATION_STATUS.SUSPENDED]).optional(),
  search: z.string().max(200).optional(),
});

export const organizationIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid organization ID'),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type UpdateMyOrganizationInput = z.infer<typeof updateMyOrganizationSchema>;
export type ListOrganizationsQuery = z.infer<typeof listOrganizationsSchema>;
