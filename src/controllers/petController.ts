import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { config } from '../config/index.js';
import { CreatePetInput, UpdatePetInput } from '../validations/schemas.js';
import { generatePetQRCode, generateQRCodeWithLogo } from '../lib/qrcode.js';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError
} from '../middleware/errorHandler.js';

/**
 * Generar slug unico para una mascota
 */
function generateSlug(nombre: string): string {
  const baseSlug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseSlug}-${uuidv4().slice(0, 8)}`;
}

/**
 * Generar codigo QR para una mascota con logo opcional
 * Usa qrUuid para URL permanente (no cambia con el slug)
 */
async function generateQRCode(qrUuid: string, logoUrl?: string): Promise<string> {
  const petUrl = `${config.frontendUrl}/pet/${qrUuid}`;

  // Si hay logo personalizado, usarlo
  if (logoUrl) {
    return generateQRCodeWithLogo(petUrl, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H',
      logo: {
        url: logoUrl,
        size: 100,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        padding: 10,
      },
    });
  }

  // Intentar usar logo predeterminado de PetQR
  return generatePetQRCode(petUrl);
}

/**
 * Listar todas las mascotas (publico)
 * GET /api/v1/pets
 */
export async function getAllPets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { especie, isLost, limit = '20', offset = '0' } = req.query;

    const where: {
      especie?: string;
      isLost?: boolean;
    } = {};

    if (especie && typeof especie === 'string') {
      where.especie = especie;
    }

    if (isLost !== undefined) {
      where.isLost = isLost === 'true';
    }

    const pets = await prisma.pet.findMany({
      where,
      take: parseInt(limit as string, 10),
      skip: parseInt(offset as string, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            whatsapp: true,
            instagram: true,
            facebook: true,
          },
        },
        fotos: {
          orderBy: { orden: 'asc' },
        },
        _count: {
          select: { scans: true },
        },
      },
    });

    const total = await prisma.pet.count({ where });

    res.json({
      success: true,
      data: pets,
      pagination: {
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener mascota por qrUuid (para escaneo de QR)
 * GET /api/v1/pet/:qrUuid
 */
export async function getPetByQrUuid(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { qrUuid } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { qrUuid },
      include: {
        owner: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            whatsapp: true,
            instagram: true,
            facebook: true,
          },
        },
        fotos: {
          orderBy: { orden: 'asc' },
        },
        _count: {
          select: { scans: true },
        },
      },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    res.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener mascota por slug
 * GET /api/v1/pets/:slug
 */
export async function getPetBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            whatsapp: true,
            email: true,
            instagram: true,
            facebook: true,
          },
        },
        fotos: {
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    res.json({
      success: true,
      data: pet,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Listar mascotas del usuario autenticado
 * GET /api/v1/pets/my-pets
 */
export async function getMyPets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const pets = await prisma.pet.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        fotos: {
          orderBy: { orden: 'asc' },
        },
        _count: {
          select: { scans: true },
        },
      },
    });

    res.json({
      success: true,
      data: pets,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crear nueva mascota
 * POST /api/v1/pets
 */
export async function createPet(
  req: Request<object, object, CreatePetInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { nombre, slug: customSlug, especie, raza, edad, descripcion, indicaciones, ubicacion, fotoPrincipal } = req.body;

    // Usar slug personalizado o generar uno automático
    let slug = customSlug || generateSlug(nombre);

    // Verificar que el slug sea único
    const existingPet = await prisma.pet.findUnique({
      where: { slug },
    });

    if (existingPet) {
      res.status(409).json({
        success: false,
        message: 'Este slug ya está en uso. Por favor elige otro.',
      });
      return;
    }

    // Crear mascota
    const pet = await prisma.pet.create({
      data: {
        slug,
        nombre,
        especie,
        raza,
        edad,
        descripcion,
        indicaciones,
        ubicacion,
        fotoPrincipal,
        ownerId: req.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            whatsapp: true,
            instagram: true,
            facebook: true,
          },
        },
      },
    });

    // Generar QR Code con UUID permanente
    if (!pet.qrUuid) {
      throw new Error('qrUuid no generado correctamente');
    }
    const qrCode = await generateQRCode(pet.qrUuid);

    // Actualizar mascota con el QR
    await prisma.pet.update({
      where: { id: pet.id },
      data: { qrCode },
    });

    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      data: {
        ...pet,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar mascota
 * PATCH /api/v1/pets/:slug
 */
export async function updatePet(
  req: Request<{ slug: string }, object, UpdatePetInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { slug } = req.params;

    // Verificar que la mascota existe y pertenece al usuario
    const existingPet = await prisma.pet.findUnique({
      where: { slug },
    });

    if (!existingPet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    if (existingPet.ownerId !== req.user.id) {
      throw new ForbiddenError('No tienes permiso para editar esta mascota');
    }

    // Si se está actualizando el slug, verificar que sea único
    if (req.body.slug && req.body.slug !== existingPet.slug) {
      const slugExists = await prisma.pet.findUnique({
        where: { slug: req.body.slug },
      });

      if (slugExists) {
        res.status(409).json({
          success: false,
          message: 'Este slug ya está en uso. Por favor elige otro.',
        });
        return;
      }
    }

    // Manejar el estado de perdida
    const updateData: UpdatePetInput & { lostAt?: Date | null; foundAt?: Date | null; qrCode?: string } = { ...req.body };

    // Ya no regeneramos QR al cambiar slug, porque usa qrUuid permanente

    if (req.body.isLost !== undefined) {
      if (req.body.isLost && !existingPet.isLost) {
        updateData.lostAt = new Date();
        updateData.foundAt = null;
      } else if (!req.body.isLost && existingPet.isLost) {
        updateData.foundAt = new Date();
      }
    }

    const pet = await prisma.pet.update({
      where: { slug },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            whatsapp: true,
            instagram: true,
            facebook: true,
          },
        },
        fotos: {
          orderBy: { orden: 'asc' },
        },
      },
    });

    res.json({
      success: true,
      message: 'Mascota actualizada',
      data: pet,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar mascota
 * DELETE /api/v1/pets/:slug
 */
export async function deletePet(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { slug } = req.params;

    // Verificar que la mascota existe y pertenece al usuario
    const pet = await prisma.pet.findUnique({
      where: { slug },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    if (pet.ownerId !== req.user.id) {
      throw new ForbiddenError('No tienes permiso para eliminar esta mascota');
    }

    await prisma.pet.delete({
      where: { slug },
    });

    res.json({
      success: true,
      message: 'Mascota eliminada',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener QR code de una mascota
 * GET /api/v1/pets/:slug/qr
 */
export async function getQRCode(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true, qrCode: true, qrUuid: true, slug: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    // Si no tiene QR, generarlo con qrUuid permanente
    let qrCode = pet.qrCode;
    if (!qrCode) {
      if (!pet.qrUuid) {
        throw new Error('Mascota sin qrUuid. Contacta al administrador.');
      }
      qrCode = await generateQRCode(pet.qrUuid);
      await prisma.pet.update({
        where: { id: pet.id },
        data: { qrCode },
      });
    }

    res.json({
      success: true,
      data: {
        qrCode,
        qrUuid: pet.qrUuid,
        slug: pet.slug,
        petId: pet.id,
        url: `${config.frontendUrl}/pet/${pet.qrUuid}`,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Registrar escaneo de QR
 * POST /api/v1/pets/:slug/scan
 */
export async function recordScan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;
    const { latitude, longitude } = req.body;

    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    // Registrar el escaneo
    await prisma.qRScan.create({
      data: {
        petId: pet.id,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'] || null,
        latitude,
        longitude,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Escaneo registrado',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadisticas de escaneos de una mascota
 * GET /api/v1/pets/:slug/scans
 */
export async function getScanStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { slug } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    });

    if (!pet) {
      throw new NotFoundError('Mascota no encontrada');
    }

    if (pet.ownerId !== req.user.id) {
      throw new ForbiddenError('No tienes permiso para ver estas estadisticas');
    }

    const scans = await prisma.qRScan.findMany({
      where: { petId: pet.id },
      orderBy: { scannedAt: 'desc' },
      take: 50,
    });

    const totalScans = await prisma.qRScan.count({
      where: { petId: pet.id },
    });

    res.json({
      success: true,
      data: {
        total: totalScans,
        recentScans: scans,
      },
    });
  } catch (error) {
    next(error);
  }
}
