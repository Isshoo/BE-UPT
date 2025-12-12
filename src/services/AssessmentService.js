import { prisma } from '../config/index.js';
import { NotificationService } from './NotificationService.js';

export class AssessmentService {
  constructor() {
    this.notificationService = new NotificationService();
  }
  // ========== KATEGORI PENILAIAN ==========

  async createKategori(eventId, data) {
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

      const { nama, deskripsi, penilaiIds, kriteria } = data;

      // Validasi: Total bobot harus 100%
      const totalBobot = kriteria.reduce(
        (sum, k) => sum + parseInt(k.bobot),
        0
      );
      if (totalBobot !== 100) {
        const error = new Error('Total bobot kriteria harus 100%');
        error.statusCode = 400;
        throw error;
      }

      // Create kategori
      const kategori = await prisma.kategoriPenilaian.create({
        data: {
          nama: nama.trim(),
          deskripsi: deskripsi?.trim() || null,
          eventId,
          penilai: {
            connect: penilaiIds.map((id) => ({ id })),
          },
          kriteria: {
            create: kriteria.map((k) => ({
              nama: k.nama.trim(),
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getKategoriByEvent(eventId) {
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getKategoriById(kategoriId) {
    try {
      // Validasi: Cek apakah kategori ada
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async updateKategori(kategoriId, data) {
    try {
      // Validasi: Cek apakah kategori ada
      const existingKategori = await prisma.kategoriPenilaian.findUnique({
        where: { id: kategoriId },
      });

      if (!existingKategori) {
        const error = new Error('Kategori penilaian tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const { nama, deskripsi, penilaiIds } = data;

      // Prepare update data (hanya field yang diisi)
      const updateData = {};
      if (nama !== undefined) updateData.nama = nama.trim();
      if (deskripsi !== undefined)
        updateData.deskripsi = deskripsi?.trim() || null;
      if (penilaiIds && penilaiIds.length > 0) {
        updateData.penilai = {
          set: penilaiIds.map((id) => ({ id })),
        };
      }

      const kategori = await prisma.kategoriPenilaian.update({
        where: { id: kategoriId },
        data: updateData,
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async deleteKategori(kategoriId) {
    try {
      // Validasi: Cek apakah kategori ada
      const kategori = await prisma.kategoriPenilaian.findUnique({
        where: { id: kategoriId },
      });

      if (!kategori) {
        const error = new Error('Kategori penilaian tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Delete kategori
      await prisma.kategoriPenilaian.delete({
        where: { id: kategoriId },
      });

      return { message: 'Kategori penilaian berhasil dihapus' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
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
    try {
      const { usahaId, kategoriId, kriteriaId, nilai } = data;

      // Validasi: Cek apakah kategori ada
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

      // Validasi: Cek apakah penilai memiliki akses
      const isPenilai = kategori.penilai.some((p) => p.id === penilaiId);
      if (!isPenilai) {
        const error = new Error(
          'Anda tidak memiliki akses untuk menilai kategori ini'
        );
        error.statusCode = 403;
        throw error;
      }

      // Validasi: Cek apakah event sedang berlangsung
      if (kategori.event.status !== 'BERLANGSUNG') {
        const error = new Error(
          'Penilaian hanya dapat dilakukan saat event berlangsung'
        );
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Cek apakah business ada dalam event ini
      const business = await prisma.usaha.findUnique({
        where: { id: usahaId },
      });

      if (!business || business.eventId !== kategori.eventId) {
        const error = new Error('Usaha tidak ditemukan dalam event ini');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek range nilai (0-100)
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getScoresByKategori(kategoriId) {
    try {
      // Validasi: Cek apakah kategori ada
      const kategori = await prisma.kategoriPenilaian.findUnique({
        where: { id: kategoriId },
        include: {
          kriteria: true,
          event: {
            include: {
              usaha: {
                where: {
                  status: 'DISETUJUI',
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
              nilai: score?.nilai,
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async setWinner(kategoriId, usahaId) {
    try {
      // Validasi: Cek apakah kategori ada
      const kategori = await prisma.kategoriPenilaian.findUnique({
        where: { id: kategoriId },
        include: { event: true },
      });

      if (!kategori) {
        const error = new Error('Kategori penilaian tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Event harus berstatus SELESAI
      if (kategori.event.status !== 'SELESAI') {
        const error = new Error(
          'Pemenang hanya dapat di-set saat event sudah SELESAI'
        );
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Pemenang tidak bisa diubah jika sudah di-set
      if (kategori.pemenangId) {
        const error = new Error(
          'Pemenang sudah ditetapkan dan tidak dapat diubah'
        );
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Cek apakah business ada dalam event ini
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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // Auto-set winners for all categories when event status changes to SELESAI
  async autoSetWinnersForEvent(eventId) {
    try {
      // Get all assessment categories for this event
      const kategoris = await prisma.kategoriPenilaian.findMany({
        where: { eventId },
        include: {
          kriteria: true,
          event: true,
        },
      });

      const results = [];

      for (const kategori of kategoris) {
        // Skip if winner already set
        if (kategori.pemenangId) {
          results.push({
            kategoriId: kategori.id,
            kategoriNama: kategori.nama,
            status: 'already_set',
            message: 'Pemenang sudah ditetapkan sebelumnya',
          });
          continue;
        }

        // Get all approved mahasiswa businesses in this event
        const businesses = await prisma.usaha.findMany({
          where: {
            eventId,
            status: 'DISETUJUI',
            tipeUsaha: 'MAHASISWA',
          },
          include: {
            pemilik: { select: { nama: true } },
          },
        });

        if (businesses.length === 0) {
          results.push({
            kategoriId: kategori.id,
            kategoriNama: kategori.nama,
            status: 'no_participants',
            message: 'Tidak ada peserta yang memenuhi syarat',
          });
          continue;
        }

        // Calculate scores for each business
        const businessScores = await Promise.all(
          businesses.map(async (business) => {
            const scores = await prisma.nilaiPenilaian.findMany({
              where: {
                usahaId: business.id,
                kategoriId: kategori.id,
              },
            });

            let totalScore = 0;
            kategori.kriteria.forEach((kriteria) => {
              const score = scores.find((s) => s.kriteriaId === kriteria.id);
              const nilai = score?.nilai || 0;
              totalScore += (nilai * kriteria.bobot) / 100;
            });

            return {
              usahaId: business.id,
              namaProduk: business.namaProduk,
              pemilikNama: business.pemilik.nama,
              pemilikId: business.pemilikId,
              totalScore: Math.round(totalScore * 100) / 100,
            };
          })
        );

        // Sort by score descending
        businessScores.sort((a, b) => b.totalScore - a.totalScore);

        // Check if there are any scored businesses
        if (businessScores.length === 0 || businessScores[0].totalScore === 0) {
          results.push({
            kategoriId: kategori.id,
            kategoriNama: kategori.nama,
            status: 'no_scores',
            message: 'Belum ada penilaian untuk kategori ini',
          });
          continue;
        }

        const highestScore = businessScores[0].totalScore;

        // Check for tie (2+ businesses with same highest score)
        const topScorers = businessScores.filter(
          (b) => b.totalScore === highestScore
        );

        if (topScorers.length > 1) {
          // Tie detected - skip auto-set, allow manual selection
          results.push({
            kategoriId: kategori.id,
            kategoriNama: kategori.nama,
            status: 'tie',
            message: `Terdapat ${topScorers.length} peserta dengan nilai tertinggi yang sama (${highestScore}). Silakan pilih pemenang secara manual.`,
            tiedBusinesses: topScorers.map((b) => ({
              usahaId: b.usahaId,
              namaProduk: b.namaProduk,
              totalScore: b.totalScore,
            })),
          });
          continue;
        }

        // Single winner - auto-set
        const winner = businessScores[0];
        await prisma.kategoriPenilaian.update({
          where: { id: kategori.id },
          data: { pemenangId: winner.usahaId },
        });

        // Notify winner
        await this.notificationService.createNotification({
          userId: winner.pemilikId,
          judul: '🎉 Selamat! Anda Menjadi Pemenang!',
          pesan: `Usaha "${winner.namaProduk}" memenangkan kategori "${kategori.nama}" di event "${kategori.event.nama}"`,
          link: `/marketplace/${eventId}`,
        });

        results.push({
          kategoriId: kategori.id,
          kategoriNama: kategori.nama,
          status: 'auto_set',
          message: `Pemenang otomatis ditetapkan: ${winner.namaProduk} (Nilai: ${winner.totalScore})`,
          winner: {
            usahaId: winner.usahaId,
            namaProduk: winner.namaProduk,
            totalScore: winner.totalScore,
          },
        });
      }

      return results;
    } catch (error) {
      console.error('Error in autoSetWinnersForEvent:', error);
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== DOSEN SPECIFIC ==========

  async getKategoriByDosen(dosenId) {
    try {
      // Validasi: Cek apakah dosen ada
      const dosen = await prisma.user.findUnique({
        where: { id: dosenId },
      });

      if (!dosen) {
        const error = new Error('Dosen tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

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
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getMentoredBusinesses(dosenId, eventId = null) {
    try {
      // Validasi: Cek apakah dosen ada
      const dosen = await prisma.user.findUnique({
        where: { id: dosenId },
      });

      if (!dosen) {
        const error = new Error('Dosen tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah event ada (jika eventId diberikan)
      if (eventId) {
        const event = await prisma.eventMarketplace.findUnique({
          where: { id: eventId },
        });

        if (!event) {
          const error = new Error('Event tidak ditemukan');
          error.statusCode = 404;
          throw error;
        }
      }

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
              tahunAjaran: true,
            },
          },
          pemilik: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          prodi: true,
          fakultas: true,
        },
        orderBy: {
          event: {
            tanggalPelaksanaan: 'desc',
          },
        },
      });

      return businesses;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async approveMentoredBusiness(businessId, dosenId) {
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

      // Validasi: Cek apakah dosen adalah pembimbing
      if (business.pembimbingId !== dosenId) {
        const error = new Error('Anda bukan pembimbing usaha ini');
        error.statusCode = 403;
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

  async rejectMentoredBusiness(businessId, alasan, dosenId) {
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

      // Validasi: Cek apakah dosen adalah pembimbing
      if (business.pembimbingId !== dosenId) {
        const error = new Error('Anda bukan pembimbing usaha ini');
        error.statusCode = 403;
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
}
