# ✅ Implementación de QR con Logo - Resumen

## 🎯 Funcionalidad Implementada

Los códigos QR ahora pueden incluir un **logo personalizado** en el centro.

## 📦 Dependencias Instaladas

```bash
npm install canvas
```

## 📁 Archivos Creados

1. **`src/lib/qrcode.ts`** - Librería completa para generar QR con logo
2. **`public/`** - Directorio para el logo predeterminado
3. **`public/README.md`** - Instrucciones para el logo
4. **`docs/QR_WITH_LOGO.md`** - Documentación completa
5. **`test-qr.js`** - Script de prueba

## 🔧 Archivos Modificados

1. **`src/controllers/petController.ts`** - Usa la nueva función de QR
2. **`package.json`** - Agregado script `test:qr`
3. **`.gitignore`** - Excluye archivos de prueba
4. **`README.md`** - Actualizado con la nueva funcionalidad

## 🎨 Características

- ✅ **Logo centrado** con fondo blanco redondeado
- ✅ **Bordes redondeados** personalizables
- ✅ **Tamaño ajustable** (20% del QR por defecto)
- ✅ **Alto nivel de corrección** (H - 30%) para soportar logos
- ✅ **Fallback automático** si hay error al cargar logo
- ✅ **Logo predeterminado** desde `public/logo-qr.png`
- ✅ **Logos personalizados** por URL o path

## 🚀 Cómo Usar

### Opción 1: Logo Predeterminado (Recomendado)

1. Coloca tu logo en `public/logo-qr.png`
   - Formato: PNG con transparencia
   - Tamaño: 500x500px o mayor
   
2. Todos los QR se generarán automáticamente con este logo

### Opción 2: Sin Logo

Si no existe `public/logo-qr.png`, los QR se generan sin logo (como antes)

### Opción 3: Logo Personalizado

```typescript
import { generateQRCodeWithLogo } from '../lib/qrcode.js';

const qr = await generateQRCodeWithLogo('https://meeko.pet/firulais', {
  width: 500,
  logo: {
    url: 'https://mi-logo.com/logo.png',
    size: 100,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 10,
  }
});
```

## 🧪 Probar la Funcionalidad

```bash
npm run test:qr
```

Esto genera 3 archivos de prueba:
- `test-qr-simple.txt` - QR sin logo
- `test-qr-with-logo.txt` - QR con logo predeterminado
- `test-qr-custom-logo.txt` - QR con logo desde URL

Para ver los QR:
1. Abre cualquier `.txt`
2. Copia todo el contenido
3. Pégalo en la barra del navegador
4. ¡Verás el QR con logo!

## 🎯 Endpoints Actualizados

Todos los endpoints que generan QR ahora soportan logos:

- `POST /api/v1/pets` - Crea mascota con QR con logo
- `GET /api/v1/pets/:slug/qr` - Obtiene QR con logo
- `PATCH /api/v1/pets/:slug` - Regenera QR con logo si es necesario

## 📐 Especificaciones del Logo

### Tamaño Recomendado
- **500x500px** o mayor
- Mínimo: 200x200px
- Se redimensiona automáticamente a 100px en QR de 500px

### Formato
- **PNG** con transparencia (ideal)
- **JPG** con fondo blanco
- **SVG** no soportado

### Diseño
- ✅ Simple y reconocible
- ✅ Buen contraste
- ✅ Forma cuadrada o circular
- ❌ Evitar detalles finos
- ❌ Evitar texto pequeño

## 🔍 Nivel de Corrección de Errores

**Configurado en H (30%)** para soportar logos grandes sin perder escaneabilidad.

| Nivel | Recuperación | Uso |
|-------|--------------|-----|
| L | 7% | Sin logo |
| M | 15% | Logo pequeño |
| Q | 25% | Logo mediano |
| **H** | **30%** | **Logo grande (usado)** |

## 💡 Ejemplo Práctico

```bash
# 1. Descarga o crea tu logo
# 2. Guárdalo como public/logo-qr.png
# 3. Reinicia el servidor
npm run dev

# 4. Crea una mascota
curl -X POST http://localhost:3000/api/v1/pets \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Firulais",
    "especie": "Perro",
    "raza": "Labrador",
    "edad": "3 años",
    "descripcion": "Muy amigable"
  }'

# 5. El QR incluirá tu logo automáticamente
curl http://localhost:3000/api/v1/pets/firulais-abc123/qr
```

## 🎨 Personalización Avanzada

### Colores Personalizados
```typescript
const qr = await generateQRCodeWithLogo(url, {
  darkColor: '#FF6B35',
  lightColor: '#F7F7F7',
  logo: {
    backgroundColor: '#FF6B35',
  }
});
```

### Logo Circular
```typescript
logo: {
  borderRadius: 50, // 50% = círculo
}
```

### Sin Fondo en Logo
```typescript
logo: {
  backgroundColor: 'transparent',
  padding: 0,
}
```

## 📊 Ventajas

1. **Mayor Branding** - Tu logo en cada QR
2. **Profesionalismo** - QR más atractivos visualmente
3. **Reconocimiento** - Usuarios identifican tu marca
4. **Confianza** - QR oficiales de tu app
5. **Personalización** - Diferentes logos por mascota (opcional)

## ⚠️ Consideraciones

- El logo debe ser **simple** para mantener escaneabilidad
- Máximo **30% del tamaño** del QR
- Usar **alto contraste** entre logo y QR
- Probar escaneo en diferentes apps/dispositivos

## 🔄 Compatibilidad

✅ Compatible con todos los lectores de QR estándar
✅ Funciona en iOS y Android
✅ Soporta apps: Cámara nativa, Google Lens, etc.

## 📚 Documentación Completa

Ver [`docs/QR_WITH_LOGO.md`](./QR_WITH_LOGO.md) para más detalles.
