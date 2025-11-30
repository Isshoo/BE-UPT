import { UmkmService } from '../services/UmkmService.js';
import { ApiResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validators.js';
import {
  getUmkmsQuerySchema,
  getUmkmByIdSchema,
  createUmkmSchema,
  updateUmkmSchema,
  deleteUmkmSchema,
  uploadStageFilesSchema,
  requestValidationSchema,
  validateStageSchema,
} from '../schemas/umkm.schema.js';

export class UmkmController {
  constructor() {
    this.umkmService = new UmkmService();
  }

  createUmkm = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['nama', 'kategori', 'deskripsi', 'namaPemilik', 'alamat', 'telepon'],
        allowed: ['nama', 'kategori', 'deskripsi', 'namaPemilik', 'alamat', 'telepon'],
        schema: createUmkmSchema,
      });

      const umkm = await this.umkmService.createUmkm(req.body, req.user.id);

      return ApiResponse.success(res, umkm, 'UMKM berhasil didaftarkan', 201);
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getUmkms = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getUmkmsQuerySchema,
      });

      const { kategori, tahap, page, limit, search } = req.query;

      const result = await this.umkmService.getUmkms({
        kategori,
        tahap,
        page,
        limit,
        search,
      });

      return ApiResponse.paginate(
        res,
        result.umkms,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data UMKM berhasil diambil'
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getMyUmkms = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getUmkmsQuerySchema,
      });

      const { kategori, tahap, page, limit, search } = req.query;

      const result = await this.umkmService.getUmkms({
        kategori,
        tahap,
        page,
        limit,
        search,
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
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getUmkmById = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getUmkmByIdSchema,
      });

      const { id } = req.params;

      const umkm = await this.umkmService.getUmkmById(
        id,
        req.user?.id,
        req.user?.role
      );

      return ApiResponse.success(res, umkm, 'Detail UMKM berhasil diambil');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  updateUmkm = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [],
        allowed: ['nama', 'kategori', 'deskripsi', 'namaPemilik', 'alamat', 'telepon'],
        schema: updateUmkmSchema,
      });

      const { id } = req.params;
      const hasAnyField = Object.keys(req.body).length > 0;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          'Minimal satu field harus diisi untuk update UMKM',
          400,
          [
            {
              field: 'body',
              message: 'Minimal satu field harus diisi',
            },
          ]
        );
      }

      const umkm = await this.umkmService.updateUmkm(id, req.body, req.user.id);

      return ApiResponse.success(res, umkm, 'UMKM berhasil diupdate');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  deleteUmkm = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: deleteUmkmSchema,
      });

      const { id } = req.params;

      const result = await this.umkmService.deleteUmkm(
        id,
        req.user.id,
        req.user.role
      );

      return ApiResponse.success(res, result, 'UMKM berhasil dihapus');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  uploadStageFiles = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: uploadStageFilesSchema,
      });

      if (!req.files || req.files.length === 0) {
        return ApiResponse.error(
          res,
          'File harus diupload',
          400,
          [
            {
              field: 'files',
              message: 'Minimal satu file harus diupload',
            },
          ]
        );
      }

      const { umkmId, tahap } = req.params;
      const fileUrls = req.files.map((file) => file.path);

      const stage = await this.umkmService.uploadStageFiles(
        umkmId,
        tahap,
        fileUrls,
        req.user.id
      );

      return ApiResponse.success(res, stage, 'File berhasil diupload');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  requestValidation = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: requestValidationSchema,
      });

      const { umkmId, tahap } = req.params;

      const stage = await this.umkmService.requestValidation(
        umkmId,
        tahap,
        req.user.id
      );

      return ApiResponse.success(res, stage, 'Request validasi berhasil dikirim');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  validateStage = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['isApproved'],
        allowed: ['isApproved', 'catatan'],
        schema: validateStageSchema,
      });

      const { umkmId, tahap } = req.params;
      const { isApproved, catatan } = req.body;

      const umkm = await this.umkmService.validateStage(
        umkmId,
        tahap,
        isApproved,
        catatan
      );

      return ApiResponse.success(
        res,
        umkm,
        isApproved ? 'Tahap berhasil divalidasi' : 'Tahap ditolak'
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getStatistics = async (req, res) => {
    try {
      const stats = await this.umkmService.getStatistics();

      return ApiResponse.success(res, stats, 'Statistik UMKM berhasil diambil');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };
}
