import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(err.message);

  // Don't expose stack traces or internal details in responses
  res.status(500).json({
    success: false,
    error: { message: 'Failed to generate email' },
  });
}
