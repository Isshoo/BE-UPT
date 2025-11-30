/**
 * Notification Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from 'zod';

// Get User Notifications Query
export const getUserNotificationsQuerySchema = z.object({
  query: z.object({
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
    sudahBaca: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});

// Mark As Read
export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID notifikasi harus diisi'),
  }),
});

// Delete Notification
export const deleteNotificationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID notifikasi harus diisi'),
  }),
});
