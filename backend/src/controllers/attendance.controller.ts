import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';

export class AttendanceController {
  async scan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metadata = {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      const result = await attendanceService.scan(
        getAuthContext(req),
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
      const record = await attendanceService.create(getAuthContext(req), req.body);
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
      const result = await attendanceService.findAll(getAuthContext(req), req.query);
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
      const record = await attendanceService.findById(
        getAuthContext(req),
        getParamId(req.params.id),
      );
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
        getAuthContext(req),
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

  async getByParticipant(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await attendanceService.findByParticipant(
        getAuthContext(req),
        getParamId(req.params.participantId),
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
      const record = await attendanceService.update(
        getAuthContext(req),
        getParamId(req.params.id),
        req.body,
      );
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
      await attendanceService.delete(getAuthContext(req), getParamId(req.params.id));
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
