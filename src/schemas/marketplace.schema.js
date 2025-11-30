/**
 * Marketplace Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { string, z } from 'zod';

// Status Event enum
const StatusEventEnum = z.enum([
  'DRAFT',
  'TERBUKA',
  'PERSIAPAN',
  'BERLANGSUNG',
  'SELESAI',
]);

// Query params untuk get events
export const getEventsQuerySchema = z.object({
  query: z.object({
    status: z.string().optional(),
    semester: z.string().optional(),
    tahunAjaran: z.string().optional(),
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

// Get Event By ID
export const getEventByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Create Event
export const createEventSchema = z.object({
  body: z.object({
    nama: z
      .string({ required_error: 'Nama event harus diisi' })
      .min(1, 'Nama event tidak boleh kosong')
      .max(255, 'Nama event terlalu panjang')
      .trim(),
    deskripsi: z
      .string({ required_error: 'Deskripsi harus diisi' })
      .min(1, 'Deskripsi tidak boleh kosong'),
    semester: z
      .string({ required_error: 'Semester harus diisi' })
      .min(1, 'Semester tidak boleh kosong')
      .max(50, 'Semester terlalu panjang')
      .trim(),
    tahunAjaran: z
      .string({ required_error: 'Tahun ajaran harus diisi' })
      .min(1, 'Tahun ajaran tidak boleh kosong')
      .max(50, 'Tahun ajaran terlalu panjang')
      .trim(),
    lokasi: z
      .string({ required_error: 'Lokasi harus diisi' })
      .min(1, 'Lokasi tidak boleh kosong')
      .max(255, 'Lokasi terlalu panjang')
      .trim(),
    tanggalPelaksanaan: z
      .string({ required_error: 'Tanggal pelaksanaan harus diisi' })
      .min(1, 'Tanggal pelaksanaan tidak boleh kosong')
      .refine(
        (val) => !isNaN(Date.parse(val)),
        'Format tanggal pelaksanaan tidak valid'
      ),
    mulaiPendaftaran: z
      .string({ required_error: 'Tanggal mulai pendaftaran harus diisi' })
      .min(1, 'Tanggal mulai pendaftaran tidak boleh kosong')
      .refine(
        (val) => !isNaN(Date.parse(val)),
        'Format tanggal mulai pendaftaran tidak valid'
      ),
    akhirPendaftaran: z
      .string({ required_error: 'Tanggal akhir pendaftaran harus diisi' })
      .min(1, 'Tanggal akhir pendaftaran tidak boleh kosong')
      .refine(
        (val) => !isNaN(Date.parse(val)),
        'Format tanggal akhir pendaftaran tidak valid'
      ),
    kuotaPeserta: z
      .string({ required_error: 'Kuota peserta harus diisi' })
      .min(1, 'Kuota peserta minimal 1'),
    sponsor: z
      .array(
        z.object({
          nama: z.string().min(1, 'Nama sponsor tidak boleh kosong'),
          logo: z.string().optional(),
        })
      )
      .optional(),
    kategoriPenilaian: z
      .array(
        z.object({
          nama: z.string().min(1, 'Nama kategori tidak boleh kosong'),
          deskripsi: z.string().optional(),
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
        })
      )
      .optional(),
  }),
});

// Update Event
export const updateEventSchema = z.object({
  body: z.object({
    nama: z
      .string()
      .min(1, 'Nama event tidak boleh kosong')
      .max(255)
      .trim()
      .optional(),
    deskripsi: z.string().min(1, 'Deskripsi tidak boleh kosong').optional(),
    semester: z.string().min(1).max(50).trim().optional(),
    tahunAjaran: z.string().min(1).max(50).trim().optional(),
    lokasi: z.string().min(1).max(255).trim().optional(),
    tanggalPelaksanaan: z
      .string()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Format tanggal pelaksanaan tidak valid'
      )
      .optional(),
    mulaiPendaftaran: z
      .string()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Format tanggal mulai pendaftaran tidak valid'
      )
      .optional(),
    akhirPendaftaran: z
      .string()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Format tanggal akhir pendaftaran tidak valid'
      )
      .optional(),
    kuotaPeserta: z
      .number()
      .int('Kuota peserta harus bilangan bulat')
      .min(1, 'Kuota peserta minimal 1')
      .optional(),
    status: StatusEventEnum.optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Lock/Unlock Event
export const lockUnlockEventSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Upload Layout
export const uploadLayoutSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Add Sponsor
export const addSponsorSchema = z.object({
  body: z.object({
    nama: z
      .string({ required_error: 'Nama sponsor harus diisi' })
      .min(1, 'Nama sponsor tidak boleh kosong')
      .max(255, 'Nama sponsor terlalu panjang')
      .trim(),
    logo: z
      .string({ required_error: 'Logo sponsor harus diisi' })
      .url('Logo sponsor harus berupa URL valid')
      .min(1, 'Logo sponsor tidak boleh kosong'),
  }),
  params: z.object({
    eventId: z.string().min(1, 'ID event harus diisi'),
  }),
});

// Update Sponsor
export const updateSponsorSchema = z.object({
  body: z.object({
    nama: z
      .string()
      .min(1, 'Nama sponsor tidak boleh kosong')
      .max(255, 'Nama sponsor terlalu panjang')
      .trim()
      .optional(),
    logo: z
      .string()
      .url('Logo sponsor harus berupa URL valid')
      .min(1, 'Logo sponsor tidak boleh kosong')
      .optional(),
  }),
  params: z.object({
    sponsorId: z.string().min(1, 'ID sponsor harus diisi'),
  }),
});

// Delete Sponsor
export const deleteSponsorSchema = z.object({
  params: z.object({
    sponsorId: z.string().min(1, 'ID sponsor harus diisi'),
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

// Register Business (akan digunakan di BusinessService, tapi schema di sini)
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
    fakultas: z.string().max(255).trim().optional(),
    prodi: z.string().max(255).trim().optional(),
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
