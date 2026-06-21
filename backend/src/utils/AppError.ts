export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode = 500,
    details?: unknown,
    code?: string,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, undefined, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, undefined, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, undefined, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown, code = 'CONFLICT') {
    super(message, 409, details, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown, code = 'BAD_REQUEST') {
    super(message, 400, details, code);
  }
}
