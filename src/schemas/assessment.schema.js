/**
 * Assessment Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from 'zod';

// Create Kategori
export const createKategoriSchema = z.object({
  body: z.object({
    nama: z
      .string({ required_error: 'Nama kategori harus diisi' })
      .min(1, 'Nama kategori tidak boleh kosong')
      .max(255, 'Nama kategori terlalu panjang')
      .trim(),
    deskripsi: z.string().max(1000).trim().optional(),
    penilaiIds: z
      .array(z.string().min(1))
      .min(1, 'Minimal satu penilai harus dipilih'),
    kriteria: z
      .array(
        z.object({
          nama: z.string().min(1, 'Nama kriteria tidak boleh kosong'),
          bobot: z
            .number()
            .int('Bobot harus bilangan bulat')
            .min(0, 'Bobot minimal 0')
            .max(100, 'Bobot maksimal 100'),
        })
      )
      .min(1, 'Minimal satu kriteria harus ada'),
  }),
  params: z.object({
    eventId: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Get Kategori By Event
export const getKategoriByEventSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Get Kategori By ID
export const getKategoriByIdSchema = z.object({
  params: z.object({
    kategoriId: z.string().min(1, 'ID kategori harus diisi'),
  }),
});

// Update Kategori
export const updateKategoriSchema = z.object({
  body: z.object({
    nama: z.string().min(1, 'Nama kategori tidak boleh kosong').max(255).trim().optional(),
    deskripsi: z.string().max(1000).trim().optional(),
    penilaiIds: z.array(z.string().min(1)).optional(),
  }),
  params: z.object({
    kategoriId: z.string().min(1, 'ID kategori harus diisi'),
  }),
});

// Delete Kategori
export const deleteKategoriSchema = z.object({
  params: z.object({
    kategoriId: z.string().min(1, 'ID kategori harus diisi'),
  }),
});

// Submit Score
export const submitScoreSchema = z.object({
  body: z.object({
    usahaId: z.string({ required_error: 'ID usaha harus diisi' }).min(1),
    kategoriId: z.string({ required_error: 'ID kategori harus diisi' }).min(1),
    kriteriaId: z.string({ required_error: 'ID kriteria harus diisi' }).min(1),
    nilai: z
      .number({ required_error: 'Nilai harus diisi' })
      .int('Nilai harus bilangan bulat')
      .min(0, 'Nilai minimal 0')
      .max(100, 'Nilai maksimal 100'),
  }),
});

// Get Scores By Kategori
export const getScoresByKategoriSchema = z.object({
  params: z.object({
    kategoriId: z.string().min(1, 'ID kategori harus diisi'),
  }),
});

// Set Winner
export const setWinnerSchema = z.object({
  body: z.object({
    usahaId: z.string({ required_error: 'ID usaha harus diisi' }).min(1),
  }),
  params: z.object({
    kategoriId: z.string().min(1, 'ID kategori harus diisi'),
  }),
});

// Get Mentored Businesses
export const getMentoredBusinessesSchema = z.object({
  query: z.object({
    eventId: z.string().optional(),
  }),
});

// Approve Mentored Business
export const approveMentoredBusinessSchema = z.object({
  params: z.object({
    businessId: z.string().min(1, 'ID business harus diisi'),
  }),
});

