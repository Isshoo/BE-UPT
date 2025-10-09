import { AssessmentService } from '../services/AssessmentService.js';
import { ApiResponse } from '../utils/response.js';

export class AssessmentController {
  constructor() {
    this.service = new AssessmentService();
  }

  // Kategori endpoints
  listKategori = async (req, res, next) => {
    try {
      const kategori = await this.service.listKategori(req.params.eventId);
      return ApiResponse.success(res, { kategori }, 'Daftar kategori penilaian berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  createKategori = async (req, res, next) => {
    try {
      const kategori = await this.service.createKategori(req.params.eventId, req.body);
      return ApiResponse.success(res, { kategori }, 'Kategori penilaian berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  };

  updateKategori = async (req, res, next) => {
    try {
      const kategori = await this.service.updateKategori(req.params.id, req.body);
      return ApiResponse.success(res, { kategori }, 'Kategori penilaian berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  removeKategori = async (req, res, next) => {
    try {
      const result = await this.service.removeKategori(req.params.id);
      return ApiResponse.success(res, result, 'Kategori penilaian berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };

  assignPenilai = async (req, res, next) => {
    try {
      const kategori = await this.service.assignPenilai(req.params.id, req.body.dosenIds);
      return ApiResponse.success(res, { kategori }, 'Dosen penilai berhasil ditugaskan');
    } catch (error) {
      next(error);
    }
  };

  // Kriteria endpoints
  listKriteria = async (req, res, next) => {
    try {
      const kriteria = await this.service.listKriteria(req.params.kategoriId);
      return ApiResponse.success(res, { kriteria }, 'Daftar kriteria penilaian berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  createKriteria = async (req, res, next) => {
    try {
      const kriteria = await this.service.createKriteria(req.params.kategoriId, req.body);
      return ApiResponse.success(res, { kriteria }, 'Kriteria penilaian berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  };

  updateKriteria = async (req, res, next) => {
    try {
      const kriteria = await this.service.updateKriteria(req.params.id, req.body);
      return ApiResponse.success(res, { kriteria }, 'Kriteria penilaian berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  removeKriteria = async (req, res, next) => {
    try {
      const result = await this.service.removeKriteria(req.params.id);
      return ApiResponse.success(res, result, 'Kriteria penilaian berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };

  validateBobot = async (req, res, next) => {
    try {
      const result = await this.service.validateBobotKriteria(req.params.kategoriId);
      return ApiResponse.success(res, result, 'Validasi bobot kriteria');
    } catch (error) {
      next(error);
    }
  };

  setPemenang = async (req, res, next) => {
    try {
      const kategori = await this.service.setPemenang(req.params.id, req.body.usahaId);
      return ApiResponse.success(res, { kategori }, 'Pemenang kategori berhasil ditetapkan');
    } catch (error) {
      next(error);
    }
  };
}