import { z } from 'zod';
import { loginFieldSchema } from './loginField';

export const loginSchema = z.object({
  login: loginFieldSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

/** Public http(s) URL or processed (small) data-URI photo. */
const photoUrlSchema = z
  .string()
  .max(200_000)
  .refine((value) => {
    if (value.startsWith('data:image/')) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Photo must be a valid image URL or image data');

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    login: loginFieldSchema.optional(),
    currentPassword: z.string().min(6).max(128).optional(),
    newPassword: z.string().min(6).max(128).optional(),
    photoUrl: photoUrlSchema.optional().nullable(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      if (data.login !== undefined && !data.currentPassword) return false;
      return true;
    },
    {
      message: 'Current password is required to change login or password',
      path: ['currentPassword'],
    },
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
