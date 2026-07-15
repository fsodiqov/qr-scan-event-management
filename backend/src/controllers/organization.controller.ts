import { Request, Response, NextFunction } from 'express';
import { organizationService } from '../services/organization.service';
import { organizationUserService } from '../services/organizationUser.service';
import { sendSuccess } from '../utils/apiResponse';
import { getParamId } from '../utils/params';
import { getAuthContext } from '../middleware/auth';
import type { ListOrganizationUsersQuery } from '../validators/organizationUser.validator';

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await organizationService.create(req.body);
      sendSuccess({
        res,
        statusCode: 201,
        data: result,
        message: 'Organization created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await organizationService.findAll(req.query);
      sendSuccess({
        res,
        data: result.organizations,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await organizationService.findById(getParamId(req.params.id));
      sendSuccess({ res, data: organization });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await organizationService.update(
        getParamId(req.params.id),
        req.body,
      );
      sendSuccess({
        res,
        data: organization,
        message: 'Organization updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await organizationService.delete(getParamId(req.params.id));
      sendSuccess({ res, message: 'Organization deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await organizationService.getMyOrganization(getAuthContext(req));
      sendSuccess({ res, data: organization });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await organizationService.updateMyOrganization(
        getAuthContext(req),
        req.body,
      );
      sendSuccess({
        res,
        data: organization,
        message: 'Organization updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadMyLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organization = await organizationService.uploadMyLogo(
        getAuthContext(req),
        req.file,
      );
      sendSuccess({
        res,
        data: organization,
        message: 'Organization logo updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = getParamId(req.params.id);
      await organizationService.findById(organizationId);
      const result = await organizationUserService.findAllInOrganization(
        organizationId,
        req.query as ListOrganizationUsersQuery,
      );
      sendSuccess({
        res,
        data: result.members,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = getParamId(req.params.id);
      await organizationService.findById(organizationId);
      const member = await organizationUserService.updateInOrganization(
        organizationId,
        getParamId(req.params.memberId),
        req.body,
        { allowOwnerEdit: true },
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
}

export const organizationController = new OrganizationController();
