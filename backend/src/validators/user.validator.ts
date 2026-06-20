import { z } from 'zod';
import { ROLES } from '../constants/roles';

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional(),
  phone: z.string().min(5).max(20).optional(),
  password: z.string().min(6).optional(),
  organization: z.string().max(200).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  role: z.enum([ROLES.ADMIN, ROLES.PARTICIPANT]).default(ROLES.PARTICIPANT),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).max(20).optional(),
    password: z.string().min(6).optional(),
    organization: z.string().max(200).optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.PARTICIPANT]).optional(),
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
