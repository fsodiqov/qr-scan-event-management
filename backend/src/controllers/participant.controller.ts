import { Request, Response, NextFunction } from 'express';
import { participantService } from '../services/participant.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';

export class ParticipantController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participant = await participantService.create(getAuthContext(req), req.body);
      sendSuccess({
        res,
        statusCode: 201,
        data: participant,
        message: 'Participant created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await participantService.findAll(getAuthContext(req), req.query);
      sendSuccess({
        res,
        data: result.participants,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async listByEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await participantService.findByEvent(
        getAuthContext(req),
        getParamId(req.params.eventId),
        req.query,
      );
      sendSuccess({
        res,
        data: result.participants,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participant = await participantService.findById(
        getAuthContext(req),
        getParamId(req.params.id),
      );
      sendSuccess({ res, data: participant });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participant = await participantService.update(
        getAuthContext(req),
        getParamId(req.params.id),
        req.body,
      );
      sendSuccess({
        res,
        data: participant,
        message: 'Participant updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participant = await participantService.softDelete(
        getAuthContext(req),
        getParamId(req.params.id),
      );
      sendSuccess({
        res,
        data: participant,
        message: 'Participant deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const qr = await participantService.getQrCode(
        getAuthContext(req),
        getParamId(req.params.id),
      );
      sendSuccess({ res, data: qr });
    } catch (error) {
      next(error);
    }
  }

  async regenerateQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const qr = await participantService.regenerateQrToken(
        getAuthContext(req),
        getParamId(req.params.id),
      );
      sendSuccess({
        res,
        data: qr,
        message: 'QR token regenerated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const participantController = new ParticipantController();
