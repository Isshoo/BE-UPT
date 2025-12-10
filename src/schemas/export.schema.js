/**
 * Export Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from 'zod';

// Status Event enum
const EventStatusEnum = z.enum(['DRAFT', 'TERBUKA', 'BERLANGSUNG', 'SELESAI']);

// Export format enum - support both excel and pdf
const ExportFormatEnum = z.enum(['excel', 'pdf']).default('excel');

// Export Users Query
export const exportUsersQuerySchema = z.object({
  query: z.object({
    format: ExportFormatEnum,
  }),
});

// Export Event
export const exportEventSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, 'ID event harus diisi'),
  }),
  query: z.object({
    format: ExportFormatEnum,
  }),
});

// Export Assessment
export const exportAssessmentSchema = z.object({
  params: z.object({
    kategoriId: z.string().min(1, 'ID kategori harus diisi'),
  }),
  query: z.object({
    format: ExportFormatEnum,
  }),
});

// Export Marketplace Query
export const exportMarketplaceQuerySchema = z.object({
  query: z.object({
    format: ExportFormatEnum,
    status: z.string().optional(),
    semester: z.string().optional(),
    tahunAjaran: z.string().optional(),
  }),
});

// Export Marketplace Detailed Query
export const exportMarketplaceDetailedQuerySchema = z.object({
  query: z.object({
    format: ExportFormatEnum,
    status: z.string().optional(),
    semester: z.string().optional(),
    tahunAjaran: z.string().optional(),
  }),
});
