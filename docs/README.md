# 🚀 Quick Start - AWS S3

## ⚡ TL;DR

### Continuar con almacenamiento local (sin cambios)
```bash
# Ya está configurado por defecto
npm run dev
```

### Activar AWS S3
```bash
# 1. Editar .env
USE_S3=true
AWS_ACCESS_KEY_ID=tu_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_aqui
AWS_BUCKET_NAME=tu-bucket-name

# 2. Reiniciar
npm run dev
```

## 📖 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| [`AWS_S3_SETUP.md`](./AWS_S3_SETUP.md) | 📝 Guía paso a paso para configurar AWS S3 |
| [`FILE_STORAGE.md`](./FILE_STORAGE.md) | 📊 Comparación local vs S3, costos, migración |
| [`S3_IMPLEMENTATION.md`](./S3_IMPLEMENTATION.md) | 🔧 Resumen técnico de cambios realizados |

## ✅ Verificación

### Local (por defecto)
```bash
curl -X POST http://localhost:3000/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@foto.jpg"

# Respuesta esperada:
{
  "url": "/uploads/uuid.jpg"
}
```

### S3 (después de configurar)
```bash
curl -X POST http://localhost:3000/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@foto.jpg"

# Respuesta esperada:
{
  "url": "https://bucket.s3.region.amazonaws.com/uploads/timestamp.jpg"
}
```

## 💰 Capa Gratuita AWS

✅ **12 meses gratis:**
- 5 GB almacenamiento
- 20,000 GET requests/mes
- 2,000 PUT requests/mes

## ❓ ¿Necesitas ayuda?

- 📖 Lee [`AWS_S3_SETUP.md`](./AWS_S3_SETUP.md) para setup completo
- 🐛 Problemas comunes en [`FILE_STORAGE.md`](./FILE_STORAGE.md)
- 💬 Abre un issue en GitHub
