import multer from 'multer';
import multerS3 from 'multer-s3';
import type { Request } from 'express';
import { config } from '../config/index.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import { s3Client, generateS3Key } from './s3.js';

// Filtrar tipos de archivo
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = config.upload.allowedMimeTypes as readonly string[];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Tipo de archivo no permitido. Solo se permiten imágenes.'));
  }
};

// Configuración para S3
const s3Storage = multerS3({
  s3: s3Client,
  bucket: config.aws.bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (_req: Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
    cb(null, { 
      fieldName: file.fieldname,
      originalName: file.originalname,
    });
  },
  key: (_req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
    const key = generateS3Key('uploads', file.originalname);
    cb(null, key);
  },
});

// Crear instancia de multer para S3
export const uploadS3 = multer({
  storage: s3Storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Middleware para subir una sola imagen a S3
export const uploadS3Single = uploadS3.single('image');

// Middleware para subir múltiples imágenes a S3
export const uploadS3Multiple = uploadS3.array('images', 10);
