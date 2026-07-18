import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ForbiddenError } from '../utils/AppError';
import { ERROR_CODES } from '../constants/errorCodes';

function allowedOrigins(): string[] {
  return env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
}

function isAllowedOriginValue(origin: string): boolean {
  if (allowedOrigins().includes(origin)) return true;

  if (env.NODE_ENV === 'production') return false;

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app') || hostname === 'vercel.app';
  } catch {
    return false;
  }
}

/**
 * Extra CSRF protection for cookie-authenticated auth endpoints.
 * Allows same-origin / no-Origin (non-browser) and allowlisted Origins.
 */
export function requireAllowedOrigin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const origin = req.get('origin');
  if (!origin) {
    next();
    return;
  }

  if (isAllowedOriginValue(origin)) {
    next();
    return;
  }

  next(new ForbiddenError('Origin not allowed', ERROR_CODES.FORBIDDEN));
}
