import { AssessmentService } from '../services/AssessmentService.js';
import { ApiResponse } from '../utils/response.js';

export class AssessmentController {
  constructor() {
    this.assessmentService = new AssessmentService();
  }

  // ========== KATEGORI PENILAIAN ==========

  createKategori = async (req, res, next) => {
    try {
      const kategori = await this.assessmentService.createKategori(
        req.params.eventId,
        req.body
      );
      return ApiResponse.success(
        res,
        kategori,
        'Kategori penilaian berhasil dibuat',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  getKategoriByEvent = async (req, res, next) => {
    try {
      const kategori = await this.assessmentService.getKategoriByEvent(
        req.params.eventId
      );
      return ApiResponse.success(
        res,
        kategori,
        'Data kategori penilaian berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getKategoriById = async (req, res, next) => {
    try {
      const kategori = await this.assessmentService.getKategoriById(
        req.params.kategoriId
      );
      return ApiResponse.success(
        res,
        kategori,
        'Detail kategori penilaian berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  updateKategori = async (req, res, next) => {
    try {
      const kategori = await this.assessmentService.updateKategori(
        req.params.kategoriId,
        req.body
      );
      return ApiResponse.success(
        res,
        kategori,
        'Kategori penilaian berhasil diupdate'
      );
    } catch (error) {
      next(error);
    }
  };

  deleteKategori = async (req, res, next) => {
    try {
      const result = await this.assessmentService.deleteKategori(
        req.params.kategoriId
      );
      return ApiResponse.success(
        res,
        result,
        'Kategori penilaian berhasil dihapus'
      );
    } catch (error) {
      next(error);
    }
  };

  // ========== PENILAIAN ==========

  submitScore = async (req, res, next) => {
    try {
      const score = await this.assessmentService.submitScore(
        req.body,
        req.user.id
      );
      return ApiResponse.success(res, score, 'Nilai berhasil disimpan');
    } catch (error) {
      next(error);
    }
  };

  getScoresByKategori = async (req, res, next) => {
    try {
      const result = await this.assessmentService.getScoresByKategori(
        req.params.kategoriId
      );
      return ApiResponse.success(res, result, 'Data nilai berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  setWinner = async (req, res, next) => {
    try {
      const kategori = await this.assessmentService.setWinner(
        req.params.kategoriId,
        req.body.usahaId
      );
      return ApiResponse.success(res, kategori, 'Pemenang berhasil ditetapkan');
    } catch (error) {
      next(error);
    }
  };

  // ========== DOSEN SPECIFIC ==========

  getKategoriByDosen = async (req, res, next) => {
    try {
      const kategori = await this.assessmentService.getKategoriByDosen(
        req.user.id
      );
      return ApiResponse.success(
        res,
        kategori,
        'Data kategori penilaian berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getMentoredBusinesses = async (req, res, next) => {
    try {
      const businesses = await this.assessmentService.getMentoredBusinesses(
        req.user.id,
        req.query.eventId
      );
      return ApiResponse.success(
        res,
        businesses,
        'Data usaha bimbingan berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  approveMentoredBusiness = async (req, res, next) => {
    try {
      const business = await this.assessmentService.approveMentoredBusiness(
        req.params.businessId,
        req.user.id
      );
      return ApiResponse.success(
        res,
        business,
        'Usaha mahasiswa berhasil disetujui'
      );
    } catch (error) {
      next(error);
    }
  };
}
