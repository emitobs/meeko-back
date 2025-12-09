import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config/index.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetQR API',
      version: '1.0.0',
      description: `
# 🐾 PetQR API

API REST para el sistema de identificación de mascotas por código QR.

## Características principales:
- **Autenticación JWT** - Registro, login y gestión de usuarios
- **Gestión de mascotas** - CRUD completo de mascotas
- **Códigos QR** - Generación automática de QR únicos
- **Fotos** - Galería de fotos para cada mascota
- **Estadísticas** - Seguimiento de escaneos de QR

## Autenticación
La API usa JWT (JSON Web Tokens). Para endpoints protegidos, incluye el token en el header:
\`\`\`
Authorization: Bearer <tu-token>
\`\`\`
      `,
      contact: {
        name: 'Soporte',
        email: 'soporte@petqr.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            nombre: { type: 'string' },
            telefono: { type: 'string' },
            whatsapp: { type: 'string' },
            instagram: { type: 'string' },
            facebook: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Pet: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            nombre: { type: 'string' },
            especie: { type: 'string' },
            raza: { type: 'string' },
            edad: { type: 'string' },
            descripcion: { type: 'string' },
            indicaciones: { type: 'string' },
            fotoPrincipal: { type: 'string' },
            ubicacion: { type: 'string' },
            qrCode: { type: 'string' },
            isLost: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PetPhoto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            url: { type: 'string' },
            caption: { type: 'string' },
            orden: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y gestión de usuarios' },
      { name: 'Pets', description: 'Gestión de mascotas' },
      { name: 'Photos', description: 'Gestión de fotos de mascotas' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
