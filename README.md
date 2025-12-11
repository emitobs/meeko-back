# 🐾 PetQR Backend API

Backend API REST para el sistema de identificación de mascotas por código QR.

## 🚀 Características

- **Autenticación JWT** - Registro, login y gestión de usuarios
- **CRUD de Mascotas** - Crear, leer, actualizar y eliminar mascotas
- **Generación de QR** - Códigos QR únicos para cada mascota **con logo personalizable**
- **Galería de Fotos** - Múltiples fotos por mascota
- **Upload de Imágenes** - Almacenamiento local o AWS S3
- **Estadísticas de Escaneos** - Seguimiento de cuándo y dónde se escanean los QR
- **Documentación Swagger** - API completamente documentada

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
cd meeko-backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/meeko_db?schema=public"
JWT_SECRET="tu-secreto-super-seguro"
PORT=3000
FRONTEND_URL="http://localhost:4321"
```

### 3. Configurar la base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar migraciones
npm run db:push

# Poblar con datos de ejemplo
npm run db:seed
```

### 4. Iniciar el servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start
```

### 5. (Opcional) Configurar AWS S3

Por defecto, las imágenes se guardan localmente. Para usar AWS S3 (capa gratuita):

1. Sigue la guía completa: [`docs/AWS_S3_SETUP.md`](./docs/AWS_S3_SETUP.md)
2. Configura las variables en `.env`:
```env
USE_S3=true
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_BUCKET_NAME=tu-bucket-name
```

## 📚 Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Registrar usuario |
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| GET | `/api/v1/auth/me` | Obtener perfil |
| PATCH | `/api/v1/auth/me` | Actualizar perfil |
| POST | `/api/v1/auth/change-password` | Cambiar contraseña |

### Mascotas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/pets` | Listar mascotas (público) |
| GET | `/api/v1/pets/my-pets` | Mis mascotas (auth) |
| GET | `/api/v1/pets/:slug` | Ver mascota por slug |
| POST | `/api/v1/pets` | Crear mascota (auth) |
| PATCH | `/api/v1/pets/:slug` | Actualizar mascota (auth) |
| DELETE | `/api/v1/pets/:slug` | Eliminar mascota (auth) |
| GET | `/api/v1/pets/:slug/qr` | Obtener código QR |
| POST | `/api/v1/pets/:slug/scan` | Registrar escaneo |
| GET | `/api/v1/pets/:slug/scans` | Ver estadísticas (auth) |

### Fotos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/pets/:slug/photos` | Listar fotos |
| POST | `/api/v1/pets/:slug/photos` | Agregar foto (auth) |
| PATCH | `/api/v1/pets/:slug/photos/:id` | Actualizar foto (auth) |
| DELETE | `/api/v1/pets/:slug/photos/:id` | Eliminar foto (auth) |

## 📖 Documentación Swagger

Una vez iniciado el servidor, visita:

```
http://localhost:3000/api-docs
```

## 🗄️ Estructura de la Base de Datos

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │      pets       │
├─────────────────┤     ├─────────────────┤
│ id              │────<│ ownerId         │
│ email           │     │ id              │
│ password        │     │ slug            │
│ nombre          │     │ nombre          │
│ telefono        │     │ especie         │
│ whatsapp        │     │ raza            │
│ instagram       │     │ edad            │
│ facebook        │     │ descripcion     │
│ avatar          │     │ indicaciones    │
└─────────────────┘     │ fotoPrincipal   │
                        │ qrCode          │
                        │ isLost          │
                        └────────┬────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐    ┌───────────────────┐    ┌───────────────┐
│  pet_photos   │    │     qr_scans      │    │refresh_tokens │
├───────────────┤    ├───────────────────┤    ├───────────────┤
│ id            │    │ id                │    │ id            │
│ url           │    │ petId             │    │ token         │
│ caption       │    │ ip                │    │ userId        │
│ orden         │    │ userAgent         │    │ expiresAt     │
│ petId         │    │ latitude          │    └───────────────┘
└───────────────┘    │ longitude         │
                     │ scannedAt         │
                     └───────────────────┘
```

## 🧪 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar schema con DB
npm run db:migrate   # Crear migración
npm run db:seed      # Poblar datos de ejemplo
npm run db:studio    # Abrir Prisma Studio
npm test             # Ejecutar tests
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación
- Rate limiting para prevenir abuso
- Helmet para headers de seguridad
- CORS configurado
- Validación de inputs con Zod

## 📝 Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de PostgreSQL | - |
| `JWT_SECRET` | Secreto para JWT | - |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Ambiente | `development` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:4321` |
| `UPLOAD_DIR` | Directorio de uploads | `uploads` |
| `MAX_FILE_SIZE` | Tamaño máximo de archivo | `5242880` (5MB) |
| `USE_S3` | Usar AWS S3 para uploads | `false` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key (si USE_S3=true) | - |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key (si USE_S3=true) | - |
| `AWS_REGION` | Región de AWS | `us-east-1` |
| `AWS_BUCKET_NAME` | Nombre del bucket S3 | - |
| `AWS_CLOUDFRONT_URL` | URL de CloudFront (opcional) | - |

Ver [`.env.example`](./.env.example) para más detalles.

## 👥 Usuarios de Prueba

Después de ejecutar el seed, puedes usar:

```
Email: jarregui92@gmail.com
Password: password123

Email: lucas@example.com
Password: password123
```

## 📄 Licencia

MIT
