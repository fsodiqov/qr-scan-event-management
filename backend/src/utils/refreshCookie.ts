import { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env';
import { parseDurationMs } from './parseDuration';

export const REFRESH_COOKIE_NAME = 'refreshToken';
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, string> | undefined;
  const value = cookies?.[REFRESH_COOKIE_NAME];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function baseCookieOptions(): CookieOptions {
  const crossSite = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: crossSite,
    // Cross-origin SPA (e.g. Vercel + Cloud Run) needs None; local proxy uses Lax.
    sameSite: crossSite ? 'none' : 'lax',
    path: REFRESH_COOKIE_PATH,
  };
}

export function setRefreshCookie(
  res: Response,
  token: string,
  options: { rememberMe: boolean; expiresAt: Date },
): void {
  const cookieOptions: CookieOptions = {
    ...baseCookieOptions(),
  };

  if (options.rememberMe) {
    cookieOptions.expires = options.expiresAt;
    cookieOptions.maxAge = Math.max(0, options.expiresAt.getTime() - Date.now());
  }
  // Session cookie when rememberMe is false (no maxAge / expires)

  res.cookie(REFRESH_COOKIE_NAME, token, cookieOptions);
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions());
}

export function refreshTtlMs(rememberMe: boolean): number {
  return parseDurationMs(
    rememberMe ? env.JWT_REFRESH_REMEMBER_EXPIRES_IN : env.JWT_REFRESH_EXPIRES_IN,
  );
}
