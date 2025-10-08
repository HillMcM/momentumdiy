/**
 * Logging Utility for Frontend
 * 
 * Environment-aware logging that only outputs in development
 * Provides structured logging for better debugging
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  /**
   * Log general information (development only)
   */
  log(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log informational messages (development only)
   */
  info(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Log warnings (always shown)
   */
  warn(...args: unknown[]): void {
    console.warn(...args);
  }

  /**
   * Log errors (always shown)
   */
  error(...args: unknown[]): void {
    console.error(...args);
  }

  /**
   * Log debug information (development only)
   */
  debug(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Log with context (development only)
   */
  logWithContext(context: string, level: LogLevel, ...args: unknown[]): void {
    if (!this.isDevelopment && level !== 'error' && level !== 'warn') {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${context}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'debug':
        console.debug(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }

  /**
   * Log API requests (development only)
   */
  logApiRequest(method: string, url: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(`🌐 API ${method} ${url}`, data || '');
    }
  }

  /**
   * Log API responses (development only)
   */
  logApiResponse(method: string, url: string, status: number, data?: unknown): void {
    if (this.isDevelopment) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} API ${method} ${url} [${status}]`, data || '');
    }
  }

  /**
   * Log component lifecycle events (development only)
   */
  logComponent(componentName: string, event: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(`🔷 [${componentName}] ${event}`, data || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;

