import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares/index.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();
const authController = new AuthController();

// Public routes dengan validation
router.post(
  '/register',
  authLimiter,
  ValidationMiddleware.validateRegister,
  authController.register
);
router.post(
  '/login',
  authLimiter,
  ValidationMiddleware.validateLogin,
  authController.login
);

// Protected routes
router.use(AuthMiddleware.authenticate);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.put('/change-password', authController.changePassword);
router.put('/profile', authController.updateProfile);

export default router;
