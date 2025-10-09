import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(AuthMiddleware.authenticate);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.put('/change-password', authController.changePassword);
router.put('/profile', authController.updateProfile);

export default router;