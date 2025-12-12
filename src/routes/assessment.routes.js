import express from 'express';
import { AssessmentController } from '../controllers/index.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();
const assessmentController = new AssessmentController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Admin only - Kategori Penilaian CRUD
router.post(
  '/events/:eventId/categories',
  AuthMiddleware.authorize('ADMIN'),
  assessmentController.createKategori
);

router.get(
  '/events/:eventId/categories',
  assessmentController.getKategoriByEvent
);

router.get('/categories/:kategoriId', assessmentController.getKategoriById);

router.put(
  '/categories/:kategoriId',
  AuthMiddleware.authorize('ADMIN'),
  assessmentController.updateKategori
);

router.delete(
  '/categories/:kategoriId',
  AuthMiddleware.authorize('ADMIN'),
  assessmentController.deleteKategori
);

// Admin only - Set winner
router.post(
  '/categories/:kategoriId/winner',
  AuthMiddleware.authorize('ADMIN'),
  assessmentController.setWinner
);

// Dosen routes - Penilaian
router.post(
  '/scores',
  AuthMiddleware.authorize('DOSEN'),
  assessmentController.submitScore
);

router.get(
  '/categories/:kategoriId/scores',
  AuthMiddleware.authorize('ADMIN', 'DOSEN'),
  assessmentController.getScoresByKategori
);

// Dosen routes - Get assigned categories
router.get(
  '/dosen/categories',
  AuthMiddleware.authorize('DOSEN'),
  assessmentController.getKategoriByDosen
);

// Dosen routes - Pendampingan
router.get(
  '/dosen/businesses',
  AuthMiddleware.authorize('DOSEN'),
  assessmentController.getMentoredBusinesses
);

router.post(
  '/dosen/businesses/:businessId/approve',
  AuthMiddleware.authorize('DOSEN'),
  assessmentController.approveMentoredBusiness
);

router.post(
  '/dosen/businesses/:businessId/reject',
  AuthMiddleware.authorize('DOSEN'),
  assessmentController.rejectMentoredBusiness
);

export default router;
