import { MarketplaceService } from '../services/MarketplaceService.js';
import { ApiResponse } from '../utils/response.js';

export class MarketplaceController {
  constructor() {
    this.service = new MarketplaceService();
  }

  list = async (req, res, next) => {
    try {
      const result = await this.service.list(req.query);
      return ApiResponse.paginate(res, result.items, result.page, result.limit, result.total, 'Daftar event berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  detail = async (req, res, next) => {
    try {
      const event = await this.service.getById(req.params.id);
      return ApiResponse.success(res, { event }, 'Detail event berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const event = await this.service.create(req.body);
      return ApiResponse.success(res, { event }, 'Event berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const event = await this.service.update(req.params.id, req.body);
      return ApiResponse.success(res, { event }, 'Event berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const result = await this.service.remove(req.params.id);
      return ApiResponse.success(res, result, 'Event berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };

  lock = async (req, res, next) => {
    try {
      const result = await this.service.lock(req.params.id);
      return ApiResponse.success(res, result, 'Event berhasil dikunci');
    } catch (error) {
      next(error);
    }
  };

  unlock = async (req, res, next) => {
    try {
      const result = await this.service.unlock(req.params.id);
      return ApiResponse.success(res, result, 'Event berhasil dibuka kunci');
    } catch (error) {
      next(error);
    }
  };

  uploadLayout = async (req, res, next) => {
    try {
      // multer + cloudinary already stored the file, get url from req.file.path
      if (!req.file?.path) {
        const err = new Error('File layout tidak ditemukan');
        err.statusCode = 400;
        throw err;
      }
      const result = await this.service.setLayoutImage(req.params.id, req.file.path);
      return ApiResponse.success(res, result, 'Layout berhasil diupload');
    } catch (error) {
      next(error);
    }
  };
}