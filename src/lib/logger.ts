import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Structured JSON Logger for centralized monitoring and observability.
 */
class Logger {
  private async getContext() {
    let userId: string | null = null;
    let requestId: string | null = null;

    try {
      const authResult = await auth();
      userId = authResult?.userId;
    } catch {
      // Auth context not available (e.g., background job)
    }

    try {
      const headersList = await headers();
      requestId = headersList.get('x-request-id') || headersList.get('x-vercel-id');
    } catch {
      // Request context not available
    }

    return {
      timestamp: new Date().toISOString(),
      userId: userId || undefined,
      requestId: requestId || undefined,
    };
  }

  private sanitize(context: LogContext): LogContext {
    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  private async log(level: LogLevel, message: string, context?: LogContext) {
    const baseContext = await this.getContext();
    const finalContext = context ? this.sanitize(context) : {};

    const logEntry = {
      level,
      message,
      ...baseContext,
      ...finalContext,
    };

    // Output structured JSON for Datadog / Vercel / CloudWatch
    console.log(JSON.stringify(logEntry));
  }

  async info(message: string, context?: LogContext) {
    return this.log('info', message, context);
  }

  async warn(message: string, context?: LogContext) {
    return this.log('warn', message, context);
  }

  async error(message: string, context?: LogContext) {
    return this.log('error', message, context);
  }
}

export const logger = new Logger();
