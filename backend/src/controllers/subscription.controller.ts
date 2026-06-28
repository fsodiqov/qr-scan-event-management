import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';
import { organizationService } from '../services/organization.service';

export class SubscriptionController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await subscriptionService.create(req.body);
      sendSuccess({
        res,
        statusCode: 201,
        data: subscription,
        message: 'Subscription created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subscriptionService.findAll(req.query);
      sendSuccess({
        res,
        data: result.subscriptions,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await subscriptionService.findById(getParamId(req.params.id));
      sendSuccess({ res, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscription = await subscriptionService.update(
        getParamId(req.params.id),
        req.body,
      );
      sendSuccess({
        res,
        data: subscription,
        message: 'Subscription updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMySubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await organizationService.getMyOrganization(getAuthContext(req));
      if (!organization.subscriptionId) {
        sendSuccess({ res, data: null });
        return;
      }
      const subscription = await subscriptionService.findById(
        organization.subscriptionId.toString(),
      );
      sendSuccess({ res, data: subscription });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
