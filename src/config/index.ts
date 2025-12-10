import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Servidor
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Base de datos
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4321',
  
  // API
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  
  // Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    useS3: process.env.USE_S3 === 'true',
  },
  
  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME || '',
    cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL || '',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
  },
} as const;

export type Config = typeof config;
