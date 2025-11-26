import { prisma } from '../config/index.js';
import { NotificationService } from './NotificationService.js';

export class BusinessService {
  constructor() {
    this.notificationService = new NotificationService();
  }
  async registerBusiness(data, eventId, userId) {
    const { tipeUsaha, ...businessData } = data;

    // Check if event exists and open
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

    // Check registration period
    const now = new Date();
    // if (now < event.mulaiPendaftaran || now > event.akhirPendaftaran) {
    //   const error = new Error('Belum/sudah melewati periode pendaftaran');
    //   error.statusCode = 400;
    //   throw error;
    // }

    // Check quota
    if (event._count.usaha >= event.kuotaPeserta) {
      const error = new Error('Kuota peserta sudah penuh');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already registered
    const existingBusiness = await prisma.usaha.findFirst({
      where: {
        eventId,
        pemilikId: userId,
      },
    });

    if (existingBusiness) {
      const error = new Error('Anda sudah terdaftar di event ini');
      error.statusCode = 400;
      throw error;
    }

    // Create business
    const business = await prisma.usaha.create({
      data: {
        namaProduk: businessData.namaProduk,
        kategori: businessData.kategori,
        deskripsi: businessData.deskripsi,
        tipeUsaha,
        telepon: businessData.telepon,
        eventId,
        pemilikId: userId,
        // Mahasiswa specific
        ...(tipeUsaha === 'MAHASISWA' && {
          anggota: businessData.anggota,
          ketuaId: businessData.ketuaId,
          fakultas: businessData.fakultas,
          prodi: businessData.prodi,
          pembimbingId: businessData.pembimbingId,
          mataKuliah: businessData.mataKuliah,
        }),
        // UMKM Luar specific
        ...(tipeUsaha === 'UMKM_LUAR' && {
          namaPemilik: businessData.namaPemilik,
          alamat: businessData.alamat,
          disetujui: false, // Admin approval needed
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

    //Create notification for dosen (if mahasiswa) or admin (if umkm luar)
    await this.notificationService.notifyBusinessRegistered(business.id);

    return business;
  }

  async getBusinessesByEvent(eventId, filters = {}) {
    const { tipeUsaha, disetujui, search } = filters;

    const where = { eventId };

    if (tipeUsaha) {
      where.tipeUsaha = tipeUsaha;
    }

    if (disetujui !== undefined) {
      where.disetujui = disetujui === 'true';
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return businesses;
  }

  async approveBusiness(businessId, adminId) {
    const business = await prisma.usaha.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      const error = new Error('Usaha tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    if (business.disetujui) {
      const error = new Error('Usaha sudah disetujui sebelumnya');
      error.statusCode = 400;
      throw error;
    }

    const updatedBusiness = await prisma.usaha.update({
      where: { id: businessId },
      data: {
        disetujui: true,
        tanggalDisetujui: new Date(),
      },
      include: {
        pemilik: true,
      },
    });

    // Notify user about approval
    await this.notificationService.notifyBusinessApproved(updatedBusiness.id);

    return updatedBusiness;
  }

  async assignBoothNumber(businessId, nomorBooth) {
    // Check if booth number already used
    const business = await prisma.usaha.findUnique({
      where: { id: businessId },
      include: { event: true },
    });

    if (!business) {
      const error = new Error('Usaha tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    if (!business.disetujui) {
      const error = new Error('Usaha harus disetujui terlebih dahulu');
      error.statusCode = 400;
      throw error;
    }

    const existingBooth = await prisma.usaha.findFirst({
      where: {
        eventId: business.eventId,
        nomorBooth,
        id: { not: businessId },
      },
    });

    if (existingBooth) {
      const error = new Error('Nomor booth sudah digunakan');
      error.statusCode = 400;
      throw error;
    }

    const updatedBusiness = await prisma.usaha.update({
      where: { id: businessId },
      data: { nomorBooth },
    });

    return updatedBusiness;
  }
}
