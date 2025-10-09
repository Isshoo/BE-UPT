import { z } from 'zod';

const RoleEnum = z.enum(['ADMIN', 'DOSEN', 'USER']);
const SortByEnum = z.enum(['createdAt', 'nama', 'email']);
const OrderEnum = z.enum(['asc', 'desc']);

export const UserListSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: RoleEnum.optional(),
    sortBy: SortByEnum.optional(),
    order: OrderEnum.optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});

export const UserCreateSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Minimal 6 karakter'),
    nama: z.string().min(1),
    role: RoleEnum,
    fakultas: z.string().optional().nullable(),
    prodi: z.string().optional().nullable(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const UserUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      email: z.string().email().optional(),
      password: z.string().min(6, 'Minimal 6 karakter').optional(),
      nama: z.string().min(1).optional(),
      role: RoleEnum.optional(),
      fakultas: z.string().optional().nullable(),
      prodi: z.string().optional().nullable(),
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      { message: 'Tidak ada data untuk diupdate' }
    ),
  query: z.object({}).optional(),
});

export const UserParamIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});