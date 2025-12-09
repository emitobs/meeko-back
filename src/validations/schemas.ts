import { z } from 'zod';

// ===============================
// VALIDACIONES DE USUARIO
// ===============================

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateUserSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

// ===============================
// VALIDACIONES DE MASCOTA
// ===============================

export const createPetSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  especie: z.string().min(1, 'La especie es requerida'),
  raza: z.string().min(1, 'La raza es requerida'),
  edad: z.string().min(1, 'La edad es requerida'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  indicaciones: z.string().optional(),
  ubicacion: z.string().optional(),
  fotoPrincipal: z.string().url('URL de foto inválida').optional(),
});

export const updatePetSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').optional(),
  especie: z.string().min(1, 'La especie es requerida').optional(),
  raza: z.string().min(1, 'La raza es requerida').optional(),
  edad: z.string().min(1, 'La edad es requerida').optional(),
  descripcion: z.string().min(1, 'La descripción es requerida').optional(),
  indicaciones: z.string().optional().nullable(),
  ubicacion: z.string().optional().nullable(),
  fotoPrincipal: z.string().url('URL de foto inválida').optional().nullable(),
  isLost: z.boolean().optional(),
});

export const reportLostSchema = z.object({
  isLost: z.boolean(),
  lostLocation: z.string().optional(),
});

// ===============================
// VALIDACIONES DE FOTOS
// ===============================

export const addPhotoSchema = z.object({
  url: z.string().url('URL de foto inválida'),
  caption: z.string().optional(),
  orden: z.number().int().min(0).optional(),
});

export const updatePhotoSchema = z.object({
  caption: z.string().optional(),
  orden: z.number().int().min(0).optional(),
});

// ===============================
// VALIDACIONES DE QR SCAN
// ===============================

export const qrScanSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// ===============================
// TIPOS INFERIDOS
// ===============================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
export type ReportLostInput = z.infer<typeof reportLostSchema>;

export type AddPhotoInput = z.infer<typeof addPhotoSchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;

export type QRScanInput = z.infer<typeof qrScanSchema>;
