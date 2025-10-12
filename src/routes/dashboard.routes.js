import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();
const dashboardController = new DashboardController();

router.get('/stats', dashboardController.getGeneralStats);

// All routes require admin authentication
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize('ADMIN'));

// Individual analytics endpoints
router.get(
  '/marketplace-analytics',
  dashboardController.getMarketplaceAnalytics
);
router.get('/umkm-analytics', dashboardController.getUmkmAnalytics);
router.get('/growth-analytics', dashboardController.getGrowthAnalytics);
router.get('/recent-activities', dashboardController.getRecentActivities);

// Combined endpoint
router.get('/full', dashboardController.getFullDashboard);

export default router;
