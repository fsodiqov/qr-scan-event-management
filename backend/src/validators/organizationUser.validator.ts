import { z } from 'zod';
import { ORG_ROLES } from '../constants/roles';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { loginFieldSchema } from './loginField';

export const createOrganizationUserSchema = z.object({
  name: z.string().min(2).max(120),
  login: loginFieldSchema,
  phone: z.string().max(20).optional(),
  password: z.string().min(6).max(128).optional(),
  role: z.enum([ORG_ROLES.ADMIN, ORG_ROLES.OPERATOR]),
  photoUrl: z.string().url().max(500).optional(),
});

export const updateOrganizationUserSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    login: loginFieldSchema.optional(),
    phone: z.string().max(20).optional(),
    password: z.string().min(6).max(128).optional(),
    role: z.enum([ORG_ROLES.ADMIN, ORG_ROLES.OPERATOR]).optional(),
    status: z.enum([ORG_USER_STATUS.ACTIVE, ORG_USER_STATUS.DISABLED]).optional(),
    photoUrl: z.string().url().max(500).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listOrganizationUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  role: z.enum([ORG_ROLES.OWNER, ORG_ROLES.ADMIN, ORG_ROLES.OPERATOR]).optional(),
  status: z.enum([ORG_USER_STATUS.ACTIVE, ORG_USER_STATUS.INVITED, ORG_USER_STATUS.DISABLED]).optional(),
  search: z.string().max(200).optional(),
});

export const organizationUserIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid organization user ID'),
});

export type CreateOrganizationUserInput = z.infer<typeof createOrganizationUserSchema>;
export type UpdateOrganizationUserInput = z.infer<typeof updateOrganizationUserSchema>;
export type ListOrganizationUsersQuery = z.infer<typeof listOrganizationUsersSchema>;
