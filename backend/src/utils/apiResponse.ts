import { Response } from 'express';
import { PaginationMeta } from '../types';

interface SuccessOptions<T> {
  res: Response;
  data?: T;
  message?: string;
  statusCode?: number;
  meta?: PaginationMeta;
}

export function sendSuccess<T>({
  res,
  data,
  message,
  statusCode = 200,
  meta,
}: SuccessOptions<T>): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    meta,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown,
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}
