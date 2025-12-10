import { FakultasService } from '../services/FakultasService.js';
import { ApiResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validators.js';
import {
  createFakultasSchema,
  updateFakultasSchema,
  createProdiSchema,
  updateProdiSchema,
  getFakultasByIdSchema,
  getProdiByIdSchema,
} from '../schemas/fakultas.schema.js';

export class FakultasController {
  constructor() {
    this.fakultasService = new FakultasService();
  }

  // ========== FAKULTAS ==========

  getAllFakultas = async (req, res) => {
    try {
      const fakultas = await this.fakultasService.getAllFakultas();

      return ApiResponse.success(
        res,
        fakultas,
        'Data fakultas berhasil diambil'
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

  getFakultasById = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getFakultasByIdSchema,
      });

      const { id } = req.params;
      const fakultas = await this.fakultasService.getFakultasById(id);

      return ApiResponse.success(
        res,
        fakultas,
        'Detail fakultas berhasil diambil'
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

  createFakultas = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['kode', 'nama'],
        allowed: ['kode', 'nama'],
        schema: createFakultasSchema,
      });

      const fakultas = await this.fakultasService.createFakultas(req.body);

      return ApiResponse.success(
        res,
        fakultas,
        'Fakultas berhasil ditambahkan',
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

  updateFakultas = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [],
        allowed: ['kode', 'nama'],
        schema: updateFakultasSchema,
      });

      const { id } = req.params;
      const hasAnyField = Object.keys(req.body).length > 0;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          'Minimal satu field harus diisi untuk update',
          400,
          [{ field: 'body', message: 'Minimal satu field harus diisi' }]
        );
      }

      const fakultas = await this.fakultasService.updateFakultas(id, req.body);

      return ApiResponse.success(res, fakultas, 'Fakultas berhasil diupdate');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  deleteFakultas = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getFakultasByIdSchema,
      });

      const { id } = req.params;
      const result = await this.fakultasService.deleteFakultas(id);

      return ApiResponse.success(res, result, 'Fakultas berhasil dihapus');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  // ========== PRODI ==========

  getAllProdi = async (req, res) => {
    try {
      const { fakultasId } = req.query;
      const prodi = await this.fakultasService.getAllProdi(fakultasId);

      return ApiResponse.success(
        res,
        prodi,
        'Data program studi berhasil diambil'
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

  getProdiById = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getProdiByIdSchema,
      });

      const { id } = req.params;
      const prodi = await this.fakultasService.getProdiById(id);

      return ApiResponse.success(
        res,
        prodi,
        'Detail program studi berhasil diambil'
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

  getProdiByFakultas = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getFakultasByIdSchema,
      });

      const { id } = req.params;
      const prodi = await this.fakultasService.getProdiByFakultas(id);

      return ApiResponse.success(
        res,
        prodi,
        'Data program studi berhasil diambil'
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

  createProdi = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['nama', 'fakultasId'],
        allowed: ['nama', 'fakultasId'],
        schema: createProdiSchema,
      });

      const prodi = await this.fakultasService.createProdi(req.body);

      return ApiResponse.success(
        res,
        prodi,
        'Program studi berhasil ditambahkan',
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

  updateProdi = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [],
        allowed: ['nama', 'fakultasId'],
        schema: updateProdiSchema,
      });

      const { id } = req.params;
      const hasAnyField = Object.keys(req.body).length > 0;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          'Minimal satu field harus diisi untuk update',
          400,
          [{ field: 'body', message: 'Minimal satu field harus diisi' }]
        );
      }

      const prodi = await this.fakultasService.updateProdi(id, req.body);

      return ApiResponse.success(res, prodi, 'Program studi berhasil diupdate');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  deleteProdi = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getProdiByIdSchema,
      });

      const { id } = req.params;
      const result = await this.fakultasService.deleteProdi(id);

      return ApiResponse.success(res, result, 'Program studi berhasil dihapus');
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
