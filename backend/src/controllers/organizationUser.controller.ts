import { Request, Response, NextFunction } from 'express';
import { organizationUserService } from '../services/organizationUser.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';

export class OrganizationUserController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await organizationUserService.create(getAuthContext(req), req.body);
      sendSuccess({
        res,
        statusCode: 201,
        data: result,
        message: 'Organization user created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await organizationUserService.findAll(getAuthContext(req), req.query);
      sendSuccess({
        res,
        data: result.members,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await organizationUserService.findById(
        getAuthContext(req),
        getParamId(req.params.id),
      );
      sendSuccess({ res, data: member });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await organizationUserService.update(
        getAuthContext(req),
        getParamId(req.params.id),
        req.body,
      );
      sendSuccess({
        res,
        data: member,
        message: 'Organization user updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await organizationUserService.remove(
        getAuthContext(req),
        getParamId(req.params.id),
      );
      sendSuccess({ res, message: 'Organization user removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const organizationUserController = new OrganizationUserController();
