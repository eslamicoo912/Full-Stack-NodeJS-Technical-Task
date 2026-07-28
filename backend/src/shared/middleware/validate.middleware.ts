import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

// validate and sanitize the request body .
export const validate = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
};
