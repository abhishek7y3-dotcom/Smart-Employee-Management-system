import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) {
  const status = err.status ?? 500;

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: [],
  });
}
