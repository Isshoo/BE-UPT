import express from 'express';
import { ExportController } from '../controllers/ExportController.js';
import { AuthMiddleware } from '../middlewares/index.js';
import { exportLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();
const exportController = new ExportController();

// All routes require admin authentication
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize('ADMIN'));
router.use(exportLimiter);
// Export users
router.get('/users', exportController.exportUsers);

// Export UMKM
router.get('/umkm', exportController.exportUmkm);

// Export event
router.get('/event/:eventId', exportController.exportEvent);

// Export assessment results
router.get('/assessment/:kategoriId', exportController.exportAssessment);

// Export marketplace events
router.get('/marketplace', exportController.exportMarketplace);

// Export marketplace detailed
router.get('/marketplace/detailed', exportController.exportMarketplaceDetailed);

export default router;
