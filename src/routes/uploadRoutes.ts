import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle } from '../lib/upload.js';
import { uploadImage, uploadPetImage, uploadAvatar } from '../controllers/uploadController.js';

const router = Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Subir una imagen
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: No se proporcionó imagen
 *       401:
 *         description: No autenticado
 */
router.post('/', authenticate, uploadSingle, uploadImage);

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Subir avatar de usuario
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar actualizado
 *       401:
 *         description: No autenticado
 */
router.post('/avatar', authenticate, uploadSingle, uploadAvatar);

/**
 * @swagger
 * /pets/{slug}/upload:
 *   post:
 *     summary: Subir imagen de mascota
 *     tags: [Upload]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [main, gallery]
 *                 description: Tipo de imagen (main = foto principal, gallery = galería)
 *     responses:
 *       200:
 *         description: Imagen subida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mascota no encontrada
 */
router.post('/pet/:slug', authenticate, uploadSingle, uploadPetImage);

export default router;
