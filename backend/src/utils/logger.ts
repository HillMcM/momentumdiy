/**
 * Logging Utility for Backend
 * 
 * Environment-aware logging that uses Sentry in production
 * Provides structured logging for better debugging and monitoring
 */

import * as Sentry from '@sentry/node';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env['NODE_ENV'] !== 'production';
  }

  /**
   * Log general information
   */
  log(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(message, context || '');
    }
    // In production, only log to Sentry for important events
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(message, context || '');
    }
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      level: 'info',
      data: context || {}
    });
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    console.warn(message, context || '');
    Sentry.captureMessage(message, 'warning');
    if (context) {
      Sentry.setContext('warning_context', context);
    }
  }

  /**
   * Log errors
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    console.error(message, error, context || '');
    
    if (error instanceof Error) {
      Sentry.captureException(error);
      if (context || message) {
        Sentry.setContext('error_context', { message, ...context });
      }
    } else {
      Sentry.captureMessage(message, 'error');
      if (context) {
        Sentry.setContext('error_context', { error, ...context });
      }
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(message, context || '');
    }
  }

  /**
   * Log with custom context
   */
  logWithContext(contextName: string, level: LogLevel, message: string, data?: LogContext): void {
    const fullMessage = `[${contextName}] ${message}`;
    
    switch (level) {
      case 'error':
        this.error(fullMessage, undefined, data);
        break;
      case 'warn':
        this.warn(fullMessage, data);
        break;
      case 'info':
        this.info(fullMessage, data);
        break;
      case 'debug':
        this.debug(fullMessage, data);
        break;
      default:
        this.log(fullMessage, data);
    }
  }

  /**
   * Log API requests
   */
  logApiRequest(method: string, path: string, userId?: string, body?: unknown): void {
    const message = `API ${method} ${path}`;
    this.info(message, { userId, body });
  }

  /**
   * Log API responses
   */
  logApiResponse(method: string, path: string, status: number, userId?: string): void {
    const message = `API ${method} ${path} [${status}]`;
    if (status >= 500) {
      this.error(message, undefined, { userId, status });
    } else if (status >= 400) {
      this.warn(message, { userId, status });
    } else if (this.isDevelopment) {
      this.debug(message, { userId, status });
    }
  }

  /**
   * Log service operations
   */
  logService(serviceName: string, operation: string, data?: LogContext): void {
    const message = `[${serviceName}] ${operation}`;
    this.info(message, data);
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;

