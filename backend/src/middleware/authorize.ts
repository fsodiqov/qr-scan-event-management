import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles';
import { Permission, hasAnyPermission } from '../constants/permissions';
import { ForbiddenError } from '../utils/AppError';
import { ERROR_CODES } from '../constants/errorCodes';
import { isPlatformRole } from '../constants/roles';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions', ERROR_CODES.INSUFFICIENT_PERMISSIONS));
      return;
    }

    next();
  };
}

export function authorizePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED));
      return;
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      next(new ForbiddenError('Insufficient permissions', ERROR_CODES.INSUFFICIENT_PERMISSIONS));
      return;
    }

    next();
  };
}

export function authorizeSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(new ForbiddenError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED));
    return;
  }

  if (!isPlatformRole(req.user.role)) {
    next(new ForbiddenError('Super admin access required', ERROR_CODES.INSUFFICIENT_PERMISSIONS));
    return;
  }

  next();
}

export function authorizeSelfOrAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(new ForbiddenError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED));
    return;
  }

  const targetId = req.params.id || req.params.userId;

  if (req.user.sub === targetId) {
    next();
    return;
  }

  next(new ForbiddenError('You can only access your own resources', ERROR_CODES.SELF_ACCESS_ONLY));
}
