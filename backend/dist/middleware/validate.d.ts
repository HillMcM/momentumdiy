import type { Request, RequestHandler } from 'express';
export type Validator = (req: Request) => string | undefined;
export declare function validate(validator: Validator): RequestHandler;
//# sourceMappingURL=validate.d.ts.map