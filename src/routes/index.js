import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import marketplaceRoutes from './marketplace.routes.js';

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
router.use('/users', userRoutes);
router.use('/marketplace', marketplaceRoutes);

// TODO: Add more routes
// router.use('/umkm', umkmRoutes);
// router.use('/notifications', notificationRoutes);

export default router;