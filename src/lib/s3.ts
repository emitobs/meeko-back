import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../config/index.js';

/**
 * Cliente S3 configurado
 */
export const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

/**
 * Generar nombre de archivo único para S3
 */
export function generateS3Key(folder: string, filename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop();
  return `${folder}/${timestamp}-${randomString}.${extension}`;
}

/**
 * Obtener URL pública de un objeto S3
 */
export function getS3Url(key: string): string {
  if (config.aws.cloudFrontUrl) {
    return `${config.aws.cloudFrontUrl}/${key}`;
  }
  return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
}
