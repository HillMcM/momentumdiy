import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { logger } from '../utils/logger';

/**
 * Minimal schema-based validator. Accepts a function that returns a string
 * error message (when invalid) or undefined (when valid). This avoids adding
 * a heavy validation library while still centralizing shape checks.
 */
export type Validator = (req: Request) => string | undefined;

export function validate(validator: Validator): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const error = validator(req);
    if (error) {
      logger.warn('Validation failed', { error, path: req.path });
      res.status(400).json({ success: false, error });
      return;
    }
    next();
  };
}

/**
 * Common validation helpers
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): string | undefined {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return undefined;
}

/**
 * Sanitize body to prevent injection attacks
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Basic sanitization - remove potential script tags
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }
  next();
}


