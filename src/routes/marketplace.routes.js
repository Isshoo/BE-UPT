import express from 'express';
import { MarketplaceController } from '../controllers/index.js';
import { AuthMiddleware } from '../middlewares/index.js';
import { uploadImage } from '../config/index.js';

const router = express.Router();
const marketplaceController = new MarketplaceController();

// Public routes - Get events (accessible to all)
router.get('/', marketplaceController.getEvents);

// User routes - Get my history
router.get(
  '/my-history',
  AuthMiddleware.authenticate,
  marketplaceController.getUserHistory
);

router.get('/:id', marketplaceController.getEventById);

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);

// User routes - Register business
router.post('/:eventId/register', marketplaceController.registerBusiness);

// Admin only routes - Event management
router.post(
  '/',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.createEvent
);

router.put(
  '/:id',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.updateEvent
);

router.delete(
  '/:id',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.deleteEvent
);

router.post(
  '/:id/lock',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.lockEvent
);

router.post(
  '/:id/unlock',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.unlockEvent
);

router.post(
  '/:id/layout',
  AuthMiddleware.authorize('ADMIN'),
  uploadImage.single('layout'),
  marketplaceController.uploadLayout
);

router.post(
  '/:id/cover',
  AuthMiddleware.authorize('ADMIN'),
  uploadImage.single('cover'),
  marketplaceController.uploadCover
);

// Admin only routes - Sponsor management
router.post(
  '/:eventId/sponsors',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.addSponsor
);

router.put(
  '/sponsors/:sponsorId',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.updateSponsor
);

router.delete(
  '/sponsors/:sponsorId',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.deleteSponsor
);

// Admin only routes - Business management
router.get(
  '/:eventId/businesses',
  AuthMiddleware.authorize('ADMIN', 'DOSEN'),
  marketplaceController.getBusinessesByEvent
);

router.post(
  '/businesses/:businessId/approve',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.approveBusiness
);

router.post(
  '/businesses/:businessId/booth',
  AuthMiddleware.authorize('ADMIN'),
  marketplaceController.assignBoothNumber
);

export default router;
