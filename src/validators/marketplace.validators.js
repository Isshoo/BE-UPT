import { z } from 'zod';

const StatusEvent = z.enum(['DRAFT', 'TERBUKA', 'PERSIAPAN', 'BERLANGSUNG', 'SELESAI']);
const OrderEnum = z.enum(['asc', 'desc']);

export const EventListSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: StatusEvent.optional(),
    semester: z.string().optional(),
    tahunAjaran: z.string().optional(),
    orderBy: z.enum(['createdAt', 'nama', 'tanggalPelaksanaan']).optional(),
    order: OrderEnum.optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

export const EventCreateSchema = z.object({
  body: z.object({
    nama: z.string().min(1),
    deskripsi: z.string().min(1),
    semester: z.string().min(1),
    tahunAjaran: z.string().min(1),
    lokasi: z.string().min(1),
    tanggalPelaksanaan: z.string().datetime().or(z.string().min(1)),
    mulaiPendaftaran: z.string().datetime().or(z.string().min(1)),
    akhirPendaftaran: z.string().datetime().or(z.string().min(1)),
    kuotaPeserta: z.number().int().nonnegative(),
    status: StatusEvent.optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const EventUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    nama: z.string().min(1).optional(),
    deskripsi: z.string().min(1).optional(),
    semester: z.string().min(1).optional(),
    tahunAjaran: z.string().min(1).optional(),
    lokasi: z.string().min(1).optional(),
    tanggalPelaksanaan: z.string().min(1).optional(),
    mulaiPendaftaran: z.string().min(1).optional(),
    akhirPendaftaran: z.string().min(1).optional(),
    kuotaPeserta: z.number().int().nonnegative().optional(),
    status: StatusEvent.optional(),
  }),
  query: z.object({}).optional(),
});

export const EventParamIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});