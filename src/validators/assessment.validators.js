import { z } from 'zod';

export const KategoriCreateSchema = z.object({
  params: z.object({
    eventId: z.string().min(1),
  }),
  body: z.object({
    nama: z.string().min(1),
    deskripsi: z.string().optional(),
  }),
  query: z.object({}).optional(),
});

export const KategoriUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    nama: z.string().min(1).optional(),
    deskripsi: z.string().optional(),
  }),
  query: z.object({}).optional(),
});

export const AssignPenilaiSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    dosenIds: z.array(z.string().min(1)).min(1),
  }),
  query: z.object({}).optional(),
});

export const KriteriaCreateSchema = z.object({
  params: z.object({
    kategoriId: z.string().min(1),
  }),
  body: z.object({
    nama: z.string().min(1),
    bobot: z.number().int().min(1).max(100),
  }),
  query: z.object({}).optional(),
});

export const KriteriaUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    nama: z.string().min(1).optional(),
    bobot: z.number().int().min(1).max(100).optional(),
  }),
  query: z.object({}).optional(),
});

export const SetPemenangSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    usahaId: z.string().min(1),
  }),
  query: z.object({}).optional(),
});