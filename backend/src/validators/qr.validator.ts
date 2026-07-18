import { z } from 'zod';

export const qrTokenParamSchema = z.object({
  token: z
    .string()
    .min(16, 'Invalid QR token')
    .max(128, 'Invalid QR token')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid QR token'),
});
