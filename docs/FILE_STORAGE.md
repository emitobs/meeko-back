# 📦 Gestión de Archivos - S3 vs Local

## Configuración Actual

El sistema soporta **dos modos de almacenamiento**:

### 🖥️ Modo Local (Por defecto)
```env
USE_S3=false
```
- ✅ Sin costos
- ✅ Sin configuración adicional
- ✅ Ideal para desarrollo
- ❌ Los archivos se pierden al escalar horizontalmente
- ❌ Sin CDN

### ☁️ Modo S3
```env
USE_S3=true
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
```
- ✅ Escalable
- ✅ Capa gratuita (5GB, 20K GET, 2K PUT/mes)
- ✅ Puede usar CloudFront CDN
- ✅ Persistente entre deploys
- ❌ Requiere configuración

---

## 🔄 Cambio Automático

El sistema detecta automáticamente el modo basado en `USE_S3`:

```typescript
// src/lib/upload.ts
export const uploadSingle = config.upload.useS3 
  ? s3Single 
  : uploadLocal.single('image');
```

No necesitas cambiar código, solo la variable de entorno.

---

## 📋 Endpoints de Upload

Todos los endpoints funcionan igual en ambos modos:

### 1. Upload General
```bash
POST /api/v1/upload
Content-Type: multipart/form-data

{
  "image": <archivo>
}
```

**Respuesta Local:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/uuid.jpg"
  }
}
```

**Respuesta S3:**
```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.region.amazonaws.com/uploads/timestamp-random.jpg"
  }
}
```

### 2. Upload Avatar
```bash
POST /api/v1/upload/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": <archivo>
}
```

### 3. Upload Foto de Mascota
```bash
POST /api/v1/upload/pet/:slug
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": <archivo>,
  "type": "main" | "gallery"
}
```

---

## 🗑️ Eliminación de Archivos

El sistema elimina automáticamente archivos antiguos cuando se reemplazan:

### Modo Local
```typescript
await fs.unlink(filePath);
```

### Modo S3
```typescript
await s3Client.send(new DeleteObjectCommand({
  Bucket: config.aws.bucketName,
  Key: key
}));
```

---

## 🚀 Migración de Local a S3

Si ya tienes archivos en almacenamiento local y quieres migrar a S3:

### Opción 1: Migración Manual

```bash
# 1. Instala AWS CLI
# https://aws.amazon.com/cli/

# 2. Configura credenciales
aws configure

# 3. Sincroniza archivos
aws s3 sync ./uploads s3://tu-bucket/uploads/
```

### Opción 2: Script de Migración

Crea un script en `scripts/migrate-to-s3.ts`:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function migrateFiles() {
  const uploadsDir = './uploads';
  const files = await fs.readdir(uploadsDir);
  
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const fileContent = await fs.readFile(filePath);
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `uploads/${file}`,
      Body: fileContent,
      ContentType: 'image/jpeg', // Ajustar según tipo
    }));
    
    console.log(`✅ Migrado: ${file}`);
  }
}

migrateFiles();
```

Después de migrar:
1. Actualiza las URLs en la base de datos
2. Cambia `USE_S3=true` en `.env`
3. Reinicia el servidor

---

## 📊 Comparación de Costos

### Almacenamiento Local

| Concepto | Costo |
|----------|-------|
| Almacenamiento | $0 (usa tu servidor) |
| Transferencia | $0 |
| Total/mes | **$0** |

**Limitaciones:**
- Escala vertical limitada
- Sin CDN (más lento para usuarios lejanos)
- Se pierde en deploys sin volúmenes persistentes

### AWS S3 (Capa Gratuita - 12 meses)

| Concepto | Límite Gratuito | Después |
|----------|----------------|---------|
| Almacenamiento | 5 GB | $0.023/GB/mes |
| PUT requests | 2,000/mes | $0.005/1000 |
| GET requests | 20,000/mes | $0.0004/1000 |
| Transferencia | 100 GB/mes | $0.09/GB |

**Ejemplo:** App con 1000 usuarios activos/mes:
- ~500 MB de imágenes = **$0**
- ~1,500 uploads = **$0**
- ~15,000 vistas = **$0**
- Total: **$0/mes** (dentro de capa gratuita)

---

## 🔒 Seguridad

### Modo Local
```typescript
// Validación de tipo de archivo
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Límite de tamaño
maxFileSize: 5MB
```

### Modo S3
```typescript
// Mismas validaciones + políticas de bucket
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::bucket/*"
}
```

**Recomendaciones:**
- ✅ Validar siempre el tipo de archivo en el backend
- ✅ Usar límites de tamaño
- ✅ Sanitizar nombres de archivo
- ✅ No confiar en la extensión del archivo
- ✅ Escanear archivos para virus en producción

---

## 🐛 Troubleshooting

### Error: "Tipo de archivo no permitido"
**Solución:** Solo se permiten: JPG, PNG, GIF, WEBP

### Error: "File too large"
**Solución:** Máximo 5MB. Comprime la imagen antes de subir.

### Error (S3): "Access Denied"
**Solución:** 
1. Verifica credenciales en `.env`
2. Verifica política del bucket
3. Verifica permisos del usuario IAM

### Error (S3): "NoSuchBucket"
**Solución:** Verifica que `AWS_BUCKET_NAME` esté correcto

### Error (Local): "ENOENT: no such file or directory"
**Solución:** Asegúrate de que el directorio `uploads/` existe

---

## 📈 Monitoreo

### Modo Local
```bash
# Ver tamaño de uploads
du -sh uploads/

# Contar archivos
ls uploads/ | wc -l
```

### Modo S3
```bash
# AWS CLI
aws s3 ls s3://tu-bucket/uploads/ --recursive --summarize

# O usa la consola de AWS
https://console.aws.amazon.com/s3/
```

---

## 🎯 Mejores Prácticas

1. **Desarrollo:** Usa modo local
2. **Staging/QA:** Usa S3 con bucket separado
3. **Producción:** Usa S3 + CloudFront
4. **Compresión:** Optimiza imágenes antes de subir
5. **Backup:** Habilita versionado en S3
6. **Monitoreo:** Configura alertas de costos en AWS

---

## 🔮 Futuras Mejoras

- [ ] Redimensionamiento automático de imágenes
- [ ] Conversión a WebP automática
- [ ] Caché de imágenes con CloudFront
- [ ] Upload directo desde cliente (signed URLs)
- [ ] Procesamiento en background (Lambda)
- [ ] Múltiples regiones S3
