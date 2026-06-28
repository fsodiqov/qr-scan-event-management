import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';

export class EventController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await eventService.create(req.body, getAuthContext(req));
      sendSuccess({
        res,
        statusCode: 201,
        data: event,
        message: 'Event created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.findAll(getAuthContext(req), req.query);
      sendSuccess({
        res,
        data: result.events,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.findByIdWithStats(
        getAuthContext(req),
        getParamId(req.params.id),
      );
      sendSuccess({ res, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await eventService.update(
        getAuthContext(req),
        getParamId(req.params.id),
        req.body,
      );
      sendSuccess({
        res,
        data: event,
        message: 'Event updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const event = await eventService.updateStatus(
        getAuthContext(req),
        getParamId(req.params.id),
        req.body.status,
      );
      sendSuccess({
        res,
        data: event,
        message: 'Event status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await eventService.delete(getAuthContext(req), getParamId(req.params.id));
      sendSuccess({
        res,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const eventController = new EventController();
