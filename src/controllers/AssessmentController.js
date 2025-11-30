import { AssessmentService } from '../services/AssessmentService.js';
import { ApiResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validators.js';
import {
  createKategoriSchema,
  getKategoriByEventSchema,
  getKategoriByIdSchema,
  updateKategoriSchema,
  deleteKategoriSchema,
  submitScoreSchema,
  getScoresByKategoriSchema,
  setWinnerSchema,
  getMentoredBusinessesSchema,
  approveMentoredBusinessSchema,
} from '../schemas/assessment.schema.js';

export class AssessmentController {
  constructor() {
    this.assessmentService = new AssessmentService();
  }

  createKategori = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['nama', 'penilaiIds', 'kriteria'],
        allowed: ['nama', 'deskripsi', 'penilaiIds', 'kriteria'],
        schema: createKategoriSchema,
      });

      const { eventId } = req.params;

      const kategori = await this.assessmentService.createKategori(
        eventId,
        req.body
      );

      return ApiResponse.success(
        res,
        kategori,
        'Kategori penilaian berhasil dibuat',
        201
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

  getKategoriByEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getKategoriByEventSchema,
      });

      const { eventId } = req.params;

      const kategori = await this.assessmentService.getKategoriByEvent(eventId);

      return ApiResponse.success(
        res,
        kategori,
        'Data kategori penilaian berhasil diambil'
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

  getKategoriById = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getKategoriByIdSchema,
      });

      const { kategoriId } = req.params;

      const kategori = await this.assessmentService.getKategoriById(kategoriId);

      return ApiResponse.success(
        res,
        kategori,
        'Detail kategori penilaian berhasil diambil'
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

  updateKategori = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [],
        allowed: ['nama', 'deskripsi', 'penilaiIds'],
        schema: updateKategoriSchema,
      });

      const { kategoriId } = req.params;
      const hasAnyField = Object.keys(req.body).length > 0;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          'Minimal satu field harus diisi untuk update kategori',
          400,
          [
            {
              field: 'body',
              message: 'Minimal satu field (nama, deskripsi, atau penilaiIds) harus diisi',
            },
          ]
        );
      }

      const kategori = await this.assessmentService.updateKategori(
        kategoriId,
        req.body
      );

      return ApiResponse.success(
        res,
        kategori,
        'Kategori penilaian berhasil diupdate'
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

  deleteKategori = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: deleteKategoriSchema,
      });

      const { kategoriId } = req.params;

      const result = await this.assessmentService.deleteKategori(kategoriId);

      return ApiResponse.success(
        res,
        result,
        'Kategori penilaian berhasil dihapus'
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

  submitScore = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['usahaId', 'kategoriId', 'kriteriaId', 'nilai'],
        allowed: ['usahaId', 'kategoriId', 'kriteriaId', 'nilai'],
        schema: submitScoreSchema,
      });

      const score = await this.assessmentService.submitScore(
        req.body,
        req.user.id
      );

      return ApiResponse.success(res, score, 'Nilai berhasil disimpan');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getScoresByKategori = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getScoresByKategoriSchema,
      });

      const { kategoriId } = req.params;

      const result = await this.assessmentService.getScoresByKategori(kategoriId);

      return ApiResponse.success(res, result, 'Data nilai berhasil diambil');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  setWinner = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['usahaId'],
        allowed: ['usahaId'],
        schema: setWinnerSchema,
      });

      const { kategoriId } = req.params;
      const { usahaId } = req.body;

      const kategori = await this.assessmentService.setWinner(kategoriId, usahaId);

      return ApiResponse.success(res, kategori, 'Pemenang berhasil ditetapkan');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getKategoriByDosen = async (req, res) => {
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
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getMentoredBusinesses = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getMentoredBusinessesSchema,
      });

      const { eventId } = req.query;

      const businesses = await this.assessmentService.getMentoredBusinesses(
        req.user.id,
        eventId
      );

      return ApiResponse.success(
        res,
        businesses,
        'Data usaha bimbingan berhasil diambil'
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

  approveMentoredBusiness = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: approveMentoredBusinessSchema,
      });

      const { businessId } = req.params;

      const business = await this.assessmentService.approveMentoredBusiness(
        businessId,
        req.user.id
      );

      return ApiResponse.success(
        res,
        business,
        'Usaha mahasiswa berhasil disetujui'
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
}
