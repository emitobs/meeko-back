import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import { uploadS3Single as s3Single, uploadS3Multiple as s3Multiple } from './uploadS3.js';

// Configurar almacenamiento local
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// Filtrar tipos de archivo
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = config.upload.allowedMimeTypes as readonly string[];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Tipo de archivo no permitido. Solo se permiten imágenes.'));
  }
};

// Crear instancia de multer para almacenamiento local
const uploadLocal = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// Exportar middleware según configuración (S3 o local)
export const uploadSingle = config.upload.useS3 ? s3Single : uploadLocal.single('image');
export const uploadMultiple = config.upload.useS3 ? s3Multiple : uploadLocal.array('images', 10);
