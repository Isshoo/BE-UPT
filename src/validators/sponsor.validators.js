import { z } from 'zod';

export const SponsorCreateSchema = z.object({
  params: z.object({
    eventId: z.string().min(1),
  }),
  body: z.object({
    nama: z.string().min(1),
    logo: z.string().url().optional(),
  }),
  query: z.object({}).optional(),
});

export const SponsorUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    nama: z.string().min(1).optional(),
    logo: z.string().url().optional(),
  }),
  query: z.object({}).optional(),
});

export const SponsorParamIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});