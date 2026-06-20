import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';

export class AttendanceController {
  async scan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metadata = {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      const result = await attendanceService.scan(
        req.body,
        req.user!.sub,
        metadata,
      );

      sendSuccess({
        res,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.create(req.body);
      sendSuccess({
        res,
        statusCode: 201,
        data: record,
        message: 'Attendance record created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await attendanceService.findAll(req.query);
      sendSuccess({
        res,
        data: result.records,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.findById(getParamId(req.params.id));
      sendSuccess({ res, data: record });
    } catch (error) {
      next(error);
    }
  }

  async getByEvent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await attendanceService.findByEvent(
        getParamId(req.params.eventId),
        req.query,
      );
      sendSuccess({
        res,
        data: result.records,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await attendanceService.findByUser(
        getParamId(req.params.userId),
        req.query,
      );
      sendSuccess({
        res,
        data: result.records,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.update(getParamId(req.params.id), req.body);
      sendSuccess({
        res,
        data: record,
        message: 'Attendance record updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await attendanceService.delete(getParamId(req.params.id));
      sendSuccess({
        res,
        message: 'Attendance record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
