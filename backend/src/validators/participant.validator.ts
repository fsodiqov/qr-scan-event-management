import { z } from 'zod';

export const createParticipantSchema = z.object({
  eventId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid event ID'),
  name: z.string().min(2).max(120),
  email: z.string().email().max(255).optional(),
  phone: z.string().min(5).max(20).optional(),
  photoUrl: z.string().url().max(500).optional().or(z.literal('')),
});

export const updateParticipantSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(5).max(20).optional(),
    photoUrl: z.string().url().max(500).optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listParticipantsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  eventId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid event ID').optional(),
  search: z.string().max(200).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const participantIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid participant ID'),
});

export const eventIdParticipantParamSchema = z.object({
  eventId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid event ID'),
});

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type ListParticipantsQuery = z.infer<typeof listParticipantsSchema>;
