import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tempPassword } = await userService.create(req.body);
      sendSuccess({
        res,
        statusCode: 201,
        data: { user, ...(tempPassword && { tempPassword }) },
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.findAll(req.query);
      sendSuccess({
        res,
        data: result.users,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findById(getParamId(req.params.id));
      sendSuccess({ res, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.update(getParamId(req.params.id), req.body);
      sendSuccess({
        res,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.softDelete(getParamId(req.params.id));
      sendSuccess({
        res,
        data: user,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const qr = await userService.getQrCode(getParamId(req.params.id));
      sendSuccess({ res, data: qr });
    } catch (error) {
      next(error);
    }
  }

  async regenerateQr(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const qr = await userService.regenerateQrToken(getParamId(req.params.id));
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

export const userController = new UserController();
