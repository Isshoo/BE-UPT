/**
 * Export Validation Schemas
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

// Export Users Query
export const exportUsersQuerySchema = z.object({
  query: z.object({
    format: z.enum(['excel']).default('excel'),
  }),
});

// Export UMKM Query
export const exportUmkmQuerySchema = z.object({
  query: z.object({
    format: z.enum(['excel']).default('excel'),
  }),
});

// Export Event
export const exportEventSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, 'ID event harus diisi'),
  }),
  query: z.object({
    format: z.enum(['excel', 'pdf']).default('excel'),
  }),
});

// Export Assessment
export const exportAssessmentSchema = z.object({
  params: z.object({
    kategoriId: z.string().min(1, 'ID kategori harus diisi'),
  }),
  query: z.object({
    format: z.enum(['excel']).default('excel'),
  }),
});

// Export Marketplace Query
export const exportMarketplaceQuerySchema = z.object({
  query: z.object({
    format: z.enum(['excel']).default('excel'),
    status: z.string().optional(),
    semester: z.string().optional(),
    tahunAjaran: z.string().optional(),
  }),
});

// Export Marketplace Detailed Query
export const exportMarketplaceDetailedQuerySchema = z.object({
  query: z.object({
    status: z.string().optional(),
    semester: z.string().optional(),
    tahunAjaran: z.string().optional(),
  }),
});
