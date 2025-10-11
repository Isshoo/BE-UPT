import express from 'express';
import authRoutes from './auth.routes.js';
import marketplaceRoutes from './marketplace.routes.js';
import assessmentRoutes from './assessment.routes.js';
import userRoutes from './user.routes.js';
import umkmRoutes from './umkm.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import exportRoutes from './export.routes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/assessment', assessmentRoutes);
router.use('/users', userRoutes);
router.use('/umkm', umkmRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', exportRoutes);

export default router;
