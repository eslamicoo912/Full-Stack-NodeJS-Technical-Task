import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error';
import { env } from '../config/env';

// Catch requests to unknown routes and forward a 404 to the error handler
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// Global error handler translates known error types into http responses.
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Errors thrown by the application
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Invalid or expired token
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  // Request data failed zod schema validation
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Mongoose schema validation failed
  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // Malformed ObjectId (e.g. invalid :id in the URL)
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ message: `Invalid value for ${err.path}` });
    return;
  }

  // MongoDB duplicate key (e.g. registering an existing email)
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 11000
  ) {
    res.status(409).json({ message: 'Duplicate value for a unique field' });
    return;
  }

  // Unexpected errors
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', err);
  }
  res.status(500).json({ message: 'Internal server error' });
};
