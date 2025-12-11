# 🎨 Códigos QR con Logo

## ✅ Implementación Completada

Los códigos QR ahora pueden incluir un logo/imagen en el centro.

## 🎯 Características

- ✅ Logo centrado en el QR
- ✅ Fondo blanco redondeado para mejor contraste
- ✅ Bordes redondeados personalizables
- ✅ Tamaño de logo ajustable (20% del QR por defecto)
- ✅ Alto nivel de corrección de errores (H) para soportar logos
- ✅ Fallback a QR sin logo si hay error

## 📦 Uso

### 1. QR con Logo Predeterminado

Coloca tu logo en `public/logo-qr.png` (PNG recomendado, 500x500px idealmente)

Los QR se generarán automáticamente con este logo:

```typescript
// Automáticamente usa public/logo-qr.png si existe
const qrCode = await generateQRCode(petSlug);
```

### 2. QR con Logo Personalizado

```typescript
import { generateQRCodeWithLogo } from '../lib/qrcode.js';

const qrCode = await generateQRCodeWithLogo('https://meeko.pet/firulais', {
  width: 500,
  margin: 2,
  darkColor: '#000000',
  lightColor: '#FFFFFF',
  errorCorrectionLevel: 'H',
  logo: {
    url: '/path/to/logo.png',  // Puede ser URL o path local
    size: 100,                  // Tamaño del logo en px
    borderRadius: 12,           // Bordes redondeados
    backgroundColor: '#FFFFFF', // Fondo detrás del logo
    padding: 10,                // Espacio alrededor del logo
  }
});
```

### 3. QR Simple (Sin Logo)

```typescript
import { generateSimpleQRCode } from '../lib/qrcode.js';

const qrCode = await generateSimpleQRCode('https://meeko.pet/firulais', 400);
```

## 🎨 Recomendaciones para el Logo

### Tamaño
- **Óptimo:** 500x500px o mayor
- **Mínimo:** 200x200px
- El logo se redimensionará automáticamente

### Formato
- **PNG** con fondo transparente (recomendado)
- **JPG** con fondo blanco
- **SVG** no soportado (convertir a PNG primero)

### Diseño
- ✅ Logo simple y reconocible
- ✅ Buen contraste con el fondo
- ✅ Preferible forma cuadrada o circular
- ❌ Evitar detalles muy finos
- ❌ Evitar texto muy pequeño

### Tamaño en QR
- Por defecto: 20% del tamaño del QR (100px en QR de 500px)
- Máximo recomendado: 30% (para mantener escaneabilidad)
- Con error correction 'H', se puede usar hasta 30%

## 📐 Niveles de Corrección de Errores

| Nivel | Recuperación | Recomendado para |
|-------|--------------|------------------|
| L | ~7% | QR sin logo |
| M | ~15% | Logo muy pequeño |
| Q | ~25% | Logo mediano (recomendado) |
| H | ~30% | Logo grande |

**Usado por defecto:** `H` (30%) para máxima compatibilidad con logos

## 🖼️ Configurar Logo Predeterminado

1. Crea o descarga tu logo (formato PNG, 500x500px)
2. Guárdalo como `public/logo-qr.png`
3. Reinicia el servidor

Todos los QR nuevos se generarán con este logo automáticamente.

## 🔧 Personalización Avanzada

### Cambiar Colores del QR

```typescript
const qrCode = await generateQRCodeWithLogo(url, {
  darkColor: '#FF6B35',    // Color de los módulos
  lightColor: '#F7F7F7',   // Color de fondo
  logo: {
    backgroundColor: '#FF6B35', // Fondo del logo
    // ...
  }
});
```

### Logo Circular

```typescript
logo: {
  borderRadius: 50, // 50% = círculo perfecto
  // ...
}
```

### Logo Sin Fondo

```typescript
logo: {
  backgroundColor: 'transparent',
  padding: 0,
  // ...
}
```

## 🧪 Testing

```bash
# Probar generación de QR
npm run dev

# En otra terminal o Postman
curl http://localhost:3000/api/v1/pets/firulais-abc123/qr
```

El QR retornado será un data URL que puedes pegar en el navegador.

## 📊 Ejemplo Visual

```
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓ ▓▓  ▓ ▓▓▓▓▓▓▓ │
│ ▓     ▓ ▓▓▓▓▓ ▓     ▓ │
│ ▓ ▓▓▓ ▓  ▓ ▓  ▓ ▓▓▓ ▓ │
│ ▓ ▓▓▓ ▓ ▓▓ ▓▓ ▓ ▓▓▓ ▓ │
│ ▓     ▓ ┌─────┐     ▓ │
│ ▓▓▓▓▓▓▓ │LOGO │▓▓▓▓▓▓▓ │
│         │     │        │
│ ▓▓ ▓ ▓▓ └─────┘ ▓▓ ▓▓  │
│ ▓ ▓▓▓ ▓  ▓▓ ▓  ▓ ▓▓▓  │
│ ▓     ▓ ▓ ▓▓▓▓ ▓   ▓  │
│ ▓▓▓▓▓▓▓ ▓  ▓ ▓ ▓▓▓▓▓▓ │
└─────────────────────────────┘
```

## 🚀 API Endpoints

Los endpoints existentes ahora soportan logos automáticamente:

### GET `/api/v1/pets/:slug/qr`
Retorna QR con logo (si existe `public/logo-qr.png`)

### POST `/api/v1/pets`
Crea mascota y genera QR con logo automáticamente

### Todos los QR incluirán el logo si está configurado

## ⚠️ Troubleshooting

### El logo no aparece
1. Verifica que `public/logo-qr.png` existe
2. Verifica permisos de lectura del archivo
3. Revisa la consola del servidor para errores
4. Si hay error, se genera QR sin logo (fallback)

### QR no escanea correctamente
1. Reduce el tamaño del logo (menos de 30%)
2. Usa error correction 'H'
3. Aumenta el margin del QR
4. Simplifica el diseño del logo

### Logo se ve pixelado
1. Usa logo de mayor resolución (500x500px mínimo)
2. Aumenta el `width` del QR (hasta 1000px)

## 📚 Recursos

- [QRCode.js Documentation](https://github.com/soldair/node-qrcode)
- [Canvas API](https://github.com/Automattic/node-canvas)
- [QR Error Correction Levels](https://www.qrcode.com/en/about/error_correction.html)
