import type { Request, Response, NextFunction, RequestHandler } from 'express';

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
      res.status(400).json({ success: false, error });
      return;
    }
    next();
  };
}


