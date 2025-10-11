import { DashboardService } from '../services/DashboardService.js';
import { ApiResponse } from '../utils/response.js';

export class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  getGeneralStats = async (req, res, next) => {
    try {
      const stats = await this.dashboardService.getGeneralStats();
      return ApiResponse.success(res, stats, 'Statistik umum berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  getMarketplaceAnalytics = async (req, res, next) => {
    try {
      const analytics = await this.dashboardService.getMarketplaceAnalytics();
      return ApiResponse.success(
        res,
        analytics,
        'Analytics marketplace berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getUmkmAnalytics = async (req, res, next) => {
    try {
      const analytics = await this.dashboardService.getUmkmAnalytics();
      return ApiResponse.success(
        res,
        analytics,
        'Analytics UMKM berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getGrowthAnalytics = async (req, res, next) => {
    try {
      const analytics = await this.dashboardService.getGrowthAnalytics();
      return ApiResponse.success(
        res,
        analytics,
        'Analytics pertumbuhan berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getRecentActivities = async (req, res, next) => {
    try {
      const activities = await this.dashboardService.getRecentActivities();
      return ApiResponse.success(
        res,
        activities,
        'Aktivitas terbaru berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  // Combined endpoint for full dashboard data
  getFullDashboard = async (req, res, next) => {
    try {
      const [
        generalStats,
        marketplaceAnalytics,
        umkmAnalytics,
        growthAnalytics,
        recentActivities,
      ] = await Promise.all([
        this.dashboardService.getGeneralStats(),
        this.dashboardService.getMarketplaceAnalytics(),
        this.dashboardService.getUmkmAnalytics(),
        this.dashboardService.getGrowthAnalytics(),
        this.dashboardService.getRecentActivities(),
      ]);

      return ApiResponse.success(
        res,
        {
          generalStats,
          marketplaceAnalytics,
          umkmAnalytics,
          growthAnalytics,
          recentActivities,
        },
        'Data dashboard berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };
}
