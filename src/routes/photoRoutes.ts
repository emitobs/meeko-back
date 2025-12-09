import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { addPhotoSchema, updatePhotoSchema } from '../validations/schemas.js';
import {
  getPhotos,
  addPhoto,
  updatePhoto,
  deletePhoto,
} from '../controllers/photoController.js';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /pets/{slug}/photos:
 *   get:
 *     summary: Listar fotos de una mascota
 *     tags: [Photos]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de fotos
 *       404:
 *         description: Mascota no encontrada
 */
router.get('/', getPhotos);

/**
 * @swagger
 * /pets/{slug}/photos:
 *   post:
 *     summary: Agregar foto a una mascota
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               caption:
 *                 type: string
 *               orden:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Foto agregada
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mascota no encontrada
 */
router.post('/', authenticate, validateBody(addPhotoSchema), addPhoto);

/**
 * @swagger
 * /pets/{slug}/photos/{photoId}:
 *   patch:
 *     summary: Actualizar foto
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               orden:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Foto actualizada
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Foto no encontrada
 */
router.patch('/:photoId', authenticate, validateBody(updatePhotoSchema), updatePhoto);

/**
 * @swagger
 * /pets/{slug}/photos/{photoId}:
 *   delete:
 *     summary: Eliminar foto
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Foto eliminada
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Foto no encontrada
 */
router.delete('/:photoId', authenticate, deletePhoto);

export default router;
