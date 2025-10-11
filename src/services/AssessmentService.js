import { prisma } from '../config/index.js';
import { NotificationService } from './NotificationService.js';

export class AssessmentService {
  constructor() {
    this.notificationService = new NotificationService();
  }
  // ========== KATEGORI PENILAIAN ==========

  async createKategori(eventId, data) {
    const { nama, deskripsi, penilaiIds, kriteria } = data;

    // Validate total bobot = 100%
    const totalBobot = kriteria.reduce((sum, k) => sum + parseInt(k.bobot), 0);
    if (totalBobot !== 100) {
      const error = new Error('Total bobot kriteria harus 100%');
      error.statusCode = 400;
      throw error;
    }

    const kategori = await prisma.kategoriPenilaian.create({
      data: {
        nama,
        deskripsi,
        eventId,
        penilai: {
          connect: penilaiIds.map((id) => ({ id })),
        },
        kriteria: {
          create: kriteria.map((k) => ({
            nama: k.nama,
            bobot: parseInt(k.bobot),
          })),
        },
      },
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
    });

    // Notify assigned penilai
    for (const penilaiId of penilaiIds) {
      await this.notificationService.notifyAssessmentAssigned(
        kategori.id,
        penilaiId
      );
    }

    return kategori;
  }

  async getKategoriByEvent(eventId) {
    const kategori = await prisma.kategoriPenilaian.findMany({
      where: { eventId },
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
    });

    return kategori;
  }

  async getKategoriById(kategoriId) {
    const kategori = await prisma.kategoriPenilaian.findUnique({
      where: { id: kategoriId },
      include: {
        event: true,
        penilai: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        kriteria: true,
        pemenang: true,
      },
    });

    if (!kategori) {
      const error = new Error('Kategori penilaian tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return kategori;
  }

  async updateKategori(kategoriId, data) {
    const { nama, deskripsi, penilaiIds } = data;

    const kategori = await prisma.kategoriPenilaian.update({
      where: { id: kategoriId },
      data: {
        nama,
        deskripsi,
        ...(penilaiIds && {
          penilai: {
            set: penilaiIds.map((id) => ({ id })),
          },
        }),
      },
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
    });

    return kategori;
  }

  async deleteKategori(kategoriId) {
    await prisma.kategoriPenilaian.delete({
      where: { id: kategoriId },
    });

    return { message: 'Kategori penilaian berhasil dihapus' };
  }

  // ========== KRITERIA PENILAIAN ==========

  async updateKriteria(kriteriaId, data) {
    const { nama, bobot } = data;

    const kriteria = await prisma.kriteriaPenilaian.update({
      where: { id: kriteriaId },
      data: {
        nama,
        bobot: bobot ? parseInt(bobot) : undefined,
      },
    });

    return kriteria;
  }

  // ========== PENILAIAN/SCORING ==========

  async submitScore(data, penilaiId) {
    const { usahaId, kategoriId, kriteriaId, nilai } = data;

    // Validate penilai is assigned to this category
    const kategori = await prisma.kategoriPenilaian.findUnique({
      where: { id: kategoriId },
      include: {
        penilai: true,
        event: true,
      },
    });

    if (!kategori) {
      const error = new Error('Kategori penilaian tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const isPenilai = kategori.penilai.some((p) => p.id === penilaiId);
    if (!isPenilai) {
      const error = new Error(
        'Anda tidak memiliki akses untuk menilai kategori ini'
      );
      error.statusCode = 403;
      throw error;
    }

    // Check if event is ongoing
    if (kategori.event.status !== 'BERLANGSUNG') {
      const error = new Error(
        'Penilaian hanya dapat dilakukan saat event berlangsung'
      );
      error.statusCode = 400;
      throw error;
    }

    // Validate business is in this event
    const business = await prisma.usaha.findUnique({
      where: { id: usahaId },
    });

    if (!business || business.eventId !== kategori.eventId) {
      const error = new Error('Usaha tidak ditemukan dalam event ini');
      error.statusCode = 404;
      throw error;
    }

    // Validate score range (0-100)
    if (nilai < 0 || nilai > 100) {
      const error = new Error('Nilai harus antara 0-100');
      error.statusCode = 400;
      throw error;
    }

    // Upsert score
    const score = await prisma.nilaiPenilaian.upsert({
      where: {
        usahaId_kategoriId_kriteriaId: {
          usahaId,
          kategoriId,
          kriteriaId,
        },
      },
      update: {
        nilai: parseInt(nilai),
      },
      create: {
        nilai: parseInt(nilai),
        usahaId,
        kategoriId,
        kriteriaId,
        penilaiId,
      },
    });

    return score;
  }

  async getScoresByKategori(kategoriId) {
    const kategori = await prisma.kategoriPenilaian.findUnique({
      where: { id: kategoriId },
      include: {
        kriteria: true,
        event: {
          include: {
            usaha: {
              where: {
                disetujui: true,
                tipeUsaha: 'MAHASISWA', // Only mahasiswa can be assessed
              },
              include: {
                pemilik: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!kategori) {
      const error = new Error('Kategori penilaian tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Get scores for each business
    const businessesWithScores = await Promise.all(
      kategori.event.usaha.map(async (usaha) => {
        const scores = await prisma.nilaiPenilaian.findMany({
          where: {
            usahaId: usaha.id,
            kategoriId,
          },
          include: {
            kriteria: true,
          },
        });

        // Calculate total score (weighted average)
        let totalScore = 0;
        const scoreDetails = kategori.kriteria.map((kriteria) => {
          const score = scores.find((s) => s.kriteriaId === kriteria.id);
          const weightedScore = score
            ? (score.nilai * kriteria.bobot) / 100
            : 0;
          totalScore += weightedScore;

          return {
            kriteriaId: kriteria.id,
            namaKriteria: kriteria.nama,
            bobot: kriteria.bobot,
            nilai: score?.nilai || 0,
            weightedScore,
          };
        });

        return {
          usahaId: usaha.id,
          namaProduk: usaha.namaProduk,
          kategoriUsaha: usaha.kategori,
          pemilik: usaha.pemilik.nama,
          nomorBooth: usaha.nomorBooth,
          totalScore: Math.round(totalScore * 100) / 100,
          scoreDetails,
        };
      })
    );

    // Sort by total score descending
    businessesWithScores.sort((a, b) => b.totalScore - a.totalScore);

    return {
      kategori: {
        id: kategori.id,
        nama: kategori.nama,
        deskripsi: kategori.deskripsi,
      },
      kriteria: kategori.kriteria,
      businesses: businessesWithScores,
    };
  }

  async setWinner(kategoriId, usahaId) {
    // Verify business exists and is in the event
    const kategori = await prisma.kategoriPenilaian.findUnique({
      where: { id: kategoriId },
      include: { event: true },
    });

    if (!kategori) {
      const error = new Error('Kategori penilaian tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const business = await prisma.usaha.findUnique({
      where: { id: usahaId },
    });

    if (!business || business.eventId !== kategori.eventId) {
      const error = new Error('Usaha tidak ditemukan dalam event ini');
      error.statusCode = 404;
      throw error;
    }

    // Update winner
    const updatedKategori = await prisma.kategoriPenilaian.update({
      where: { id: kategoriId },
      data: {
        pemenangId: usahaId,
      },
      include: {
        pemenang: true,
      },
    });

    // Notify winner
    await this.notificationService.createNotification({
      userId: business.pemilikId,
      judul: '🎉 Selamat! Anda Menjadi Pemenang!',
      pesan: `Usaha "${business.namaProduk}" memenangkan kategori "${kategori.nama}" di event "${kategori.event.nama}"`,
      link: `/marketplace/${kategori.eventId}`,
    });

    return updatedKategori;
  }

  // ========== DOSEN SPECIFIC ==========

  async getKategoriByDosen(dosenId) {
    const kategori = await prisma.kategoriPenilaian.findMany({
      where: {
        penilai: {
          some: {
            id: dosenId,
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            nama: true,
            status: true,
            tanggalPelaksanaan: true,
          },
        },
        kriteria: true,
      },
      orderBy: {
        event: {
          tanggalPelaksanaan: 'desc',
        },
      },
    });

    return kategori;
  }

  async getMentoredBusinesses(dosenId, eventId = null) {
    const where = {
      pembimbingId: dosenId,
    };

    if (eventId) {
      where.eventId = eventId;
    }

    const businesses = await prisma.usaha.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            nama: true,
            status: true,
            tanggalPelaksanaan: true,
          },
        },
        pemilik: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
      orderBy: {
        event: {
          tanggalPelaksanaan: 'desc',
        },
      },
    });

    return businesses;
  }

  async approveMentoredBusiness(businessId, dosenId) {
    const business = await prisma.usaha.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      const error = new Error('Usaha tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    if (business.pembimbingId !== dosenId) {
      const error = new Error('Anda bukan pembimbing usaha ini');
      error.statusCode = 403;
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
}
