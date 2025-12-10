import { z } from 'zod';

// ========== FAKULTAS SCHEMAS ==========

export const getFakultasByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID fakultas harus diisi'),
  }),
});

export const createFakultasSchema = z.object({
  body: z.object({
    kode: z
      .string()
      .min(1, 'Kode fakultas harus diisi')
      .max(20, 'Kode fakultas maksimal 20 karakter')
      .regex(
        /^[A-Za-z0-9_]+$/,
        'Kode fakultas hanya boleh berisi huruf, angka, dan underscore'
      ),
    nama: z
      .string()
      .min(1, 'Nama fakultas harus diisi')
      .max(100, 'Nama fakultas maksimal 100 karakter'),
  }),
});

export const updateFakultasSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID fakultas harus diisi'),
  }),
  body: z.object({
    kode: z
      .string()
      .min(1, 'Kode fakultas harus diisi')
      .max(20, 'Kode fakultas maksimal 20 karakter')
      .regex(
        /^[A-Za-z0-9_]+$/,
        'Kode fakultas hanya boleh berisi huruf, angka, dan underscore'
      )
      .optional(),
    nama: z
      .string()
      .min(1, 'Nama fakultas harus diisi')
      .max(100, 'Nama fakultas maksimal 100 karakter')
      .optional(),
  }),
});

// ========== PRODI SCHEMAS ==========

export const getProdiByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID program studi harus diisi'),
  }),
});

export const createProdiSchema = z.object({
  body: z.object({
    nama: z
      .string()
      .min(1, 'Nama program studi harus diisi')
      .max(100, 'Nama program studi maksimal 100 karakter'),
    fakultasId: z.string().min(1, 'Fakultas harus dipilih'),
  }),
});

export const updateProdiSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID program studi harus diisi'),
  }),
  body: z.object({
    nama: z
      .string()
      .min(1, 'Nama program studi harus diisi')
      .max(100, 'Nama program studi maksimal 100 karakter')
      .optional(),
    fakultasId: z.string().min(1, 'Fakultas harus dipilih').optional(),
  }),
});
