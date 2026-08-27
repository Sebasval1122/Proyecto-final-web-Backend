import { Request, Response, NextFunction } from 'express';

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

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      status: err.status,
      timestamp: new Date().toISOString()
    });
  }

  // Errores de validación (Zod, etc)
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: err.errors || err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token inválido o expirado',
      timestamp: new Date().toISOString()
    });
  }

  // Errores de base de datos
  if (err.code && err.code.startsWith('23')) {
    return res.status(409).json({
      error: 'Conflicto en la base de datos',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Error interno no operacional
  console.error('Error no operacional:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};
