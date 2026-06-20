import { z } from 'zod';
import { ATTENDANCE_STATUS } from '../constants/attendanceStatus';

export const scanSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
  eventId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid event ID'),
});

export const createAttendanceSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  eventId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid event ID'),
  checkInTime: z.coerce.date().optional(),
  status: z
    .enum([ATTENDANCE_STATUS.CHECKED_IN, ATTENDANCE_STATUS.CHECKED_OUT])
    .optional(),
});

export const updateAttendanceSchema = z
  .object({
    checkInTime: z.coerce.date().optional(),
    checkOutTime: z.coerce.date().optional(),
    status: z
      .enum([ATTENDANCE_STATUS.CHECKED_IN, ATTENDANCE_STATUS.CHECKED_OUT])
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listAttendanceSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  eventId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  userId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  status: z
    .enum([ATTENDANCE_STATUS.CHECKED_IN, ATTENDANCE_STATUS.CHECKED_OUT])
    .optional(),
});

export const attendanceIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid attendance ID'),
});

export const eventIdAttendanceParamSchema = z.object({
  eventId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid event ID'),
});

export const userIdAttendanceParamSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
});

export type ScanInput = z.infer<typeof scanSchema>;
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceSchema>;
