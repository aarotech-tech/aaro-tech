import { logger } from './logger';
import { observeException } from './observability';

/**
 * Standardized application errors.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Standardized generic wrapper for Server Actions.
 * Catches all errors, logs them centrally, and returns a safe response.
 */
export async function withActionErrorHandling<T>(
  actionName: string,
  action: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await action();
    return { success: true, data: result };
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    // If it's a known Next.js navigation error, bubble it up
    if (err.message?.includes('NEXT_REDIRECT') || err.message?.includes('NEXT_NOT_FOUND')) {
      throw error;
    }

    if (err instanceof AppError || err.name === 'UnauthorizedError' || err.name === 'ForbiddenError') {
      // It's an expected operational error (e.g. Validation, Auth)
      logger.warn(`Action [${actionName}] failed: ${err.message}`, {
        error: err.message,
      });
      return { success: false, error: err.message };
    }

    // It's an unexpected error, log it as an error and report to observability
    logger.error(`Action [${actionName}] encountered an unexpected error: ${err.message}`, {
      error: err.message,
      stack: err.stack,
    });
    
    // Fire and forget observation
    void observeException(error, { actionName });

    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}
