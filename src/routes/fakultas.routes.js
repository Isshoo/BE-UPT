import express from 'express';
import { FakultasController } from '../controllers/FakultasController.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();
const fakultasController = new FakultasController();

// ========== PUBLIC ROUTES ==========
// These routes are public for dropdown options in registration forms

// Fakultas
router.get('/', fakultasController.getAllFakultas);
router.get('/:id', fakultasController.getFakultasById);
router.get('/:id/prodi', fakultasController.getProdiByFakultas);

// Prodi
router.get('/prodi/all', fakultasController.getAllProdi);

// ========== ADMIN ROUTES ==========
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize('ADMIN'));

// Fakultas CRUD
router.post('/', fakultasController.createFakultas);
router.put('/:id', fakultasController.updateFakultas);
router.delete('/:id', fakultasController.deleteFakultas);

// Prodi CRUD
router.post('/prodi', fakultasController.createProdi);
router.get('/prodi/:id', fakultasController.getProdiById);
router.put('/prodi/:id', fakultasController.updateProdi);
router.delete('/prodi/:id', fakultasController.deleteProdi);

export default router;
