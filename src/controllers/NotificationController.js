import { NotificationService } from '../services/NotificationService.js';
import { ApiResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validators.js';
import {
  getUserNotificationsQuerySchema,
  markAsReadSchema,
  deleteNotificationSchema,
} from '../schemas/notification.schema.js';

export class NotificationController {
  constructor() {
    this.notificationService = new NotificationService();
  }

  getUserNotifications = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getUserNotificationsQuerySchema,
      });

      const { page, limit, sudahBaca } = req.query;
      const userId = req.user.id;

      const result = await this.notificationService.getUserNotifications(
        userId,
        { page, limit, sudahBaca }
      );

      return ApiResponse.success(res, result, 'Notifikasi berhasil diambil');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getUnreadCount = async (req, res) => {
    try {
      const userId = req.user.id;

      const count = await this.notificationService.getUnreadCount(userId);

      return ApiResponse.success(
        res,
        { count },
        'Jumlah notifikasi belum dibaca berhasil diambil'
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  markAsRead = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: markAsReadSchema,
      });

      const { id } = req.params;
      const userId = req.user.id;

      const notification = await this.notificationService.markAsRead(id, userId);

      return ApiResponse.success(
        res,
        { notification },
        'Notifikasi berhasil ditandai sebagai dibaca'
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  markAllAsRead = async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await this.notificationService.markAllAsRead(userId);

      return ApiResponse.success(
        res,
        result,
        'Semua notifikasi berhasil ditandai sebagai dibaca'
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  deleteNotification = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: deleteNotificationSchema,
      });

      const { id } = req.params;
      const userId = req.user.id;

      const result = await this.notificationService.deleteNotification(id, userId);

      return ApiResponse.success(res, result, 'Notifikasi berhasil dihapus');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };
}
