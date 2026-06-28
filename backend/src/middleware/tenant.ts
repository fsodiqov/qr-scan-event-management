import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/AppError';
import { ERROR_CODES } from '../constants/errorCodes';
import { isPlatformRole } from '../constants/roles';

export function requireOrganization(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(new ForbiddenError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED));
    return;
  }

  if (isPlatformRole(req.user.role)) {
    next();
    return;
  }

  if (!req.user.organizationId) {
    next(
      new ForbiddenError(
        'Organization membership is required',
        ERROR_CODES.ORG_MEMBERSHIP_REQUIRED,
      ),
    );
    return;
  }

  req.organizationId = req.user.organizationId;
  next();
}
