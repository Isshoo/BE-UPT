/**
 * User Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from 'zod';

// Role enum
const RoleEnum = z.enum(['ADMIN', 'DOSEN', 'USER']);

// Query params untuk pagination dan filter
export const getUsersQuerySchema = z.object({
  query: z.object({
    role: z.string().optional(),
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, 'Page harus lebih dari 0'),
    limit: z
      .string()
      .optional()
      .default('100')
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val > 0 && val <= 100,
        'Limit harus antara 1-100'
      ),
    search: z.string().optional(),
  }),
});

// Create User Validation
export const createUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email harus diisi' })
      .email('Format email tidak valid')
      .min(1, 'Email tidak boleh kosong')
      .max(255, 'Email terlalu panjang')
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string({ required_error: 'Password harus diisi' })
      .min(6, 'Password minimal 6 karakter')
      .max(100, 'Password terlalu panjang'),
    nama: z
      .string({ required_error: 'Nama harus diisi' })
      .min(1, 'Nama tidak boleh kosong')
      .max(255, 'Nama terlalu panjang')
      .trim(),
    role: RoleEnum.default('USER'),
    fakultasId: z.string().optional().nullable(),
    prodiId: z.string().optional().nullable(),
  }),
});

// Update User Validation
export const updateUserSchema = z.object({
  body: z.object({
    nama: z
      .string()
      .min(1, 'Nama tidak boleh kosong')
      .max(255, 'Nama terlalu panjang')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Format email tidak valid')
      .min(1, 'Email tidak boleh kosong')
      .max(255, 'Email terlalu panjang')
      .transform((val) => val.toLowerCase().trim())
      .optional(),
    fakultasId: z.string().optional().nullable(),
    prodiId: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID user harus diisi'),
  }),
});

// Get User By ID Validation
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID user harus diisi'),
  }),
});

// Reset Password Validation
export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string({ required_error: 'Password baru harus diisi' })
      .min(6, 'Password baru minimal 6 karakter')
      .max(100, 'Password baru terlalu panjang'),
  }),
  params: z.object({
    id: z.string().min(1, 'ID user harus diisi'),
  }),
});
