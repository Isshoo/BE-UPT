/**
 * UMKM Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from 'zod';

// Get UMKMs Query
export const getUmkmsQuerySchema = z.object({
  query: z.object({
    kategori: z.string().optional(),
    tahap: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) => !val || (val >= 1 && val <= 4),
        'Tahap harus antara 1-4'
      ),
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, 'Page harus lebih dari 0'),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val > 0 && val <= 100,
        'Limit harus antara 1-100'
      ),
    search: z.string().optional(),
  }),
});

// Get UMKM By ID
export const getUmkmByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID UMKM harus diisi'),
  }),
});

// Create UMKM
export const createUmkmSchema = z.object({
  body: z.object({
    nama: z
      .string({ required_error: 'Nama UMKM harus diisi' })
      .min(1, 'Nama UMKM tidak boleh kosong')
      .max(255, 'Nama UMKM terlalu panjang')
      .trim(),
    kategori: z
      .string({ required_error: 'Kategori harus diisi' })
      .min(1, 'Kategori tidak boleh kosong')
      .max(255, 'Kategori terlalu panjang')
      .trim(),
    deskripsi: z
      .string({ required_error: 'Deskripsi harus diisi' })
      .min(1, 'Deskripsi tidak boleh kosong'),
    namaPemilik: z
      .string({ required_error: 'Nama pemilik harus diisi' })
      .min(1, 'Nama pemilik tidak boleh kosong')
      .max(255, 'Nama pemilik terlalu panjang')
      .trim(),
    alamat: z
      .string({ required_error: 'Alamat harus diisi' })
      .min(1, 'Alamat tidak boleh kosong')
      .max(500, 'Alamat terlalu panjang')
      .trim(),
    telepon: z
      .string({ required_error: 'Telepon harus diisi' })
      .min(1, 'Telepon tidak boleh kosong')
      .max(20, 'Telepon terlalu panjang')
      .trim(),
  }),
});

// Update UMKM
export const updateUmkmSchema = z.object({
  body: z.object({
    nama: z
      .string()
      .min(1, 'Nama UMKM tidak boleh kosong')
      .max(255)
      .trim()
      .optional(),
    kategori: z
      .string()
      .min(1, 'Kategori tidak boleh kosong')
      .max(255)
      .trim()
      .optional(),
    deskripsi: z.string().min(1, 'Deskripsi tidak boleh kosong').optional(),
    namaPemilik: z.string().min(1).max(255).trim().optional(),
    alamat: z.string().min(1).max(500).trim().optional(),
    telepon: z.string().min(1).max(20).trim().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID UMKM harus diisi'),
  }),
});

// Delete UMKM
export const deleteUmkmSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID UMKM harus diisi'),
  }),
});

// Upload Stage Files
export const uploadStageFilesSchema = z.object({
  params: z.object({
    umkmId: z.string().min(1, 'ID UMKM harus diisi'),
    tahap: z
      .string()
      .min(1, 'Tahap harus diisi')
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val >= 1 && val <= 4,
        'Tahap harus antara 1-4'
      ),
  }),
});

// Request Validation
export const requestValidationSchema = z.object({
  params: z.object({
    umkmId: z.string().min(1, 'ID UMKM harus diisi'),
    tahap: z
      .string()
      .min(1, 'Tahap harus diisi')
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val >= 1 && val <= 4,
        'Tahap harus antara 1-4'
      ),
  }),
});

// Validate Stage
export const validateStageSchema = z.object({
  body: z.object({
    isApproved: z.boolean({ required_error: 'isApproved harus diisi' }),
    catatan: z.string().max(1000).trim().optional().nullable(),
  }),
  params: z.object({
    umkmId: z.string().min(1, 'ID UMKM harus diisi'),
    tahap: z
      .string()
      .min(1, 'Tahap harus diisi')
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val >= 1 && val <= 4,
        'Tahap harus antara 1-4'
      ),
  }),
});
