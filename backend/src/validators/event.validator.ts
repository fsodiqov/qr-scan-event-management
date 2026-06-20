import { z } from 'zod';
import { EVENT_STATUS } from '../constants/eventStatus';

export const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().min(2).max(300),
  eventDate: z.coerce.date(),
  status: z
    .enum([EVENT_STATUS.DRAFT, EVENT_STATUS.ACTIVE, EVENT_STATUS.CLOSED])
    .optional(),
});

export const updateEventSchema = z
  .object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(2000).optional(),
    location: z.string().min(2).max(300).optional(),
    eventDate: z.coerce.date().optional(),
    status: z
      .enum([EVENT_STATUS.DRAFT, EVENT_STATUS.ACTIVE, EVENT_STATUS.CLOSED])
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateEventStatusSchema = z.object({
  status: z.enum([
    EVENT_STATUS.DRAFT,
    EVENT_STATUS.ACTIVE,
    EVENT_STATUS.CLOSED,
  ]),
});

export const listEventsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z
    .enum([EVENT_STATUS.DRAFT, EVENT_STATUS.ACTIVE, EVENT_STATUS.CLOSED])
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const eventIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid event ID'),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsSchema>;
