import { Request, Response, NextFunction } from 'express';
import { platformDashboardService } from '../services/platformDashboard.service';
import { sendSuccess } from '../utils/apiResponse';

export class PlatformDashboardController {
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await platformDashboardService.getStats();
      sendSuccess({ res, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export const platformDashboardController = new PlatformDashboardController();
