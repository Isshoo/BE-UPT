import { prisma } from '../config/index.js';
import { NotificationService } from './NotificationService.js';

export class UmkmService {
  constructor() {
    this.notificationService = new NotificationService();
  }
  // ========== UMKM CRUD ==========

  async createUmkm(data, userId) {
    const { nama, kategori, deskripsi, namaPemilik, alamat, telepon } = data;

    // Check if user already has UMKM with same name
    const existingUmkm = await prisma.umkm.findFirst({
      where: {
        userId,
        nama,
      },
    });

    if (existingUmkm) {
      const error = new Error('Anda sudah memiliki UMKM dengan nama yang sama');
      error.statusCode = 400;
      throw error;
    }

    // Create UMKM with initial stage
    const umkm = await prisma.umkm.create({
      data: {
        nama,
        kategori,
        deskripsi,
        namaPemilik,
        alamat,
        telepon,
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
  }

  async getUmkms(filters = {}) {
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
  }

  async getUmkmById(umkmId, userId = null, userRole = null) {
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
  }

  async updateUmkm(umkmId, data, userId) {
    const umkm = await prisma.umkm.findUnique({
      where: { id: umkmId },
    });

    if (!umkm) {
      const error = new Error('UMKM tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Only owner can update
    if (umkm.userId !== userId) {
      const error = new Error('Anda tidak memiliki akses');
      error.statusCode = 403;
      throw error;
    }

    const { nama, kategori, deskripsi, namaPemilik, alamat, telepon } = data;

    const updatedUmkm = await prisma.umkm.update({
      where: { id: umkmId },
      data: {
        nama,
        kategori,
        deskripsi,
        namaPemilik,
        alamat,
        telepon,
      },
      include: {
        tahap: {
          orderBy: { tahap: 'asc' },
        },
      },
    });

    return updatedUmkm;
  }

  async deleteUmkm(umkmId, userId, userRole) {
    const umkm = await prisma.umkm.findUnique({
      where: { id: umkmId },
    });

    if (!umkm) {
      const error = new Error('UMKM tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Only owner or admin can delete
    if (umkm.userId !== userId && userRole !== 'ADMIN') {
      const error = new Error('Anda tidak memiliki akses');
      error.statusCode = 403;
      throw error;
    }

    await prisma.umkm.delete({
      where: { id: umkmId },
    });

    return { message: 'UMKM berhasil dihapus' };
  }

  // ========== STAGE MANAGEMENT ==========

  async uploadStageFiles(umkmId, tahap, files, userId) {
    const umkm = await prisma.umkm.findUnique({
      where: { id: umkmId },
    });

    if (!umkm) {
      const error = new Error('UMKM tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Only owner can upload
    if (umkm.userId !== userId) {
      const error = new Error('Anda tidak memiliki akses');
      error.statusCode = 403;
      throw error;
    }

    // Check if stage exists
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
  }

  async requestValidation(umkmId, tahap, userId) {
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

    // Only owner can request
    if (umkm.userId !== userId) {
      const error = new Error('Anda tidak memiliki akses');
      error.statusCode = 403;
      throw error;
    }

    const stage = umkm.tahap[0];
    if (!stage) {
      const error = new Error('Tahap tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Check if files uploaded
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
  }

  async validateStage(umkmId, tahap, isApproved, catatan = null) {
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
          catatan,
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
          catatan,
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
  }

  // ========== STATISTICS ==========

  async getStatistics() {
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
  }
}
