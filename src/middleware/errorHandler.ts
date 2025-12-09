import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

/**
 * Interfaz para errores personalizados
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error 404 - Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
  }
}

/**
 * Error 400 - Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud inválida') {
    super(message, 400);
  }
}

/**
 * Error 401 - Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

/**
 * Error 403 - Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403);
  }
}

/**
 * Error 409 - Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual') {
    super(message, 409);
  }
}

/**
 * Middleware para manejar rutas no encontradas
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Middleware global para manejar errores
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log del error
  console.error('Error:', {
    message: err.message,
    stack: config.isProduction ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Si es un error operacional (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Errores de Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      message: 'Error en la base de datos',
    });
    return;
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: config.isProduction 
      ? 'Error interno del servidor' 
      : err.message,
  });
}
