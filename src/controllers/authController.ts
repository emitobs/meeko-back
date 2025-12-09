import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { 
  RegisterInput, 
  LoginInput, 
  UpdateUserInput, 
  ChangePasswordInput 
} from '../validations/schemas.js';
import { 
  BadRequestError, 
  ConflictError, 
  NotFoundError, 
  UnauthorizedError 
} from '../middleware/errorHandler.js';

/**
 * Registro de nuevo usuario
 * POST /api/v1/auth/register
 */
export async function register(
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, nombre, telefono, whatsapp, instagram, facebook } = req.body;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        telefono,
        whatsapp,
        instagram,
        facebook,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        telefono: true,
        whatsapp: true,
        instagram: true,
        facebook: true,
        createdAt: true,
      },
    });

    // Generar tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Guardar refresh token en DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login de usuario
 * POST /api/v1/auth/login
 */
export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generar tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Guardar refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          telefono: user.telefono,
          whatsapp: user.whatsapp,
          instagram: user.instagram,
          facebook: user.facebook,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout de usuario
 * POST /api/v1/auth/logout
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Eliminar el refresh token de la DB
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({
      success: true,
      message: 'Logout exitoso',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener perfil del usuario autenticado
 * GET /api/v1/auth/me
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        telefono: true,
        whatsapp: true,
        instagram: true,
        facebook: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { pets: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar perfil del usuario
 * PATCH /api/v1/auth/me
 */
export async function updateProfile(
  req: Request<object, object, UpdateUserInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        nombre: true,
        telefono: true,
        whatsapp: true,
        instagram: true,
        facebook: true,
        avatar: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cambiar contraseña
 * POST /api/v1/auth/change-password
 */
export async function changePassword(
  req: Request<object, object, ChangePasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      throw new BadRequestError('La contraseña actual es incorrecta');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidar todos los refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada. Por favor, vuelve a iniciar sesión.',
    });
  } catch (error) {
    next(error);
  }
}
