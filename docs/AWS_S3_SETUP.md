# 🪣 Configuración de AWS S3 - Capa Gratuita

Esta guía te ayudará a configurar AWS S3 para almacenar las imágenes de tu aplicación PetQR usando la **capa gratuita de AWS**.

---

## 🎁 Capa Gratuita de AWS S3

La capa gratuita de AWS S3 incluye (durante los primeros 12 meses):

- ✅ **5 GB** de almacenamiento estándar
- ✅ **20,000 solicitudes GET** por mes
- ✅ **2,000 solicitudes PUT** por mes
- ✅ **100 GB** de transferencia de datos salientes

Después de 12 meses, S3 sigue siendo muy económico (~$0.023 por GB/mes).

---

## 📋 Pasos para Configurar S3

### 1. Crear una Cuenta de AWS

1. Ve a [aws.amazon.com](https://aws.amazon.com/)
2. Click en **"Crear una cuenta de AWS"**
3. Completa el proceso de registro (necesitarás una tarjeta de crédito, pero no te cobrarán si te mantienes en la capa gratuita)

### 2. Crear un Bucket S3

1. Inicia sesión en la [Consola de AWS](https://console.aws.amazon.com/)
2. Busca **"S3"** en la barra de búsqueda y selecciónalo
3. Click en **"Crear bucket"**
4. Configuración del bucket:
   - **Nombre del bucket**: `petqr-uploads` (debe ser único globalmente)
   - **Región**: Selecciona la más cercana a tus usuarios (ej: `us-east-1`)
   - **Bloquear todo el acceso público**: **Desactiva** esta opción
   - Marca la casilla de confirmación que aparece
5. Click en **"Crear bucket"**

### 3. Configurar Permisos del Bucket

1. Abre tu bucket recién creado
2. Ve a la pestaña **"Permisos"**
3. En **"Política de bucket"**, click en **"Editar"**
4. Pega la siguiente política JSON (reemplaza `petqr-uploads` con tu nombre de bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::petqr-uploads/*"
    }
  ]
}
```

5. Click en **"Guardar cambios"**

### 4. Configurar CORS

1. En la pestaña **"Permisos"** del bucket
2. Scroll hasta **"Uso compartido de recursos entre orígenes (CORS)"**
3. Click en **"Editar"**
4. Pega la siguiente configuración:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

5. Click en **"Guardar cambios"**

### 5. Crear Usuario IAM con Permisos S3

1. Busca **"IAM"** en la consola de AWS
2. En el menú lateral, click en **"Usuarios"**
3. Click en **"Crear usuario"**
4. Nombre de usuario: `petqr-s3-uploader`
5. Click en **"Siguiente"**
6. Selecciona **"Adjuntar políticas directamente"**
7. Busca y selecciona **"AmazonS3FullAccess"** (o crea una política personalizada más restrictiva)
8. Click en **"Siguiente"** y luego **"Crear usuario"**

### 6. Generar Credenciales de Acceso

1. Click en el usuario recién creado
2. Ve a la pestaña **"Credenciales de seguridad"**
3. En **"Claves de acceso"**, click en **"Crear clave de acceso"**
4. Selecciona **"Aplicación que se ejecuta fuera de AWS"**
5. Click en **"Siguiente"** y luego **"Crear clave de acceso"**
6. **⚠️ IMPORTANTE**: Guarda el **Access Key ID** y **Secret Access Key** (solo se muestra una vez)

---

## ⚙️ Configurar el Backend

1. Abre el archivo `.env` en tu proyecto
2. Configura las siguientes variables:

```env
# Activar S3
USE_S3=true

# Credenciales de AWS
AWS_ACCESS_KEY_ID=tu_access_key_id_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
AWS_REGION=us-east-1
AWS_BUCKET_NAME=petqr-uploads

# Opcional: CloudFront URL (si lo configuras más adelante)
AWS_CLOUDFRONT_URL=
```

3. Reinicia tu servidor:

```bash
npm run dev
```

---

## 🧪 Probar la Integración

1. Inicia sesión en tu aplicación
2. Intenta subir una imagen (avatar o foto de mascota)
3. Verifica que la imagen se haya subido correctamente
4. La URL debería verse así:
   ```
   https://petqr-uploads.s3.us-east-1.amazonaws.com/uploads/1234567890-abc123.jpg
   ```

---

## 🚀 Optimización con CloudFront (Opcional)

CloudFront es la CDN de AWS que mejora la velocidad de entrega de archivos. **También tiene capa gratuita**:

- ✅ **1 TB** de transferencia de datos salientes por mes
- ✅ **10,000,000 solicitudes HTTP/HTTPS** por mes

### Configurar CloudFront:

1. Ve a la consola de **CloudFront**
2. Click en **"Crear distribución"**
3. Configuración:
   - **Origin domain**: Selecciona tu bucket S3
   - **Origin access**: Origin access control settings (recommended)
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
4. Click en **"Crear distribución"**
5. Espera 10-15 minutos a que se despliegue
6. Copia el **Domain name** (ej: `d111111abcdef8.cloudfront.net`)
7. Actualiza tu `.env`:

```env
AWS_CLOUDFRONT_URL=https://d111111abcdef8.cloudfront.net
```

---

## 📊 Monitorear Uso de Capa Gratuita

1. Ve a la [Consola de facturación de AWS](https://console.aws.amazon.com/billing/)
2. En el menú lateral, click en **"Capa gratuita"**
3. Aquí puedes ver cuánto has usado de tu capa gratuita

---

## 💡 Consejos para Mantenerse en la Capa Gratuita

1. **Optimiza imágenes antes de subirlas** (usa compresión)
2. **Establece políticas de ciclo de vida** para eliminar archivos antiguos
3. **Monitorea tu uso** regularmente
4. **Establece alarmas de facturación** en AWS Budgets

---

## 🔄 Volver a Almacenamiento Local

Si prefieres usar almacenamiento local en lugar de S3:

```env
USE_S3=false
```

El sistema cambiará automáticamente a almacenamiento en el servidor.

---

## 🔒 Seguridad

**⚠️ IMPORTANTE:**

- **Nunca** compartas tus credenciales de AWS
- **Nunca** subas el archivo `.env` a Git
- Añade `.env` a tu `.gitignore`
- Considera usar **AWS Secrets Manager** para producción
- Rota tus credenciales regularmente

---

## ❓ Solución de Problemas

### Error: "Access Denied"
- Verifica que la política del bucket esté configurada correctamente
- Asegúrate de que el usuario IAM tenga permisos S3

### Error: "Region not found"
- Verifica que `AWS_REGION` coincida con la región de tu bucket

### Las imágenes no cargan
- Verifica la política de bucket (debe permitir `GetObject` público)
- Revisa la configuración CORS

### Errores de credenciales
- Verifica que `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` sean correctos
- Asegúrate de no tener espacios extra en las variables de entorno

---

## 📚 Recursos Adicionales

- [Documentación de AWS S3](https://docs.aws.amazon.com/s3/)
- [Calculadora de precios de S3](https://calculator.aws/)
- [Prácticas recomendadas de seguridad S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
