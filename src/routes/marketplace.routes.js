import express from 'express';
import { MarketplaceController } from '../controllers/MarketplaceController.js';
import { SponsorController } from '../controllers/SponsorController.js';
import { AssessmentController } from '../controllers/AssessmentController.js';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares/index.js';
import { uploadImage } from '../config/cloudinary.js';
import {
  EventListSchema,
  EventCreateSchema,
  EventUpdateSchema,
  EventParamIdSchema,
} from '../validators/marketplace.validators.js';
import {
  SponsorCreateSchema,
  SponsorUpdateSchema,
  SponsorParamIdSchema,
} from '../validators/sponsor.validators.js';
import {
  KategoriCreateSchema,
  KategoriUpdateSchema,
  AssignPenilaiSchema,
  KriteriaCreateSchema,
  KriteriaUpdateSchema,
  SetPemenangSchema,
} from '../validators/assessment.validators.js';

const router = express.Router();
const marketplaceController = new MarketplaceController();
const sponsorController = new SponsorController();
const assessmentController = new AssessmentController();

// Public routes
router.get('/events', ValidationMiddleware.validate(EventListSchema), marketplaceController.list);
router.get('/events/:id', ValidationMiddleware.validate(EventParamIdSchema), marketplaceController.detail);

router.get('/events/:eventId/sponsors', sponsorController.listByEvent);
router.get('/events/:eventId/kategori', assessmentController.listKategori);
router.get('/kategori/:kategoriId/kriteria', assessmentController.listKriteria);

// Admin-only routes
router.use(AuthMiddleware.authenticate, AuthMiddleware.authorize('ADMIN'));

// Event management
router.post('/events', ValidationMiddleware.validate(EventCreateSchema), marketplaceController.create);
router.put('/events/:id', ValidationMiddleware.validate(EventUpdateSchema), marketplaceController.update);
router.delete('/events/:id', ValidationMiddleware.validate(EventParamIdSchema), marketplaceController.remove);
router.post('/events/:id/lock', ValidationMiddleware.validate(EventParamIdSchema), marketplaceController.lock);
router.post('/events/:id/unlock', ValidationMiddleware.validate(EventParamIdSchema), marketplaceController.unlock);
router.post('/events/:id/layout', ValidationMiddleware.validate(EventParamIdSchema), uploadImage.single('layout'), marketplaceController.uploadLayout);

// Sponsor management
router.post('/events/:eventId/sponsors', ValidationMiddleware.validate(SponsorCreateSchema), sponsorController.create);
router.put('/sponsors/:id', ValidationMiddleware.validate(SponsorUpdateSchema), sponsorController.update);
router.delete('/sponsors/:id', ValidationMiddleware.validate(SponsorParamIdSchema), sponsorController.remove);

// Assessment management
router.post('/events/:eventId/kategori', ValidationMiddleware.validate(KategoriCreateSchema), assessmentController.createKategori);
router.put('/kategori/:id', ValidationMiddleware.validate(KategoriUpdateSchema), assessmentController.updateKategori);
router.delete('/kategori/:id', ValidationMiddleware.validate(SponsorParamIdSchema), assessmentController.removeKategori);
router.post('/kategori/:id/assign-penilai', ValidationMiddleware.validate(AssignPenilaiSchema), assessmentController.assignPenilai);

router.post('/kategori/:kategoriId/kriteria', ValidationMiddleware.validate(KriteriaCreateSchema), assessmentController.createKriteria);
router.put('/kriteria/:id', ValidationMiddleware.validate(KriteriaUpdateSchema), assessmentController.updateKriteria);
router.delete('/kriteria/:id', ValidationMiddleware.validate(SponsorParamIdSchema), assessmentController.removeKriteria);

router.get('/kategori/:kategoriId/validate-bobot', assessmentController.validateBobot);
router.post('/kategori/:id/set-pemenang', ValidationMiddleware.validate(SetPemenangSchema), assessmentController.setPemenang);

export default router;