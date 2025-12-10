import express from 'express';
import authRoutes from './auth.routes.js';
import marketplaceRoutes from './marketplace.routes.js';
import assessmentRoutes from './assessment.routes.js';
import userRoutes from './user.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import exportRoutes from './export.routes.js';
import fakultasRoutes from './fakultas.routes.js';
import { prisma } from '../config/index.js';

const router = express.Router();

// Health check
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      status: 'healthy',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'API is running but database is disconnected',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Routes
router.use('/auth', authRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', exportRoutes);
router.use('/fakultas', fakultasRoutes);

export default router;
