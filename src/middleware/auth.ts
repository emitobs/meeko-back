import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../lib/prisma.js';

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Middleware para verificar el token JWT
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticacion no proporcionado',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
      };

      next();
    } catch (_jwtError) {
      res.status(401).json({
        success: false,
        message: 'Token invalido o expirado',
      });
      return;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware opcional de autenticacion (no falla si no hay token)
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    } catch {
      // Token invalido, pero no falla
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Parsear duracion a segundos
 */
function parseExpiration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 604800; // 7 dias por defecto
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 604800;
  }
}

/**
 * Generar token de acceso JWT
 */
export function generateAccessToken(userId: string, email: string): string {
  const expiresIn = parseExpiration(config.jwt.expiresIn);
  return jwt.sign({ userId, email }, config.jwt.secret, { expiresIn });
}

/**
 * Generar token de refresh
 */
export function generateRefreshToken(userId: string, email: string): string {
  const expiresIn = parseExpiration(config.jwt.refreshExpiresIn);
  return jwt.sign({ userId, email, type: 'refresh' }, config.jwt.secret, { expiresIn });
}
