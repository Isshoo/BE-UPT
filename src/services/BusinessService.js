import { prisma } from '../config/index.js';
import { NotificationService } from './NotificationService.js';

export class BusinessService {
  constructor() {
    this.notificationService = new NotificationService();
  }
  async registerBusiness(data, eventId, userId) {
    try {
      const { tipeUsaha, ...businessData } = data;

      // Validasi: Cek apakah event ada dan terbuka
      const event = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: { usaha: true },
          },
        },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      if (event.status !== 'TERBUKA') {
        const error = new Error('Pendaftaran sudah ditutup');
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Cek kuota
      if (event._count.usaha >= event.kuotaPeserta) {
        const error = new Error('Kuota peserta sudah penuh');
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Cek apakah user sudah terdaftar
      const existingBusiness = await prisma.usaha.findFirst({
        where: {
          eventId,
          pemilikId: userId,
        },
      });

      if (existingBusiness) {
        const error = new Error('Anda sudah terdaftar di event ini');
        error.statusCode = 409;
        throw error;
      }

      // validasi nama produk tidak boleh sama dengan nama produk lain
      const existingProductName = await prisma.usaha.findFirst({
        where: { namaProduk: businessData.namaProduk.trim(), eventId },
      });
      if (existingProductName) {
        const error = new Error(
          'Nama produk sudah ada. Silakan gunakan nama lain.'
        );
        error.statusCode = 400;
        throw error;
      }

      // Create business
      const business = await prisma.usaha.create({
        data: {
          namaProduk: businessData.namaProduk.trim(),
          kategori: businessData.kategori.trim(),
          deskripsi: businessData.deskripsi.trim(),
          tipeUsaha,
          telepon: businessData.telepon.trim(),
          eventId,
          pemilikId: userId,
          // Mahasiswa specific
          ...(tipeUsaha === 'MAHASISWA' && {
            anggota: businessData.anggota,
            ketuaId: businessData.ketuaId,
            fakultasId: businessData.fakultasId || null,
            prodiId: businessData.prodiId || null,
            pembimbingId: businessData.pembimbingId || null,
            mataKuliah: businessData.mataKuliah?.trim() || null,
          }),
          // UMKM Luar specific
          ...(tipeUsaha === 'UMKM_LUAR' && {
            namaPemilik: businessData.namaPemilik?.trim() || null,
            alamat: businessData.alamat?.trim() || null,
          }),
        },
        include: {
          pemilik: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          pembimbing: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          fakultas: {
            select: {
              id: true,
              kode: true,
              nama: true,
            },
          },
          prodi: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      });

      // Create marketplace history
      await prisma.riwayatMarketplace.create({
        data: {
          userId,
          eventId,
          usahaId: business.id,
        },
      });

      // Create notification for dosen (if mahasiswa) or admin (if umkm luar)
      await this.notificationService.notifyBusinessRegistered(business.id);

      return business;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getBusinessesByEvent(eventId, filters = {}) {
    try {
      // Validasi: Cek apakah event ada
      const event = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const { tipeUsaha, status, search } = filters;

      const where = { eventId };

      if (tipeUsaha) {
        where.tipeUsaha = tipeUsaha;
      }

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { namaProduk: { contains: search, mode: 'insensitive' } },
          { kategori: { contains: search, mode: 'insensitive' } },
        ];
      }

      const businesses = await prisma.usaha.findMany({
        where,
        include: {
          pemilik: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          pembimbing: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          fakultas: {
            select: {
              id: true,
              kode: true,
              nama: true,
            },
          },
          prodi: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return businesses;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async approveBusiness(businessId, adminId) {
    try {
      // Validasi: Cek apakah business ada
      const business = await prisma.usaha.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        const error = new Error('Usaha tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah sudah disetujui
      if (business.status === 'DISETUJUI') {
        const error = new Error('Usaha sudah disetujui sebelumnya');
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Cek apakah status masih PENDING
      if (business.status !== 'PENDING') {
        const error = new Error(
          'Hanya usaha dengan status PENDING yang dapat disetujui'
        );
        error.statusCode = 400;
        throw error;
      }

      // Update business
      const updatedBusiness = await prisma.usaha.update({
        where: { id: businessId },
        data: {
          status: 'DISETUJUI',
          tanggalDisetujui: new Date(),
        },
        include: {
          pemilik: true,
        },
      });

      // Notify user about approval
      await this.notificationService.notifyBusinessApproved(updatedBusiness.id);

      return updatedBusiness;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async assignBoothNumber(businessId, nomorBooth) {
    try {
      // Validasi: Cek apakah business ada
      const business = await prisma.usaha.findUnique({
        where: { id: businessId },
        include: { event: true },
      });

      if (!business) {
        const error = new Error('Usaha tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah sudah disetujui
      if (business.status !== 'DISETUJUI') {
        const error = new Error('Usaha harus disetujui terlebih dahulu');
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Cek apakah nomor booth sudah digunakan
      const existingBooth = await prisma.usaha.findFirst({
        where: {
          eventId: business.eventId,
          nomorBooth: nomorBooth.trim(),
          id: { not: businessId },
        },
      });

      if (existingBooth) {
        const error = new Error('Nomor booth sudah digunakan');
        error.statusCode = 409;
        throw error;
      }

      // Update business
      const updatedBusiness = await prisma.usaha.update({
        where: { id: businessId },
        data: { nomorBooth: nomorBooth.trim() },
      });

      return updatedBusiness;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async rejectBusiness(businessId, alasan, adminId) {
    try {
      // Validasi: Cek apakah business ada
      const business = await prisma.usaha.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        const error = new Error('Usaha tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah status masih PENDING
      if (business.status !== 'PENDING') {
        const error = new Error(
          'Hanya usaha dengan status PENDING yang dapat ditolak'
        );
        error.statusCode = 400;
        throw error;
      }

      // Update business
      const updatedBusiness = await prisma.usaha.update({
        where: { id: businessId },
        data: {
          status: 'DITOLAK',
          alasanPenolakan: alasan?.trim() || null,
        },
        include: {
          pemilik: true,
        },
      });

      // Notify user about rejection
      await this.notificationService.notifyBusinessRejected(updatedBusiness.id);

      return updatedBusiness;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async cancelRegistration(businessId, userId) {
    try {
      // Validasi: Cek apakah business ada
      const business = await prisma.usaha.findUnique({
        where: { id: businessId },
        include: {
          event: true,
        },
      });

      if (!business) {
        const error = new Error('Usaha tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah user adalah pemilik
      if (business.pemilikId !== userId) {
        const error = new Error(
          'Anda tidak memiliki akses untuk membatalkan pendaftaran ini'
        );
        error.statusCode = 403;
        throw error;
      }

      // Validasi: Cek apakah status masih PENDING
      if (business.status !== 'PENDING') {
        const error = new Error(
          'Hanya pendaftaran dengan status PENDING yang dapat dibatalkan'
        );
        error.statusCode = 400;
        throw error;
      }

      // Delete the business registration
      await prisma.usaha.delete({
        where: { id: businessId },
      });

      // Delete related riwayat
      await prisma.riwayatMarketplace.deleteMany({
        where: { usahaId: businessId },
      });

      return { success: true, message: 'Pendaftaran berhasil dibatalkan' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }
}
