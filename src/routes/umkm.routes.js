import express from 'express';
import { UmkmController } from '../controllers/UmkmController.js';
import { AuthMiddleware } from '../middlewares/index.js';
import { uploadMultiple } from '../config/index.js';

const router = express.Router();
const umkmController = new UmkmController();

// Public routes - Get all UMKM
router.get('/', umkmController.getUmkms);
router.get('/:id', umkmController.getUmkmById);

// Protected routes - require authentication
router.use(AuthMiddleware.authenticate);

// User routes - My UMKM
router.get('/my/list', umkmController.getMyUmkms);
router.post('/', umkmController.createUmkm);
router.put('/:id', umkmController.updateUmkm);
router.delete('/:id', umkmController.deleteUmkm);

// Stage management
router.post(
  '/:umkmId/stages/:tahap/files',
  uploadMultiple.array('files', 5),
  umkmController.uploadStageFiles
);

router.post(
  '/:umkmId/stages/:tahap/validate-request',
  umkmController.requestValidation
);

// Admin only - Validate stage
router.post(
  '/:umkmId/stages/:tahap/validate',
  AuthMiddleware.authorize('ADMIN'),
  umkmController.validateStage
);

// Admin only - Statistics
router.get(
  '/statistics/overview',
  AuthMiddleware.authorize('ADMIN'),
  umkmController.getStatistics
);

export default router;
