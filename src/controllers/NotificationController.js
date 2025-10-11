import { NotificationService } from '../services/NotificationService.js';
import { ApiResponse } from '../utils/response.js';

export class NotificationController {
  constructor() {
    this.notificationService = new NotificationService();
  }

  getUserNotifications = async (req, res, next) => {
    try {
      const { page, limit, sudahBaca } = req.query;
      const userId = req.user.id;

      const result = await this.notificationService.getUserNotifications(
        userId,
        { page, limit, sudahBaca }
      );

      return ApiResponse.success(res, result, 'Notifikasi berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);

      return ApiResponse.success(
        res,
        { count },
        'Jumlah notifikasi belum dibaca berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await this.notificationService.markAsRead(
        id,
        userId
      );

      return ApiResponse.success(
        res,
        { notification },
        'Notifikasi berhasil ditandai sebagai dibaca'
      );
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await this.notificationService.markAllAsRead(userId);

      return ApiResponse.success(
        res,
        result,
        'Semua notifikasi berhasil ditandai sebagai dibaca'
      );
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await this.notificationService.deleteNotification(
        id,
        userId
      );

      return ApiResponse.success(res, result, 'Notifikasi berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };
}
