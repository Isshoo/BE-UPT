import { prisma } from '../config/index.js';
import { NotificationService } from './NotificationService.js';

export class UmkmService {
  constructor() {
    this.notificationService = new NotificationService();
  }
  // ========== UMKM CRUD ==========

  async createUmkm(data, userId) {
    try {
      const { nama, kategori, deskripsi, namaPemilik, alamat, telepon } = data;

      // Validasi: Cek apakah user sudah memiliki UMKM dengan nama yang sama
      const existingUmkm = await prisma.umkm.findFirst({
        where: {
          userId,
          nama: nama.trim(),
        },
      });

      if (existingUmkm) {
        const error = new Error('Anda sudah memiliki UMKM dengan nama yang sama');
        error.statusCode = 409;
        throw error;
      }

      // Create UMKM with initial stage
      const umkm = await prisma.umkm.create({
        data: {
          nama: nama.trim(),
          kategori: kategori.trim(),
          deskripsi: deskripsi.trim(),
          namaPemilik: namaPemilik.trim(),
          alamat: alamat.trim(),
          telepon: telepon.trim(),
          userId,
          tahapSaatIni: 1,
          tahap: {
            create: [
              {
                tahap: 1,
                status: 'SEDANG_PROSES',
              },
              {
                tahap: 2,
                status: 'BELUM_DIMULAI',
              },
              {
                tahap: 3,
                status: 'BELUM_DIMULAI',
              },
              {
                tahap: 4,
                status: 'BELUM_DIMULAI',
              },
            ],
          },
        },
        include: {
          tahap: {
            orderBy: { tahap: 'asc' },
          },
        },
      });

      return umkm;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getUmkms(filters = {}) {
    try {
      const { page = 1, limit = 10, kategori, tahap, search, userId } = filters;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};

      if (kategori) {
        where.kategori = kategori;
      }

      if (tahap) {
        where.tahapSaatIni = parseInt(tahap);
      }

      if (userId) {
        where.userId = userId;
      }

      if (search) {
        where.OR = [
          { nama: { contains: search, mode: 'insensitive' } },
          { namaPemilik: { contains: search, mode: 'insensitive' } },
          { deskripsi: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [umkms, total] = await Promise.all([
        prisma.umkm.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
            tahap: {
              orderBy: { tahap: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.umkm.count({ where }),
      ]);

      return {
        umkms,
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

  async getUmkmById(umkmId, userId = null, userRole = null) {
    try {
      // Validasi: Cek apakah UMKM ada
      const umkm = await prisma.umkm.findUnique({
        where: { id: umkmId },
        include: {
          user: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
          tahap: {
            orderBy: { tahap: 'asc' },
          },
        },
      });

      if (!umkm) {
        const error = new Error('UMKM tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Check access: owner or admin can see files
      const isOwner = userId && umkm.userId === userId;
      const isAdmin = userRole === 'ADMIN';

      return {
        ...umkm,
        canEdit: isOwner,
        canValidate: isAdmin,
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async updateUmkm(umkmId, data, userId) {
    try {
      // Validasi: Cek apakah UMKM ada
      const umkm = await prisma.umkm.findUnique({
        where: { id: umkmId },
      });

      if (!umkm) {
        const error = new Error('UMKM tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Hanya owner yang bisa update
      if (umkm.userId !== userId) {
        const error = new Error('Anda tidak memiliki akses untuk mengupdate UMKM ini');
        error.statusCode = 403;
        throw error;
      }

      const { nama, kategori, deskripsi, namaPemilik, alamat, telepon } = data;

      // Prepare update data (hanya field yang diisi)
      const updateData = {};
      if (nama !== undefined) updateData.nama = nama.trim();
      if (kategori !== undefined) updateData.kategori = kategori.trim();
      if (deskripsi !== undefined) updateData.deskripsi = deskripsi.trim();
      if (namaPemilik !== undefined) updateData.namaPemilik = namaPemilik.trim();
      if (alamat !== undefined) updateData.alamat = alamat.trim();
      if (telepon !== undefined) updateData.telepon = telepon.trim();

      const updatedUmkm = await prisma.umkm.update({
        where: { id: umkmId },
        data: updateData,
        include: {
          tahap: {
            orderBy: { tahap: 'asc' },
          },
        },
      });

      return updatedUmkm;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async deleteUmkm(umkmId, userId, userRole) {
    try {
      // Validasi: Cek apakah UMKM ada
      const umkm = await prisma.umkm.findUnique({
        where: { id: umkmId },
      });

      if (!umkm) {
        const error = new Error('UMKM tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Hanya owner atau admin yang bisa delete
      if (umkm.userId !== userId && userRole !== 'ADMIN') {
        const error = new Error('Anda tidak memiliki akses untuk menghapus UMKM ini');
        error.statusCode = 403;
        throw error;
      }

      // Delete UMKM
      await prisma.umkm.delete({
        where: { id: umkmId },
      });

      return { message: 'UMKM berhasil dihapus' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== STAGE MANAGEMENT ==========

  async uploadStageFiles(umkmId, tahap, files, userId) {
    try {
      // Validasi: Cek apakah UMKM ada
      const umkm = await prisma.umkm.findUnique({
        where: { id: umkmId },
      });

      if (!umkm) {
        const error = new Error('UMKM tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Hanya owner yang bisa upload
      if (umkm.userId !== userId) {
        const error = new Error('Anda tidak memiliki akses untuk upload file');
        error.statusCode = 403;
        throw error;
      }

      // Validasi: Cek apakah tahap ada
      const stage = await prisma.tahapUmkm.findUnique({
        where: {
          umkmId_tahap: {
            umkmId,
            tahap: parseInt(tahap),
          },
        },
      });

      if (!stage) {
        const error = new Error('Tahap tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Update stage with files
      const updatedStage = await prisma.tahapUmkm.update({
        where: {
          umkmId_tahap: {
            umkmId,
            tahap: parseInt(tahap),
          },
        },
        data: {
          file: files,
          status: 'SEDANG_PROSES',
        },
      });

      return updatedStage;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async requestValidation(umkmId, tahap, userId) {
    try {
      // Validasi: Cek apakah UMKM ada
      const umkm = await prisma.umkm.findUnique({
        where: { id: umkmId },
        include: {
          tahap: {
            where: { tahap: parseInt(tahap) },
          },
        },
      });

      if (!umkm) {
        const error = new Error('UMKM tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Hanya owner yang bisa request
      if (umkm.userId !== userId) {
        const error = new Error('Anda tidak memiliki akses untuk request validasi');
        error.statusCode = 403;
        throw error;
      }

      const stage = umkm.tahap[0];
      if (!stage) {
        const error = new Error('Tahap tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah file sudah diupload
      if (!stage.file || (Array.isArray(stage.file) && stage.file.length === 0)) {
        const error = new Error('Mohon upload file terlebih dahulu');
        error.statusCode = 400;
        throw error;
      }

      // Update stage status
      const updatedStage = await prisma.tahapUmkm.update({
        where: {
          umkmId_tahap: {
            umkmId,
            tahap: parseInt(tahap),
          },
        },
        data: {
          status: 'MENUNGGU_VALIDASI',
          tanggalSubmit: new Date(),
        },
      });

      // Notify admin about validation request
      await this.notificationService.notifyUmkmStageRequest(umkmId);

      return updatedStage;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async validateStage(umkmId, tahap, isApproved, catatan = null) {
    try {
      // Validasi: Cek apakah UMKM ada
      const umkm = await prisma.umkm.findUnique({
        where: { id: umkmId },
        include: {
          tahap: {
            where: { tahap: parseInt(tahap) },
          },
        },
      });

      if (!umkm) {
        const error = new Error('UMKM tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const stage = umkm.tahap[0];
      if (!stage) {
        const error = new Error('Tahap tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek status tahap
      if (stage.status !== 'MENUNGGU_VALIDASI') {
        const error = new Error('Tahap tidak dalam status menunggu validasi');
        error.statusCode = 400;
        throw error;
      }

      if (isApproved) {
        // Update current stage
        await prisma.tahapUmkm.update({
          where: {
            umkmId_tahap: {
              umkmId,
              tahap: parseInt(tahap),
            },
          },
          data: {
            status: 'SELESAI',
            tanggalValidasi: new Date(),
            catatan: catatan?.trim() || null,
          },
        });

        // Move to next stage if not last stage
        const nextTahap = parseInt(tahap) + 1;
        if (nextTahap <= 4) {
          await prisma.tahapUmkm.update({
            where: {
              umkmId_tahap: {
                umkmId,
                tahap: nextTahap,
              },
            },
            data: {
              status: 'SEDANG_PROSES',
            },
          });

          // Update UMKM current stage
          await prisma.umkm.update({
            where: { id: umkmId },
            data: {
              tahapSaatIni: nextTahap,
            },
          });
        }
      } else {
        // Reject: back to in progress
        await prisma.tahapUmkm.update({
          where: {
            umkmId_tahap: {
              umkmId,
              tahap: parseInt(tahap),
            },
          },
          data: {
            status: 'SEDANG_PROSES',
            catatan: catatan?.trim() || null,
          },
        });
      }

      // Notify user about validation result
      if (isApproved) {
        const nextTahap =
          parseInt(tahap) + 1 <= 4 ? parseInt(tahap) + 1 : parseInt(tahap);
        await this.notificationService.notifyUmkmStageValidated(
          umkmId,
          nextTahap
        );
      }

      // Fetch updated UMKM
      const updatedUmkm = await this.getUmkmById(umkmId);
      return updatedUmkm;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== STATISTICS ==========

  async getStatistics() {
    try {
      const [total, byStage, byCategory] = await Promise.all([
        prisma.umkm.count(),
        prisma.umkm.groupBy({
          by: ['tahapSaatIni'],
          _count: true,
        }),
        prisma.umkm.groupBy({
          by: ['kategori'],
          _count: true,
          orderBy: {
            _count: {
              kategori: 'desc',
            },
          },
        }),
      ]);

      return {
        total,
        byStage: byStage.reduce((acc, item) => {
          acc[`tahap${item.tahapSaatIni}`] = item._count;
          return acc;
        }, {}),
        byCategory: byCategory.map((item) => ({
          kategori: item.kategori,
          count: item._count,
        })),
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }
}
