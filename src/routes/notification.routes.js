import express from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
