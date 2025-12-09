import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/index.js';
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../middleware/errorHandler.js';
import prisma from '../lib/prisma.js';

/**
 * Subir imagen
 * POST /api/v1/upload
 */
export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (!req.file) {
      throw new BadRequestError('No se proporcionó ninguna imagen');
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Subir imagen de mascota y actualizar
 * POST /api/v1/pets/:slug/upload
 */
export async function uploadPetImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { slug } = req.params;
    const { type } = req.body; // 'main' o 'gallery'

    // Verificar que la mascota existe y pertenece al usuario
    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true, ownerId: true, fotoPrincipal: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    if (pet.ownerId !== req.user.id) {
      throw new ForbiddenError('No tienes permiso para subir imágenes de esta mascota');
    }

    if (!req.file) {
      throw new BadRequestError('No se proporcionó ninguna imagen');
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    if (type === 'main') {
      // Eliminar imagen anterior si existe
      if (pet.fotoPrincipal && pet.fotoPrincipal.startsWith('/uploads/')) {
        const oldPath = path.join(config.upload.dir, path.basename(pet.fotoPrincipal));
        try {
          await fs.unlink(oldPath);
        } catch {
          // Ignorar si no existe
        }
      }

      // Actualizar foto principal
      await prisma.pet.update({
        where: { id: pet.id },
        data: { fotoPrincipal: imageUrl },
      });

      res.json({
        success: true,
        message: 'Foto principal actualizada',
        data: { url: imageUrl },
      });
    } else {
      // Agregar a galería
      const maxOrden = await prisma.petPhoto.findFirst({
        where: { petId: pet.id },
        orderBy: { orden: 'desc' },
        select: { orden: true },
      });

      const photo = await prisma.petPhoto.create({
        data: {
          url: imageUrl,
          orden: maxOrden ? maxOrden.orden + 1 : 0,
          petId: pet.id,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Foto agregada a la galería',
        data: photo,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Subir avatar de usuario
 * POST /api/v1/upload/avatar
 */
export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (!req.file) {
      throw new BadRequestError('No se proporcionó ninguna imagen');
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true },
    });

    // Eliminar avatar anterior si existe
    if (user?.avatar && user.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(config.upload.dir, path.basename(user.avatar));
      try {
        await fs.unlink(oldPath);
      } catch {
        // Ignorar si no existe
      }
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    // Actualizar avatar
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
    });

    res.json({
      success: true,
      message: 'Avatar actualizado',
      data: { url: avatarUrl },
    });
  } catch (error) {
    next(error);
  }
}
