import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createPetSchema, updatePetSchema, qrScanSchema } from '../validations/schemas.js';
import {
  getAllPets,
  getPetBySlug,
  getMyPets,
  createPet,
  updatePet,
  deletePet,
  getQRCode,
  recordScan,
  getScanStats,
} from '../controllers/petController.js';

const router = Router();

/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Listar todas las mascotas
 *     tags: [Pets]
 *     parameters:
 *       - in: query
 *         name: especie
 *         schema:
 *           type: string
 *         description: Filtrar por especie
 *       - in: query
 *         name: isLost
 *         schema:
 *           type: boolean
 *         description: Filtrar mascotas perdidas
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de mascotas
 */
router.get('/', getAllPets);

/**
 * @swagger
 * /pets/my-pets:
 *   get:
 *     summary: Listar mascotas del usuario autenticado
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mascotas del usuario
 *       401:
 *         description: No autenticado
 */
router.get('/my-pets', authenticate, getMyPets);

/**
 * @swagger
 * /pets/{slug}:
 *   get:
 *     summary: Obtener mascota por slug
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único de la mascota
 *     responses:
 *       200:
 *         description: Información de la mascota
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/:slug', optionalAuth, getPetBySlug);

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Crear nueva mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - especie
 *               - raza
 *               - edad
 *               - descripcion
 *             properties:
 *               nombre:
 *                 type: string
 *               especie:
 *                 type: string
 *               raza:
 *                 type: string
 *               edad:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               indicaciones:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               fotoPrincipal:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Mascota creada
 *       401:
 *         description: No autenticado
 */
router.post('/', authenticate, validateBody(createPetSchema), createPet);

/**
 * @swagger
 * /pets/{slug}:
 *   patch:
 *     summary: Actualizar mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               especie:
 *                 type: string
 *               raza:
 *                 type: string
 *               edad:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               indicaciones:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               fotoPrincipal:
 *                 type: string
 *               isLost:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Mascota actualizada
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mascota no encontrada
 */
router.patch('/:slug', authenticate, validateBody(updatePetSchema), updatePet);

/**
 * @swagger
 * /pets/{slug}:
 *   delete:
 *     summary: Eliminar mascota
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mascota eliminada
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mascota no encontrada
 */
router.delete('/:slug', authenticate, deletePet);

/**
 * @swagger
 * /pets/{slug}/qr:
 *   get:
 *     summary: Obtener código QR de la mascota
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Código QR en formato base64
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/:slug/qr', getQRCode);

/**
 * @swagger
 * /pets/{slug}/scan:
 *   post:
 *     summary: Registrar escaneo de QR
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Escaneo registrado
 *       404:
 *         description: Mascota no encontrada
 */
router.post('/:slug/scan', validateBody(qrScanSchema), recordScan);

/**
 * @swagger
 * /pets/{slug}/scans:
 *   get:
 *     summary: Obtener estadísticas de escaneos
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas de escaneos
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/:slug/scans', authenticate, getScanStats);

export default router;
