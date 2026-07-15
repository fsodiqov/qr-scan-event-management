import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import multer from 'multer';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image file is too large (max 20MB)'
        : err.message;
    sendError(res, 400, message, undefined, 'VALIDATION_FAILED');
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.details, err.code);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 400, 'Validation failed', err.flatten(), 'VALIDATION_FAILED');
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([key, val]) => [key, val.message]),
    );
    sendError(res, 400, 'Database validation failed', details, 'DB_VALIDATION_FAILED');
    return;
  }

  if ((err as { code?: number }).code === 11000) {
    sendError(res, 409, 'Duplicate key error', (err as Error).message, 'DUPLICATE_KEY');
    return;
  }

  console.error('Unhandled error:', err);

  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  sendError(res, 500, message, undefined, 'INTERNAL_SERVER_ERROR');
}
