import type { Request, Response, NextFunction, RequestHandler } from 'express';
export type Validator = (req: Request) => string | undefined;
export declare function validate(validator: Validator): RequestHandler;
export declare function validateEmail(email: string): boolean;
export declare function validateUUID(id: string): boolean;
export declare function sanitizeString(input: string, maxLength?: number): string;
export declare function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): string | undefined;
export declare function sanitizeBody(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=validate.d.ts.map