import { Request, Response, NextFunction } from 'express';
import { qrService } from '../services/qr.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';

export class QrController {
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await qrService.validateToken(getParamId(req.params.token));
      sendSuccess({
        res,
        data: {
          valid: true,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            organization: user.organization,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const qrController = new QrController();
