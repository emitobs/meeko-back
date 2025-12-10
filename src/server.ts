import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { swaggerSpec } from './lib/swagger.js';
import { disconnectPrisma } from './lib/prisma.js';

// Crear aplicación Express
const app = express();

// ================================
// MIDDLEWARES GLOBALES
// ================================

// Helmet para seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// CORS - Configuración mejorada
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      config.frontendUrl,
      'https://meeko.pet',
      'https://www.meeko.pet',
      // Permitir desarrollo local incluso en producción
      'http://localhost:4321',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:4321',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ];
    
    // Permitir solicitudes sin origin (como Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
  },
});
app.use(limiter);

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads) con CORS
app.use('/uploads', cors(), express.static(config.upload.dir));

// ================================
// DOCUMENTACIÓN SWAGGER
// ================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PetQR API Docs',
}));

// ================================
// RUTAS DE LA API
// ================================
app.use(config.apiPrefix, routes);

// Ruta raíz
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🐾 PetQR API',
    version: '1.0.0',
    docs: '/api-docs',
    api: config.apiPrefix,
  });
});

// ================================
// MANEJO DE ERRORES
// ================================
app.use(notFoundHandler);
app.use(errorHandler);

// ================================
// INICIAR SERVIDOR
// ================================
const server = app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🐾 PetQR API Server                                     ║
║                                                           ║
║   URL:     http://localhost:${config.port}                       ║
║   API:     http://localhost:${config.port}${config.apiPrefix}           ║
║   Docs:    http://localhost:${config.port}/api-docs              ║
║   Mode:    ${config.nodeEnv.padEnd(11)}                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// ================================
// MANEJO DE SHUTDOWN
// ================================
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📴 ${signal} recibido. Cerrando servidor...`);
  
  server.close(async () => {
    console.log('🔌 Conexiones HTTP cerradas');
    await disconnectPrisma();
    console.log('🗄️ Conexión de base de datos cerrada');
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('⚠️ No se pudo cerrar graciosamente, forzando cierre');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
