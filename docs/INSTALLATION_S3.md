# Instrucciones de Instalación con S3

## Desarrollo Local (Sin S3)

Por defecto, el proyecto usa almacenamiento local. Solo necesitas:

```bash
npm install
npm run dev
```

## Desarrollo con S3

Si quieres usar S3 desde el inicio:

1. Instala las dependencias (ya incluyen AWS SDK):
```bash
npm install
```

2. Crea tu bucket S3 siguiendo la guía en `docs/AWS_S3_SETUP.md`

3. Configura tu archivo `.env`:
```env
USE_S3=true
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=tu-bucket-name
```

4. Inicia el servidor:
```bash
npm run dev
```

## Cambiar entre Local y S3

Solo necesitas cambiar una variable:

**Usar almacenamiento local:**
```env
USE_S3=false
```

**Usar S3:**
```env
USE_S3=true
```

El sistema cambiará automáticamente sin necesidad de reiniciar (solo al cambiar la variable necesitas reiniciar).
