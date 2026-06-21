import { Response } from 'express';
import { PaginationMeta } from '../types';

interface SuccessOptions<T> {
  res: Response;
  data?: T;
  message?: string;
  code?: string;
  statusCode?: number;
  meta?: PaginationMeta;
}

export function sendSuccess<T>({
  res,
  data,
  message,
  code,
  statusCode = 200,
  meta,
}: SuccessOptions<T>): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    code,
    meta,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown,
  code?: string,
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
  });
}
