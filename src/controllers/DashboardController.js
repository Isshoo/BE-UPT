import { DashboardService } from '../services/DashboardService.js';
import { ApiResponse } from '../utils/response.js';

export class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  getGeneralStats = async (req, res) => {
    try {
      const stats = await this.dashboardService.getGeneralStats();

      return ApiResponse.success(res, stats, 'Statistik umum berhasil diambil');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getMarketplaceAnalytics = async (req, res) => {
    try {
      const analytics = await this.dashboardService.getMarketplaceAnalytics();

      return ApiResponse.success(
        res,
        analytics,
        'Analytics marketplace berhasil diambil'
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

  getGrowthAnalytics = async (req, res) => {
    try {
      const analytics = await this.dashboardService.getGrowthAnalytics();

      return ApiResponse.success(
        res,
        analytics,
        'Analytics pertumbuhan berhasil diambil'
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

  getRecentActivities = async (req, res) => {
    try {
      const activities = await this.dashboardService.getRecentActivities();

      return ApiResponse.success(
        res,
        activities,
        'Aktivitas terbaru berhasil diambil'
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

  getFullDashboard = async (req, res) => {
    try {
      const [
        generalStats,
        marketplaceAnalytics,
        growthAnalytics,
        recentActivities,
      ] = await Promise.all([
        this.dashboardService.getGeneralStats(),
        this.dashboardService.getMarketplaceAnalytics(),
        this.dashboardService.getGrowthAnalytics(),
        this.dashboardService.getRecentActivities(),
      ]);

      return ApiResponse.success(
        res,
        {
          generalStats,
          marketplaceAnalytics,
          growthAnalytics,
          recentActivities,
        },
        'Data dashboard berhasil diambil'
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
}
