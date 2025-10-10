import { UmkmService } from '../services/UmkmService.js';
import { ApiResponse } from '../utils/response.js';

export class UmkmController {
  constructor() {
    this.umkmService = new UmkmService();
  }

  // ========== UMKM CRUD ==========

  createUmkm = async (req, res, next) => {
    try {
      const umkm = await this.umkmService.createUmkm(req.body, req.user.id);
      return ApiResponse.success(res, umkm, 'UMKM berhasil didaftarkan', 201);
    } catch (error) {
      next(error);
    }
  };

  getUmkms = async (req, res, next) => {
    try {
      const result = await this.umkmService.getUmkms(req.query);
      return ApiResponse.paginate(
        res,
        result.umkms,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data UMKM berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getMyUmkms = async (req, res, next) => {
    try {
      const result = await this.umkmService.getUmkms({
        ...req.query,
        userId: req.user.id,
      });
      return ApiResponse.paginate(
        res,
        result.umkms,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data UMKM Anda berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getUmkmById = async (req, res, next) => {
    try {
      const umkm = await this.umkmService.getUmkmById(
        req.params.id,
        req.user?.id,
        req.user?.role
      );
      return ApiResponse.success(res, umkm, 'Detail UMKM berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  updateUmkm = async (req, res, next) => {
    try {
      const umkm = await this.umkmService.updateUmkm(
        req.params.id,
        req.body,
        req.user.id
      );
      return ApiResponse.success(res, umkm, 'UMKM berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  deleteUmkm = async (req, res, next) => {
    try {
      const result = await this.umkmService.deleteUmkm(
        req.params.id,
        req.user.id,
        req.user.role
      );
      return ApiResponse.success(res, result, 'UMKM berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };

  // ========== STAGE MANAGEMENT ==========

  uploadStageFiles = async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        const error = new Error('File harus diupload');
        error.statusCode = 400;
        throw error;
      }

      // Extract file URLs from Cloudinary upload
      const fileUrls = req.files.map((file) => file.path);

      const stage = await this.umkmService.uploadStageFiles(
        req.params.umkmId,
        req.params.tahap,
        fileUrls,
        req.user.id
      );

      return ApiResponse.success(res, stage, 'File berhasil diupload');
    } catch (error) {
      next(error);
    }
  };

  requestValidation = async (req, res, next) => {
    try {
      const stage = await this.umkmService.requestValidation(
        req.params.umkmId,
        req.params.tahap,
        req.user.id
      );
      return ApiResponse.success(
        res,
        stage,
        'Request validasi berhasil dikirim'
      );
    } catch (error) {
      next(error);
    }
  };

  validateStage = async (req, res, next) => {
    try {
      const { isApproved, catatan } = req.body;
      const umkm = await this.umkmService.validateStage(
        req.params.umkmId,
        req.params.tahap,
        isApproved,
        catatan
      );
      return ApiResponse.success(
        res,
        umkm,
        isApproved ? 'Tahap berhasil divalidasi' : 'Tahap ditolak'
      );
    } catch (error) {
      next(error);
    }
  };

  // ========== STATISTICS ==========

  getStatistics = async (req, res, next) => {
    try {
      const stats = await this.umkmService.getStatistics();
      return ApiResponse.success(res, stats, 'Statistik UMKM berhasil diambil');
    } catch (error) {
      next(error);
    }
  };
}
