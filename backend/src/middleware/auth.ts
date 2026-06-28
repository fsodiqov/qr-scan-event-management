import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { ERROR_CODES } from '../constants/errorCodes';
import { User } from '../models/User';
import { OrganizationUser } from '../models/OrganizationUser';
import { Organization } from '../models/Organization';
import { ORG_USER_STATUS } from '../constants/organizationUserStatus';
import { ORGANIZATION_STATUS } from '../constants/organizationStatus';
import { PLATFORM_ROLES } from '../constants/roles';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required', ERROR_CODES.ACCESS_TOKEN_REQUIRED);
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    const user = await User.findById(payload.sub).select('+passwordHash');

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive', ERROR_CODES.USER_NOT_FOUND_OR_INACTIVE);
    }

    if (user.isSuperAdmin) {
      req.user = {
        sub: user._id.toString(),
        role: PLATFORM_ROLES.SUPER_ADMIN,
        login: user.login,
        phone: user.phone,
      };
      next();
      return;
    }

    const orgUser = await OrganizationUser.findOne({
      userId: user._id,
      status: ORG_USER_STATUS.ACTIVE,
    });

    if (!orgUser) {
      throw new ForbiddenError(
        'Organization membership is required',
        ERROR_CODES.ORG_MEMBERSHIP_REQUIRED,
      );
    }

    if (
      payload.organizationId &&
      orgUser.organizationId.toString() !== payload.organizationId
    ) {
      throw new ForbiddenError('Organization access denied', ERROR_CODES.ORG_ACCESS_DENIED);
    }

    const organization = await Organization.findById(orgUser.organizationId);

    if (!organization) {
      throw new ForbiddenError('Organization not found', ERROR_CODES.ORGANIZATION_NOT_FOUND);
    }

    if (organization.status === ORGANIZATION_STATUS.SUSPENDED) {
      throw new ForbiddenError('Organization is suspended', ERROR_CODES.ORGANIZATION_SUSPENDED);
    }

    req.user = {
      sub: user._id.toString(),
      organizationId: orgUser.organizationId.toString(),
      role: orgUser.role,
      login: user.login,
      phone: user.phone,
    };
    req.organizationId = orgUser.organizationId.toString();

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Invalid or expired token', ERROR_CODES.INVALID_OR_EXPIRED_TOKEN));
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  authenticate(req, _res, next);
}

export function getAuthContext(req: Request) {
  if (!req.user) {
    throw new ForbiddenError('Authentication required', ERROR_CODES.AUTHENTICATION_REQUIRED);
  }

  return {
    userId: req.user.sub,
    organizationId: req.user.organizationId,
    role: req.user.role,
  };
}
