import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AddPhotoInput, UpdatePhotoInput } from '../validations/schemas.js';
import { 
  ForbiddenError, 
  NotFoundError, 
  UnauthorizedError 
} from '../middleware/errorHandler.js';

/**
 * Agregar foto a una mascota
 * POST /api/v1/pets/:slug/photos
 */
export async function addPhoto(
  req: Request<{ slug: string }, object, AddPhotoInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { slug } = req.params;
    const { url, caption, orden } = req.body;

    // Verificar que la mascota existe y pertenece al usuario
    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    if (pet.ownerId !== req.user.id) {
      throw new ForbiddenError('No tienes permiso para añadir fotos a esta mascota');
    }

    // Obtener el orden máximo actual
    const maxOrden = await prisma.petPhoto.findFirst({
      where: { petId: pet.id },
      orderBy: { orden: 'desc' },
      select: { orden: true },
    });

    const photo = await prisma.petPhoto.create({
      data: {
        url,
        caption,
        orden: orden ?? (maxOrden ? maxOrden.orden + 1 : 0),
        petId: pet.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Foto agregada',
      data: photo,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar foto
 * PATCH /api/v1/pets/:slug/photos/:photoId
 */
export async function updatePhoto(
  req: Request<{ slug: string; photoId: string }, object, UpdatePhotoInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { slug, photoId } = req.params;
    const { caption, orden } = req.body;

    // Verificar permisos
    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    if (pet.ownerId !== req.user.id) {
      throw new ForbiddenError('No tienes permiso para editar fotos de esta mascota');
    }

    // Verificar que la foto existe
    const existingPhoto = await prisma.petPhoto.findFirst({
      where: { id: photoId, petId: pet.id },
    });

    if (!existingPhoto) {
      throw new NotFoundError('Foto no encontrada');
    }

    const photo = await prisma.petPhoto.update({
      where: { id: photoId },
      data: { caption, orden },
    });

    res.json({
      success: true,
      message: 'Foto actualizada',
      data: photo,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar foto
 * DELETE /api/v1/pets/:slug/photos/:photoId
 */
export async function deletePhoto(
  req: Request<{ slug: string; photoId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { slug, photoId } = req.params;

    // Verificar permisos
    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    if (pet.ownerId !== req.user.id) {
      throw new ForbiddenError('No tienes permiso para eliminar fotos de esta mascota');
    }

    // Verificar que la foto existe
    const existingPhoto = await prisma.petPhoto.findFirst({
      where: { id: photoId, petId: pet.id },
    });

    if (!existingPhoto) {
      throw new NotFoundError('Foto no encontrada');
    }

    await prisma.petPhoto.delete({
      where: { id: photoId },
    });

    res.json({
      success: true,
      message: 'Foto eliminada',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Listar fotos de una mascota
 * GET /api/v1/pets/:slug/photos
 */
export async function getPhotos(
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    const photos = await prisma.petPhoto.findMany({
      where: { petId: pet.id },
      orderBy: { orden: 'asc' },
    });

    res.json({
      success: true,
      data: photos,
    });
  } catch (error) {
    next(error);
  }
}
