/* eslint-disable indent */
import { prisma } from '../config/index.js';
import { NotificationService } from './NotificationService.js';
import { AssessmentService } from './AssessmentService.js';

export class MarketplaceService {
  constructor() {
    this.notificationService = new NotificationService();
    this.assessmentService = new AssessmentService();
  }
  // ========== EVENT CRUD ==========

  async createEvent(data, adminId) {
    try {
      const {
        nama,
        deskripsi,
        semester,
        tahunAjaran,
        lokasi,
        tanggalPelaksanaan,
        kuotaPeserta,
        sponsor,
        kategoriPenilaian,
      } = data;

      // Validasi: Validasi tanggal
      const eventDate = new Date(tanggalPelaksanaan);

      // validasi nama event tidak boleh sama dengan nama event lain
      const existingEvent = await prisma.eventMarketplace.findFirst({
        where: { nama: nama.trim() },
      });
      if (existingEvent) {
        const error = new Error('Nama event sudah ada');
        error.statusCode = 400;
        throw error;
      }

      // Create event with sponsors and assessment categories
      const event = await prisma.eventMarketplace.create({
        data: {
          nama: nama.trim(),
          deskripsi: deskripsi.trim(),
          semester: semester.trim(),
          tahunAjaran: tahunAjaran.trim(),
          lokasi: lokasi.trim(),
          tanggalPelaksanaan: eventDate,
          kuotaPeserta: parseInt(kuotaPeserta),
          status: 'TERBUKA',
          sponsor: sponsor
            ? {
                create: sponsor.map((s) => ({
                  nama: s.nama.trim(),
                  logo: s.logo.trim(),
                })),
              }
            : undefined,
          kategoriPenilaian: kategoriPenilaian
            ? {
                create: kategoriPenilaian.map((k) => ({
                  nama: k.nama.trim(),
                  deskripsi: k.deskripsi?.trim() || null,
                  penilai: {
                    connect: k.penilaiIds.map((id) => ({ id })),
                  },
                  kriteria: {
                    create: k.kriteria.map((kr) => ({
                      nama: kr.nama.trim(),
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

      // Trigger notification for new event
      await this.notificationService.notifyEventCreated(event.id);

      return event;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getEvents(filters = {}) {
    try {
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getEventById(eventId, userId = null, userRole = null) {
    try {
      // Validasi: Cek apakah event ada
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

      // Validasi: Filter data berdasarkan role dan event status
      if (userRole !== 'ADMIN' && event.status === 'DRAFT') {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      return event;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async updateEvent(eventId, data) {
    try {
      // Validasi: Cek apakah event ada
      const existingEvent = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
      });

      if (!existingEvent) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah event terkunci
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
        kuotaPeserta,
        status,
      } = data;

      if (nama !== undefined) {
        // validasi nama event tidak boleh sama dengan nama event lain
        const existingEventName = await prisma.eventMarketplace.findFirst({
          where: { nama: nama.trim(), id: { not: eventId } },
        });
        if (existingEventName) {
          const error = new Error(
            'Nama event sudah ada. Silakan gunakan nama lain.'
          );
          error.statusCode = 400;
          throw error;
        }
      }

      // Prepare update data (hanya field yang diisi)
      const updateData = {};
      if (nama !== undefined) updateData.nama = nama.trim();
      if (deskripsi !== undefined) updateData.deskripsi = deskripsi.trim();
      if (semester !== undefined) updateData.semester = semester.trim();
      if (tahunAjaran !== undefined)
        updateData.tahunAjaran = tahunAjaran.trim();
      if (lokasi !== undefined) updateData.lokasi = lokasi.trim();
      if (tanggalPelaksanaan !== undefined)
        updateData.tanggalPelaksanaan = new Date(tanggalPelaksanaan);
      if (kuotaPeserta !== undefined)
        updateData.kuotaPeserta = parseInt(kuotaPeserta);
      if (status !== undefined) updateData.status = status;

      const event = await prisma.eventMarketplace.update({
        where: { id: eventId },
        data: updateData,
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

      // Notify status change if status changed
      if (status && status !== existingEvent.status) {
        await this.notificationService.notifyEventStatusChanged(
          event.id,
          status
        );

        // Auto-set winners when status changes to SELESAI
        if (status === 'SELESAI') {
          try {
            const winnerResults =
              await this.assessmentService.autoSetWinnersForEvent(eventId);
            console.log('Auto-set winners results:', winnerResults);
          } catch (autoSetError) {
            console.error('Error auto-setting winners:', autoSetError);
            // Don't throw - the event update should still succeed
          }
        }
      }

      return event;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async deleteEvent(eventId) {
    try {
      // Validasi: Cek apakah event ada
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

      // Validasi: Cegah penghapusan event yang memiliki peserta
      if (event._count.usaha > 0) {
        const error = new Error(
          'Event tidak dapat dihapus karena sudah ada peserta terdaftar. Silakan hapus peserta terlebih dahulu.'
        );
        error.statusCode = 400;
        throw error;
      }

      // Delete event
      await prisma.eventMarketplace.delete({
        where: { id: eventId },
      });

      return { message: 'Event berhasil dihapus' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async lockEvent(eventId) {
    try {
      // Validasi: Cek apakah event ada
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

      // Validasi: Semua peserta yang disetujui harus memiliki nomor booth
      const businessesWithoutBooth = event.usaha.filter((u) => !u.nomorBooth);

      if (businessesWithoutBooth.length > 0) {
        const error = new Error(
          'Semua peserta yang disetujui harus memiliki nomor booth sebelum mengunci event'
        );
        error.statusCode = 400;
        throw error;
      }

      // Lock event
      const updatedEvent = await prisma.eventMarketplace.update({
        where: { id: eventId },
        data: { terkunci: true },
      });

      return updatedEvent;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async unlockEvent(eventId) {
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

      // Unlock event
      const updatedEvent = await prisma.eventMarketplace.update({
        where: { id: eventId },
        data: { terkunci: false },
      });

      return updatedEvent;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async uploadLayout(eventId, layoutUrl) {
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

      // Update layout
      const updatedEvent = await prisma.eventMarketplace.update({
        where: { id: eventId },
        data: { gambarLayout: layoutUrl },
      });

      return updatedEvent;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async uploadCover(eventId, coverUrl) {
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

      // Update cover
      const updatedEvent = await prisma.eventMarketplace.update({
        where: { id: eventId },
        data: { gambarCover: coverUrl },
      });

      return updatedEvent;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== SPONSOR MANAGEMENT ==========

  async addSponsor(eventId, sponsorData) {
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

      const { nama, logo } = sponsorData;

      // Create sponsor
      const sponsor = await prisma.sponsor.create({
        data: {
          nama: nama.trim(),
          logo: logo.trim(),
          eventId,
        },
      });

      return sponsor;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async updateSponsor(sponsorId, data) {
    try {
      // Validasi: Cek apakah sponsor ada
      const existingSponsor = await prisma.sponsor.findUnique({
        where: { id: sponsorId },
      });

      if (!existingSponsor) {
        const error = new Error('Sponsor tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Prepare update data (hanya field yang diisi)
      const updateData = {};
      if (data.nama !== undefined) updateData.nama = data.nama.trim();
      if (data.logo !== undefined) updateData.logo = data.logo.trim();

      // Update sponsor
      const sponsor = await prisma.sponsor.update({
        where: { id: sponsorId },
        data: updateData,
      });

      return sponsor;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async deleteSponsor(sponsorId) {
    try {
      // Validasi: Cek apakah sponsor ada
      const sponsor = await prisma.sponsor.findUnique({
        where: { id: sponsorId },
      });

      if (!sponsor) {
        const error = new Error('Sponsor tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Delete sponsor
      await prisma.sponsor.delete({
        where: { id: sponsorId },
      });

      return { message: 'Sponsor berhasil dihapus' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getUserMarketplaceHistory(userId) {
    try {
      // Validasi: Cek apakah user ada
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        const error = new Error('User tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Get history
      const history = await prisma.riwayatMarketplace.findMany({
        where: { userId },
        include: {
          event: {
            include: {
              sponsor: true,
              _count: {
                select: { usaha: true },
              },
            },
          },
          usaha: {
            select: {
              id: true,
              namaProduk: true,
              kategori: true,
              tipeUsaha: true,
              nomorBooth: true,
              disetujui: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return history;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }
}
