import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';
import { getAuthContext } from '../middleware/auth';
import type { DashboardReportQuery } from '../validators/dashboard.validator';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.query.eventId as string | undefined;
      const stats = await dashboardService.getStats(getAuthContext(req), eventId);
      sendSuccess({ res, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await dashboardService.getReport(
        getAuthContext(req),
        req.query as unknown as DashboardReportQuery,
      );
      sendSuccess({ res, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = req.query.eventId as string | undefined;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const result = await dashboardService.getRecentActivity(
        getAuthContext(req),
        eventId,
        page,
        limit,
      );
      sendSuccess({
        res,
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
