import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tempPassword } = await userService.create(getAuthContext(req), req.body);
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
      const result = await userService.findAll(getAuthContext(req), req.query);
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
      const user = await userService.findById(getAuthContext(req), getParamId(req.params.id));
      sendSuccess({ res, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.update(
        getAuthContext(req),
        getParamId(req.params.id),
        req.body,
      );
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
      const user = await userService.softDelete(getAuthContext(req), getParamId(req.params.id));
      sendSuccess({
        res,
        data: user,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
