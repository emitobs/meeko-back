import { Router } from 'express';
import authRoutes from './authRoutes.js';
import petRoutes from './petRoutes.js';
import photoRoutes from './photoRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de mascotas
router.use('/pets', petRoutes);

// Rutas de fotos (anidadas bajo pets)
router.use('/pets/:slug/photos', photoRoutes);

// Rutas de upload
router.use('/upload', uploadRoutes);

// Ruta de health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

export default router;
