import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JwtService } from '../../infrastructure/security/JwtService';

export class AppError extends Error {
  status: number;
  isOperational: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

type ErrHandler = (err: Error, req: Request, res: Response, next: NextFunction) => void;

export const errorHandler: ErrHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      status: err.status,
      timestamp: new Date().toISOString()
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: err.errors,
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token inválido o expirado',
      timestamp: new Date().toISOString()
    });
  }

  if (isDatabaseError(err)) {
    return res.status(409).json({
      error: 'Conflicto en la base de datos',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  console.error('Error no operacional:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};

function isDatabaseError(err: unknown): err is { code: string; message: string } {
  return typeof err === 'object' && err !== null && 'code' in err && typeof (err as any).code === 'string' && (err as any).code.startsWith('23');
}
