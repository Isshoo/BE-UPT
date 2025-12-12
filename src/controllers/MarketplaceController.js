import { MarketplaceService } from '../services/MarketplaceService.js';
import { BusinessService } from '../services/BusinessService.js';
import { ApiResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validators.js';
import {
  getEventsQuerySchema,
  getEventByIdSchema,
  createEventSchema,
  updateEventSchema,
  lockUnlockEventSchema,
  uploadLayoutSchema,
  addSponsorSchema,
  updateSponsorSchema,
  deleteSponsorSchema,
  uploadCoverSchema,
} from '../schemas/marketplace.schema.js';
import {
  getBusinessesByEventSchema,
  approveBusinessSchema,
  assignBoothNumberSchema,
  registerBusinessSchema,
} from '../schemas/business.schema.js';

export class MarketplaceController {
  constructor() {
    this.marketplaceService = new MarketplaceService();
    this.businessService = new BusinessService();
  }

  createEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [
          'nama',
          'deskripsi',
          'semester',
          'tahunAjaran',
          'lokasi',
          'tanggalPelaksanaan',
          'kuotaPeserta',
        ],
        allowed: [
          'nama',
          'deskripsi',
          'semester',
          'tahunAjaran',
          'lokasi',
          'tanggalPelaksanaan',
          'kuotaPeserta',
          'sponsor',
          'kategoriPenilaian',
        ],
        schema: createEventSchema,
      });

      const event = await this.marketplaceService.createEvent(
        req.body,
        req.user.id
      );
      return ApiResponse.success(res, event, 'Event berhasil dibuat', 201);
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getEvents = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getEventsQuerySchema,
      });

      const { status, semester, tahunAjaran, page, limit, search } = req.query;

      const result = await this.marketplaceService.getEvents({
        status,
        semester,
        tahunAjaran,
        page,
        limit,
        search,
      });

      return ApiResponse.paginate(
        res,
        result.events,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data event berhasil diambil'
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

  getEventById = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getEventByIdSchema,
      });

      const { id } = req.params;

      const event = await this.marketplaceService.getEventById(
        id,
        req.user?.id,
        req.user?.role
      );

      return ApiResponse.success(res, event, 'Detail event berhasil diambil');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  updateEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [],
        allowed: [
          'nama',
          'deskripsi',
          'semester',
          'tahunAjaran',
          'lokasi',
          'tanggalPelaksanaan',
          'kuotaPeserta',
          'status',
        ],
        schema: updateEventSchema,
      });

      const { id } = req.params;
      const hasAnyField = Object.keys(req.body).length > 0;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          'Minimal satu field harus diisi untuk update event',
          400,
          [
            {
              field: 'body',
              message: 'Minimal satu field harus diisi',
            },
          ]
        );
      }

      const event = await this.marketplaceService.updateEvent(id, req.body);

      return ApiResponse.success(res, event, 'Event berhasil diupdate');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  deleteEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getEventByIdSchema,
      });

      const { id } = req.params;

      const result = await this.marketplaceService.deleteEvent(id);

      return ApiResponse.success(res, result, 'Event berhasil dihapus');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  lockEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: lockUnlockEventSchema,
      });

      const { id } = req.params;

      const event = await this.marketplaceService.lockEvent(id);

      return ApiResponse.success(res, event, 'Event berhasil dikunci');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  unlockEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: lockUnlockEventSchema,
      });

      const { id } = req.params;

      const event = await this.marketplaceService.unlockEvent(id);

      return ApiResponse.success(res, event, 'Event berhasil dibuka kembali');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  uploadLayout = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: uploadLayoutSchema,
      });

      if (!req.file) {
        return ApiResponse.error(res, 'File layout harus diupload', 400, [
          {
            field: 'layout',
            message: 'File layout harus diupload',
          },
        ]);
      }

      const { id } = req.params;

      const event = await this.marketplaceService.uploadLayout(
        id,
        req.file.path
      );

      return ApiResponse.success(res, event, 'Layout berhasil diupload');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  uploadCover = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: uploadCoverSchema,
      });

      if (!req.file) {
        return ApiResponse.error(res, 'File cover harus diupload', 400, [
          {
            field: 'cover',
            message: 'File cover harus diupload',
          },
        ]);
      }

      const { id } = req.params;

      const event = await this.marketplaceService.uploadCover(
        id,
        req.file.path
      );

      return ApiResponse.success(res, event, 'Cover berhasil diupload');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  addSponsor = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['nama', 'logo'],
        allowed: ['nama', 'logo'],
        schema: addSponsorSchema,
      });

      const { eventId } = req.params;
      const { nama, logo } = req.body;

      const sponsor = await this.marketplaceService.addSponsor(eventId, {
        nama,
        logo,
      });

      return ApiResponse.success(
        res,
        sponsor,
        'Sponsor berhasil ditambahkan',
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

  updateSponsor = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [],
        allowed: ['nama', 'logo'],
        schema: updateSponsorSchema,
      });

      const { sponsorId } = req.params;
      const hasAnyField = Object.keys(req.body).length > 0;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          'Minimal satu field harus diisi untuk update sponsor',
          400,
          [
            {
              field: 'body',
              message: 'Minimal satu field (nama atau logo) harus diisi',
            },
          ]
        );
      }

      const sponsor = await this.marketplaceService.updateSponsor(
        sponsorId,
        req.body
      );

      return ApiResponse.success(res, sponsor, 'Sponsor berhasil diupdate');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  deleteSponsor = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: deleteSponsorSchema,
      });

      const { sponsorId } = req.params;

      const result = await this.marketplaceService.deleteSponsor(sponsorId);

      return ApiResponse.success(res, result, 'Sponsor berhasil dihapus');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  registerBusiness = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [
          'namaProduk',
          'kategori',
          'deskripsi',
          'tipeUsaha',
          'telepon',
        ],
        allowed: [
          'namaProduk',
          'kategori',
          'deskripsi',
          'tipeUsaha',
          'telepon',
          'anggota',
          'ketuaId',
          'fakultasId',
          'prodiId',
          'pembimbingId',
          'mataKuliah',
          'namaPemilik',
          'alamat',
        ],
        schema: registerBusinessSchema,
      });

      const { eventId } = req.params;

      const business = await this.businessService.registerBusiness(
        req.body,
        eventId,
        req.user.id
      );

      return ApiResponse.success(res, business, 'Pendaftaran berhasil', 201);
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getBusinessesByEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: getBusinessesByEventSchema,
      });

      const { eventId } = req.params;
      const { tipeUsaha, status, search } = req.query;

      const businesses = await this.businessService.getBusinessesByEvent(
        eventId,
        {
          tipeUsaha,
          status,
          search,
        }
      );

      return ApiResponse.success(
        res,
        businesses,
        'Data peserta berhasil diambil'
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

  approveBusiness = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: approveBusinessSchema,
      });

      const { businessId } = req.params;

      const business = await this.businessService.approveBusiness(
        businessId,
        req.user.id
      );

      return ApiResponse.success(res, business, 'Peserta berhasil disetujui');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  assignBoothNumber = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ['nomorBooth'],
        allowed: ['nomorBooth'],
        schema: assignBoothNumberSchema,
      });

      const { businessId } = req.params;
      const { nomorBooth } = req.body;

      const business = await this.businessService.assignBoothNumber(
        businessId,
        nomorBooth
      );

      return ApiResponse.success(
        res,
        business,
        'Nomor booth berhasil ditetapkan'
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

  getUserHistory = async (req, res) => {
    try {
      const history = await this.marketplaceService.getUserMarketplaceHistory(
        req.user.id
      );

      return ApiResponse.success(
        res,
        history,
        'Riwayat marketplace berhasil diambil'
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

  rejectBusiness = async (req, res) => {
    try {
      const { businessId } = req.params;
      const { alasan } = req.body;

      const business = await this.businessService.rejectBusiness(
        businessId,
        alasan,
        req.user.id
      );

      return ApiResponse.success(res, business, 'Peserta berhasil ditolak');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  cancelRegistration = async (req, res) => {
    try {
      const { businessId } = req.params;

      const result = await this.businessService.cancelRegistration(
        businessId,
        req.user.id
      );

      return ApiResponse.success(
        res,
        result,
        'Pendaftaran berhasil dibatalkan'
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
