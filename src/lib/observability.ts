import { logger } from './logger';

interface ObservabilityOptions {
  actionName?: string;
  [key: string]: unknown;
}

/**
 * Centralized exception tracking.
 * Abstracts out Sentry / Vercel Observability so it can be swapped easily.
 */
export async function observeException(error: unknown, options?: ObservabilityOptions) {
  // In a real scenario, you would do: Sentry.captureException(error, { extra: options })
  
  // For now, we simply ensure it reaches our structured logger with a specific tag
  // if it hasn't been logged already by the caller.
  await logger.error({
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...options
  }, "OBSERVED_EXCEPTION");
}
