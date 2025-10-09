import { MarketplaceService } from '../services/MarketplaceService.js';
import { BusinessService } from '../services/BusinessService.js';
import { ApiResponse } from '../utils/response.js';

export class MarketplaceController {
  constructor() {
    this.marketplaceService = new MarketplaceService();
    this.businessService = new BusinessService();
  }

  // ========== EVENT CRUD ==========

  createEvent = async (req, res, next) => {
    try {
      const event = await this.marketplaceService.createEvent(
        req.body,
        req.user.id
      );
      return ApiResponse.success(res, event, 'Event berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  };

  getEvents = async (req, res, next) => {
    try {
      const result = await this.marketplaceService.getEvents(req.query);
      return ApiResponse.paginate(
        res,
        result.events,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data event berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getEventById = async (req, res, next) => {
    try {
      const event = await this.marketplaceService.getEventById(
        req.params.id,
        req.user?.id,
        req.user?.role
      );
      return ApiResponse.success(res, event, 'Detail event berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  updateEvent = async (req, res, next) => {
    try {
      const event = await this.marketplaceService.updateEvent(
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, event, 'Event berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  deleteEvent = async (req, res, next) => {
    try {
      const result = await this.marketplaceService.deleteEvent(req.params.id);
      return ApiResponse.success(res, result, 'Event berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };

  lockEvent = async (req, res, next) => {
    try {
      const event = await this.marketplaceService.lockEvent(req.params.id);
      return ApiResponse.success(res, event, 'Event berhasil dikunci');
    } catch (error) {
      next(error);
    }
  };

  unlockEvent = async (req, res, next) => {
    try {
      const event = await this.marketplaceService.unlockEvent(req.params.id);
      return ApiResponse.success(res, event, 'Event berhasil dibuka kembali');
    } catch (error) {
      next(error);
    }
  };

  uploadLayout = async (req, res, next) => {
    try {
      if (!req.file) {
        const error = new Error('File layout harus diupload');
        error.statusCode = 400;
        throw error;
      }

      const event = await this.marketplaceService.uploadLayout(
        req.params.id,
        req.file.path
      );
      return ApiResponse.success(res, event, 'Layout berhasil diupload');
    } catch (error) {
      next(error);
    }
  };

  // ========== SPONSOR ==========

  addSponsor = async (req, res, next) => {
    try {
      const sponsor = await this.marketplaceService.addSponsor(
        req.params.eventId,
        req.body
      );
      return ApiResponse.success(
        res,
        sponsor,
        'Sponsor berhasil ditambahkan',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  updateSponsor = async (req, res, next) => {
    try {
      const sponsor = await this.marketplaceService.updateSponsor(
        req.params.sponsorId,
        req.body
      );
      return ApiResponse.success(res, sponsor, 'Sponsor berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  deleteSponsor = async (req, res, next) => {
    try {
      const result = await this.marketplaceService.deleteSponsor(
        req.params.sponsorId
      );
      return ApiResponse.success(res, result, 'Sponsor berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };

  // ========== BUSINESS/PESERTA ==========

  registerBusiness = async (req, res, next) => {
    try {
      const business = await this.businessService.registerBusiness(
        req.body,
        req.params.eventId,
        req.user.id
      );
      return ApiResponse.success(res, business, 'Pendaftaran berhasil', 201);
    } catch (error) {
      next(error);
    }
  };

  getBusinessesByEvent = async (req, res, next) => {
    try {
      const businesses = await this.businessService.getBusinessesByEvent(
        req.params.eventId,
        req.query
      );
      return ApiResponse.success(
        res,
        businesses,
        'Data peserta berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  approveBusiness = async (req, res, next) => {
    try {
      const business = await this.businessService.approveBusiness(
        req.params.businessId,
        req.user.id
      );
      return ApiResponse.success(res, business, 'Peserta berhasil disetujui');
    } catch (error) {
      next(error);
    }
  };

  assignBoothNumber = async (req, res, next) => {
    try {
      const business = await this.businessService.assignBoothNumber(
        req.params.businessId,
        req.body.nomorBooth
      );
      return ApiResponse.success(
        res,
        business,
        'Nomor booth berhasil ditetapkan'
      );
    } catch (error) {
      next(error);
    }
  };
}
