import { prisma } from '../config/index.js';

export class MarketplaceService {
  // ========== EVENT CRUD ==========

  async createEvent(data, adminId) {
    const {
      nama,
      deskripsi,
      semester,
      tahunAjaran,
      lokasi,
      tanggalPelaksanaan,
      mulaiPendaftaran,
      akhirPendaftaran,
      kuotaPeserta,
      sponsor,
      kategoriPenilaian,
    } = data;

    // Validate dates
    const eventDate = new Date(tanggalPelaksanaan);
    const regStart = new Date(mulaiPendaftaran);
    const regEnd = new Date(akhirPendaftaran);

    if (regStart >= regEnd) {
      const error = new Error(
        'Tanggal mulai pendaftaran harus sebelum tanggal akhir'
      );
      error.statusCode = 400;
      throw error;
    }

    if (regEnd >= eventDate) {
      const error = new Error(
        'Tanggal akhir pendaftaran harus sebelum tanggal pelaksanaan'
      );
      error.statusCode = 400;
      throw error;
    }

    // Create event with sponsors and assessment categories
    const event = await prisma.eventMarketplace.create({
      data: {
        nama,
        deskripsi,
        semester,
        tahunAjaran,
        lokasi,
        tanggalPelaksanaan: eventDate,
        mulaiPendaftaran: regStart,
        akhirPendaftaran: regEnd,
        kuotaPeserta: parseInt(kuotaPeserta),
        status: 'TERBUKA',
        sponsor: sponsor
          ? {
              create: sponsor.map((s) => ({
                nama: s.nama,
                logo: s.logo,
              })),
            }
          : undefined,
        kategoriPenilaian: kategoriPenilaian
          ? {
              create: kategoriPenilaian.map((k) => ({
                nama: k.nama,
                deskripsi: k.deskripsi,
                penilai: {
                  connect: k.penilaiIds.map((id) => ({ id })),
                },
                kriteria: {
                  create: k.kriteria.map((kr) => ({
                    nama: kr.nama,
                    bobot: parseInt(kr.bobot),
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        sponsor: true,
        kategoriPenilaian: {
          include: {
            penilai: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
            kriteria: true,
          },
        },
      },
    });

    return event;
  }

  async getEvents(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      semester,
      tahunAjaran,
      search,
    } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (semester) {
      where.semester = semester;
    }

    if (tahunAjaran) {
      where.tahunAjaran = tahunAjaran;
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
        { lokasi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.eventMarketplace.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          sponsor: true,
          kategoriPenilaian: {
            include: {
              penilai: {
                select: {
                  id: true,
                  nama: true,
                },
              },
            },
          },
          _count: {
            select: {
              usaha: true,
            },
          },
        },
      }),
      prisma.eventMarketplace.count({ where }),
    ]);

    return {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getEventById(eventId, userId = null, userRole = null) {
    const event = await prisma.eventMarketplace.findUnique({
      where: { id: eventId },
      include: {
        sponsor: true,
        kategoriPenilaian: {
          include: {
            penilai: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
            kriteria: true,
            pemenang: {
              select: {
                id: true,
                namaProduk: true,
                tipeUsaha: true,
              },
            },
          },
        },
        usaha: {
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
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) {
      const error = new Error('Event tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Filter data based on role and event status
    if (userRole !== 'ADMIN' && event.status === 'DRAFT') {
      const error = new Error('Event tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return event;
  }

  async updateEvent(eventId, data) {
    // Check if event exists
    const existingEvent = await prisma.eventMarketplace.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      const error = new Error('Event tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    if (existingEvent.terkunci) {
      const error = new Error('Event sudah terkunci, tidak dapat diubah');
      error.statusCode = 400;
      throw error;
    }

    const {
      nama,
      deskripsi,
      semester,
      tahunAjaran,
      lokasi,
      tanggalPelaksanaan,
      mulaiPendaftaran,
      akhirPendaftaran,
      kuotaPeserta,
      status,
    } = data;

    const event = await prisma.eventMarketplace.update({
      where: { id: eventId },
      data: {
        nama,
        deskripsi,
        semester,
        tahunAjaran,
        lokasi,
        tanggalPelaksanaan: tanggalPelaksanaan
          ? new Date(tanggalPelaksanaan)
          : undefined,
        mulaiPendaftaran: mulaiPendaftaran
          ? new Date(mulaiPendaftaran)
          : undefined,
        akhirPendaftaran: akhirPendaftaran
          ? new Date(akhirPendaftaran)
          : undefined,
        kuotaPeserta: kuotaPeserta ? parseInt(kuotaPeserta) : undefined,
        status,
      },
      include: {
        sponsor: true,
        kategoriPenilaian: {
          include: {
            kriteria: true,
            penilai: true,
          },
        },
      },
    });

    return event;
  }

  async deleteEvent(eventId) {
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

    if (event._count.usaha > 0) {
      const error = new Error(
        'Event tidak dapat dihapus karena sudah ada peserta terdaftar'
      );
      error.statusCode = 400;
      throw error;
    }

    await prisma.eventMarketplace.delete({
      where: { id: eventId },
    });

    return { message: 'Event berhasil dihapus' };
  }

  async lockEvent(eventId) {
    const event = await prisma.eventMarketplace.findUnique({
      where: { id: eventId },
      include: {
        usaha: {
          where: { disetujui: true },
        },
      },
    });

    if (!event) {
      const error = new Error('Event tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Validate all approved businesses have booth numbers
    const businessesWithoutBooth = event.usaha.filter((u) => !u.nomorBooth);

    if (businessesWithoutBooth.length > 0) {
      const error = new Error(
        'Semua peserta yang disetujui harus memiliki nomor booth sebelum mengunci event'
      );
      error.statusCode = 400;
      throw error;
    }

    const updatedEvent = await prisma.eventMarketplace.update({
      where: { id: eventId },
      data: { terkunci: true },
    });

    return updatedEvent;
  }

  async unlockEvent(eventId) {
    const updatedEvent = await prisma.eventMarketplace.update({
      where: { id: eventId },
      data: { terkunci: false },
    });

    return updatedEvent;
  }

  async uploadLayout(eventId, layoutUrl) {
    const event = await prisma.eventMarketplace.update({
      where: { id: eventId },
      data: { gambarLayout: layoutUrl },
    });

    return event;
  }

  // ========== SPONSOR MANAGEMENT ==========

  async addSponsor(eventId, sponsorData) {
    const sponsor = await prisma.sponsor.create({
      data: {
        nama: sponsorData.nama,
        logo: sponsorData.logo,
        eventId,
      },
    });

    return sponsor;
  }

  async updateSponsor(sponsorId, data) {
    const sponsor = await prisma.sponsor.update({
      where: { id: sponsorId },
      data: {
        nama: data.nama,
        logo: data.logo,
      },
    });

    return sponsor;
  }

  async deleteSponsor(sponsorId) {
    await prisma.sponsor.delete({
      where: { id: sponsorId },
    });

    return { message: 'Sponsor berhasil dihapus' };
  }
}
