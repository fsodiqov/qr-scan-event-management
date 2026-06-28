import { Request, Response, NextFunction } from 'express';
import { qrService } from '../services/qr.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';

export class QrController {
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const participant = await qrService.validateToken(
        getAuthContext(req),
        getParamId(req.params.token),
      );
      sendSuccess({
        res,
        data: {
          valid: true,
          participant: {
            id: participant._id,
            name: participant.name,
            phone: participant.phone,
            email: participant.email,
            eventId: participant.eventId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const qrController = new QrController();
