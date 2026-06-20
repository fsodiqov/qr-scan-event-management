import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles';
import { ForbiddenError } from '../utils/AppError';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

export function authorizeSelfOrAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(new ForbiddenError('Authentication required'));
    return;
  }

  const targetId = req.params.id || req.params.userId;

  if (req.user.role === 'admin' || req.user.sub === targetId) {
    next();
    return;
  }

  next(new ForbiddenError('You can only access your own resources'));
}
