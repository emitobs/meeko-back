# 🐾 PetQR API - Documentación Completa

> **Base URL:** `http://localhost:3000/api/v1`  
> **Swagger UI:** `http://localhost:3000/api-docs`

---

## 📋 Índice

1. [Autenticación](#-autenticación)
2. [Mascotas](#-mascotas)
3. [Fotos](#-fotos)
4. [Upload](#-upload)
5. [Códigos de Error](#-códigos-de-error)
6. [Ejemplos de Uso](#-ejemplos-de-uso)

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <access_token>
```

### POST `/auth/register`

Registrar un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "nombre": "Juan Pérez",
  "telefono": "+52 123 456 7890",
  "whatsapp": "+52 123 456 7890",
  "instagram": "@juanperez",
  "facebook": "juanperez"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan Pérez",
      "telefono": "+52 123 456 7890",
      "whatsapp": "+52 123 456 7890",
      "instagram": "@juanperez",
      "facebook": "juanperez",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/login`

Iniciar sesión.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan Pérez"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/logout`

Cerrar sesión (invalida el refresh token).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### GET `/auth/me`

Obtener perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "telefono": "+52 123 456 7890",
    "whatsapp": "+52 123 456 7890",
    "instagram": "@juanperez",
    "facebook": "juanperez",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "pets": 3
    }
  }
}
```

---

### PATCH `/auth/me`

Actualizar perfil del usuario.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "Juan Pérez García",
  "telefono": "+52 999 888 7777",
  "whatsapp": "+52 999 888 7777",
  "instagram": "@juanperezg",
  "facebook": "juanperezgarcia"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado",
  "data": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez García",
    "telefono": "+52 999 888 7777"
  }
}
```

---

### POST `/auth/change-password`

Cambiar contraseña.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### POST `/auth/refresh`

Renovar access token usando refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🐕 Mascotas

### GET `/pets`

Listar todas las mascotas (público).

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `especie` | string | Filtrar por especie (Perro, Gato, etc.) |
| `isLost` | boolean | Filtrar mascotas perdidas |
| `limit` | number | Límite de resultados (default: 20) |
| `offset` | number | Offset para paginación (default: 0) |

**Ejemplo:** `GET /pets?especie=Perro&isLost=true&limit=10`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "firulais-abc12345",
      "nombre": "Firulais",
      "especie": "Perro",
      "raza": "Labrador",
      "edad": "3 años",
      "descripcion": "Perro amigable y juguetón",
      "indicaciones": "Le gusta que le rasquen las orejas",
      "fotoPrincipal": "http://localhost:3000/uploads/firulais.jpg",
      "ubicacion": "Ciudad de México",
      "isLost": false,
      "owner": {
        "id": "uuid",
        "nombre": "Juan Pérez",
        "telefono": "+52 123 456 7890",
        "whatsapp": "+52 123 456 7890"
      },
      "fotos": [],
      "_count": {
        "scans": 15
      }
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET `/pets/my-pets`

Listar mascotas del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "firulais-abc12345",
      "nombre": "Firulais",
      "especie": "Perro",
      "raza": "Labrador",
      "qrCode": "data:image/png;base64,...",
      "_count": {
        "scans": 15,
        "fotos": 3
      }
    }
  ]
}
```

---

### GET `/pets/:slug`

Obtener mascota por slug.

**Ejemplo:** `GET /pets/firulais-abc12345`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "firulais-abc12345",
    "nombre": "Firulais",
    "especie": "Perro",
    "raza": "Labrador",
    "edad": "3 años",
    "descripcion": "Perro amigable y juguetón",
    "indicaciones": "Le gusta que le rasquen las orejas",
    "fotoPrincipal": "http://localhost:3000/uploads/firulais.jpg",
    "ubicacion": "Ciudad de México",
    "isLost": false,
    "lostAt": null,
    "foundAt": null,
    "owner": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "telefono": "+52 123 456 7890",
      "whatsapp": "+52 123 456 7890",
      "instagram": "@juanperez",
      "facebook": "juanperez"
    },
    "fotos": [
      {
        "id": "uuid",
        "url": "http://localhost:3000/uploads/foto1.jpg",
        "caption": "En el parque",
        "orden": 0
      }
    ],
    "_count": {
      "scans": 15
    }
  }
}
```

---

### POST `/pets`

Crear nueva mascota.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "Firulais",
  "especie": "Perro",
  "raza": "Labrador",
  "edad": "3 años",
  "descripcion": "Perro amigable y juguetón",
  "indicaciones": "Le gusta que le rasquen las orejas",
  "ubicacion": "Ciudad de México",
  "fotoPrincipal": "http://localhost:3000/uploads/firulais.jpg"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Mascota creada exitosamente",
  "data": {
    "id": "uuid",
    "slug": "firulais-abc12345",
    "nombre": "Firulais",
    "qrCode": "data:image/png;base64,..."
  }
}
```

---

### PATCH `/pets/:slug`

Actualizar mascota.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "Firulais Jr.",
  "edad": "4 años",
  "isLost": true
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Mascota actualizada",
  "data": {
    "id": "uuid",
    "slug": "firulais-abc12345",
    "nombre": "Firulais Jr.",
    "isLost": true,
    "lostAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### DELETE `/pets/:slug`

Eliminar mascota.

**Headers:** `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Mascota eliminada exitosamente"
}
```

---

### GET `/pets/:slug/qr`

Obtener código QR de la mascota.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "petUrl": "http://localhost:4321/firulais-abc12345"
  }
}
```

---

### POST `/pets/:slug/scan`

Registrar escaneo de QR (público).

**Body (opcional):**
```json
{
  "latitude": 19.4326,
  "longitude": -99.1332
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Escaneo registrado",
  "data": {
    "pet": {
      "nombre": "Firulais",
      "isLost": false
    }
  }
}
```

---

### GET `/pets/:slug/scans`

Obtener estadísticas de escaneos.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `days` | number | Últimos N días (default: 30) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "totalScans": 150,
    "scansInPeriod": 45,
    "recentScans": [
      {
        "id": "uuid",
        "ip": "192.168.1.1",
        "city": "Ciudad de México",
        "country": "México",
        "scannedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 📸 Fotos

### GET `/pets/:slug/photos`

Listar fotos de una mascota.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "http://localhost:3000/uploads/foto1.jpg",
      "caption": "En el parque",
      "orden": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/pets/:slug/photos`

Agregar foto a una mascota.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "url": "http://localhost:3000/uploads/nueva-foto.jpg",
  "caption": "Jugando en casa",
  "orden": 1
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Foto agregada exitosamente",
  "data": {
    "id": "uuid",
    "url": "http://localhost:3000/uploads/nueva-foto.jpg",
    "caption": "Jugando en casa",
    "orden": 1
  }
}
```

---

### PATCH `/pets/:slug/photos/:photoId`

Actualizar foto.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "caption": "Nueva descripción",
  "orden": 2
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Foto actualizada",
  "data": {
    "id": "uuid",
    "caption": "Nueva descripción",
    "orden": 2
  }
}
```

---

### DELETE `/pets/:slug/photos/:photoId`

Eliminar foto.

**Headers:** `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Foto eliminada exitosamente"
}
```

---

## 📤 Upload

### POST `/upload`

Subir una imagen general.

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `image`: archivo de imagen (jpg, png, gif, webp)

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "data": {
    "url": "http://localhost:3000/uploads/1705312200000-abc123.jpg",
    "filename": "1705312200000-abc123.jpg"
  }
}
```

---

### POST `/upload/avatar`

Subir avatar de usuario.

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `image`: archivo de imagen

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Avatar actualizado",
  "data": {
    "avatar": "http://localhost:3000/uploads/avatars/uuid.jpg"
  }
}
```

---

### POST `/upload/pet/:slug`

Subir imagen de mascota.

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `image`: archivo de imagen

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Imagen de mascota subida",
  "data": {
    "url": "http://localhost:3000/uploads/pets/slug-123.jpg"
  }
}
```

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| `400` | Bad Request - Error de validación |
| `401` | Unauthorized - Token inválido o no proporcionado |
| `403` | Forbidden - Sin permisos para esta acción |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Recurso ya existe (ej: email duplicado) |
| `429` | Too Many Requests - Rate limit excedido |
| `500` | Internal Server Error |

**Formato de error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

---

## 💡 Ejemplos de Uso

### Flujo completo: Registrar usuario y crear mascota

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "nombre": "Test User"
  }'

# 2. Guardar el accessToken de la respuesta

# 3. Crear mascota
curl -X POST http://localhost:3000/api/v1/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "nombre": "Max",
    "especie": "Perro",
    "raza": "Golden Retriever",
    "edad": "2 años",
    "descripcion": "Perro muy amigable"
  }'

# 4. Obtener QR de la mascota
curl http://localhost:3000/api/v1/pets/max-abc12345/qr
```

---

## 🔧 Health Check

### GET `/health`

Verificar estado de la API.

**Respuesta:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
