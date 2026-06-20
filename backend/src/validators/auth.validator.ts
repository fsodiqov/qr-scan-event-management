import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().min(5).max(20).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

export type LoginInput = z.infer<typeof loginSchema>;
