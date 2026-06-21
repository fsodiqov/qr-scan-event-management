import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/AppError';
import { ERROR_CODES } from '../constants/errorCodes';
import { User } from '../models/User';

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

    req.user = {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      phone: user.phone,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
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
