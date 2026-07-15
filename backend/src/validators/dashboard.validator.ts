import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

export const dashboardStatsQuerySchema = z.object({
  eventId: objectId.optional(),
});

export const dashboardReportQuerySchema = z
  .object({
    eventId: objectId.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    period: z.enum(['day', 'week', 'month', 'custom']).optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) return data.from <= data.to;
      return true;
    },
    { message: 'from must be before to', path: ['from'] },
  );

export type DashboardStatsQuery = z.infer<typeof dashboardStatsQuerySchema>;
export type DashboardReportQuery = z.infer<typeof dashboardReportQuerySchema>;
