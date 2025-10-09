import { SponsorService } from '../services/SponsorService.js';
import { ApiResponse } from '../utils/response.js';

export class SponsorController {
  constructor() {
    this.service = new SponsorService();
  }

  listByEvent = async (req, res, next) => {
    try {
      const sponsors = await this.service.listByEvent(req.params.eventId);
      return ApiResponse.success(res, { sponsors }, 'Daftar sponsor berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const sponsor = await this.service.create(req.params.eventId, req.body);
      return ApiResponse.success(res, { sponsor }, 'Sponsor berhasil ditambahkan', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const sponsor = await this.service.update(req.params.id, req.body);
      return ApiResponse.success(res, { sponsor }, 'Sponsor berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const result = await this.service.remove(req.params.id);
      return ApiResponse.success(res, result, 'Sponsor berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };
}