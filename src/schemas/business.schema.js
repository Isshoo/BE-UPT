/**
 * Business Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from 'zod';

// Register Business (sudah ada di marketplace.schema.js, tapi kita buat ulang untuk konsistensi)
export const registerBusinessSchema = z.object({
  body: z.object({
    namaProduk: z
      .string({ required_error: 'Nama produk harus diisi' })
      .min(1, 'Nama produk tidak boleh kosong')
      .max(255, 'Nama produk terlalu panjang')
      .trim(),
    kategori: z
      .string({ required_error: 'Kategori harus diisi' })
      .min(1, 'Kategori tidak boleh kosong')
      .max(255, 'Kategori terlalu panjang')
      .trim(),
    deskripsi: z
      .string({ required_error: 'Deskripsi harus diisi' })
      .min(1, 'Deskripsi tidak boleh kosong'),
    tipeUsaha: z.enum(['MAHASISWA', 'UMKM_LUAR'], {
      required_error: 'Tipe usaha harus diisi',
    }),
    telepon: z
      .string({ required_error: 'Telepon harus diisi' })
      .min(1, 'Telepon tidak boleh kosong')
      .max(20, 'Telepon terlalu panjang')
      .trim(),
    // Untuk MAHASISWA
    anggota: z
      .array(
        z.object({
          nama: z.string().min(1, 'Nama anggota tidak boleh kosong'),
          nim: z.string().min(1, 'NIM anggota tidak boleh kosong'),
        })
      )
      .optional(),
    ketuaId: z.string().optional(),
    fakultasId: z.string().optional(),
    prodiId: z.string().optional(),
    pembimbingId: z.string().optional(),
    mataKuliah: z.string().max(255).trim().optional(),
    // Untuk UMKM_LUAR
    namaPemilik: z.string().max(255).trim().optional(),
    alamat: z.string().max(500).trim().optional(),
  }),
  params: z.object({
    eventId: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Get Businesses By Event
export const getBusinessesByEventSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, 'ID event harus diisi'),
  }),
  query: z.object({
    tipeUsaha: z.enum(['MAHASISWA', 'UMKM_LUAR']).optional(),
    disetujui: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    search: z.string().optional(),
  }),
});

// Approve Business
export const approveBusinessSchema = z.object({
  params: z.object({
    businessId: z.string().min(1, 'ID business harus diisi'),
  }),
});

// Assign Booth Number
export const assignBoothNumberSchema = z.object({
  body: z.object({
    nomorBooth: z
      .string({ required_error: 'Nomor booth harus diisi' })
      .min(1, 'Nomor booth tidak boleh kosong')
      .max(50, 'Nomor booth terlalu panjang')
      .trim(),
  }),
  params: z.object({
    businessId: z.string().min(1, 'ID business harus diisi'),
  }),
});
