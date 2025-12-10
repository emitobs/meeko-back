import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/index.js';
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../middleware/errorHandler.js';
import prisma from '../lib/prisma.js';
import { s3Client, getS3Url } from '../lib/s3.js';

/**
 * Obtener URL del archivo subido
 */
function getFileUrl(file: Express.Multer.File): string {
  if (config.upload.useS3) {
    // @ts-ignore - multer-s3 agrega estas propiedades
    return file.location || getS3Url(file.key);
  }
  return `/uploads/${file.filename}`;
}

/**
 * Eliminar archivo (S3 o local)
 */
async function deleteFile(fileUrl: string): Promise<void> {
  if (config.upload.useS3) {
    // Extraer la key del URL
    const key = fileUrl.split('.amazonaws.com/')[1] || fileUrl.split('.cloudfront.net/')[1];
    if (key) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: config.aws.bucketName,
          Key: key,
        }));
      } catch (error) {
        console.error('Error eliminando archivo de S3:', error);
      }
    }
  } else {
    // Eliminar archivo local
    if (fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(config.upload.dir, path.basename(fileUrl));
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignorar si no existe
      }
    }
  }
}

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

    const imageUrl = getFileUrl(req.file);

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

    const imageUrl = getFileUrl(req.file);

    if (type === 'main') {
      // Eliminar imagen anterior si existe
      if (pet.fotoPrincipal) {
        await deleteFile(pet.fotoPrincipal);
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

    const imageUrl = getFileUrl(req.file);

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true },
    });

    // Eliminar avatar anterior si existe
    if (user?.avatar) {
      await deleteFile(user.avatar);
    }

    // Actualizar avatar
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: imageUrl },
    });

    res.json({
      success: true,
      message: 'Avatar actualizado',
      data: { url: imageUrl },
    });
  } catch (error) {
    next(error);
  }
}
