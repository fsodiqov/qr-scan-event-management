import { z } from 'zod';
import { ORG_ROLES } from '../constants/roles';
import { loginFieldSchema } from './loginField';

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  login: loginFieldSchema,
  phone: z.string().min(5).max(20).optional(),
  password: z.string().min(6).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  role: z.enum([ORG_ROLES.ADMIN, ORG_ROLES.OPERATOR]).default(ORG_ROLES.ADMIN),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    login: loginFieldSchema.optional(),
    phone: z.string().min(5).max(20).optional(),
    password: z.string().min(6).optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
    role: z.enum([ORG_ROLES.ADMIN, ORG_ROLES.OPERATOR]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  role: z.enum([ORG_ROLES.OWNER, ORG_ROLES.ADMIN, ORG_ROLES.OPERATOR]).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
