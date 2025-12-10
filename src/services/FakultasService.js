import { prisma } from '../config/index.js';

export class FakultasService {
  // ========== FAKULTAS ==========

  async getAllFakultas() {
    try {
      const fakultas = await prisma.fakultas.findMany({
        include: {
          _count: {
            select: {
              prodi: true,
              users: true,
              usaha: true,
            },
          },
        },
        orderBy: { nama: 'asc' },
      });

      return fakultas;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getFakultasById(id) {
    try {
      const fakultas = await prisma.fakultas.findUnique({
        where: { id },
        include: {
          prodi: {
            orderBy: { nama: 'asc' },
          },
          _count: {
            select: {
              users: true,
              usaha: true,
            },
          },
        },
      });

      if (!fakultas) {
        const err = new Error('Fakultas tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      return fakultas;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async createFakultas(data) {
    try {
      // Check if kode already exists
      const existing = await prisma.fakultas.findUnique({
        where: { kode: data.kode },
      });

      if (existing) {
        const err = new Error('Kode fakultas sudah digunakan');
        err.statusCode = 400;
        throw err;
      }

      const fakultas = await prisma.fakultas.create({
        data: {
          kode: data.kode,
          nama: data.nama,
        },
      });

      return fakultas;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async updateFakultas(id, data) {
    try {
      const fakultas = await prisma.fakultas.findUnique({
        where: { id },
      });

      if (!fakultas) {
        const err = new Error('Fakultas tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      // Check if new kode already exists (if changing kode)
      if (data.kode && data.kode !== fakultas.kode) {
        const existing = await prisma.fakultas.findUnique({
          where: { kode: data.kode },
        });

        if (existing) {
          const err = new Error('Kode fakultas sudah digunakan');
          err.statusCode = 400;
          throw err;
        }
      }

      const updated = await prisma.fakultas.update({
        where: { id },
        data: {
          ...(data.kode && { kode: data.kode }),
          ...(data.nama && { nama: data.nama }),
        },
      });

      return updated;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async deleteFakultas(id) {
    try {
      const fakultas = await prisma.fakultas.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              usaha: true,
            },
          },
        },
      });

      if (!fakultas) {
        const err = new Error('Fakultas tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      // Check if fakultas is in use
      if (fakultas._count.users > 0 || fakultas._count.usaha > 0) {
        const err = new Error(
          'Fakultas tidak dapat dihapus karena masih digunakan'
        );
        err.statusCode = 400;
        throw err;
      }

      await prisma.fakultas.delete({
        where: { id },
      });

      return { deleted: true };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== PRODI ==========

  async getAllProdi(fakultasId = null) {
    try {
      const prodi = await prisma.prodi.findMany({
        where: fakultasId ? { fakultasId } : undefined,
        include: {
          fakultas: {
            select: {
              id: true,
              kode: true,
              nama: true,
            },
          },
          _count: {
            select: {
              users: true,
              usaha: true,
            },
          },
        },
        orderBy: [{ fakultas: { nama: 'asc' } }, { nama: 'asc' }],
      });

      return prodi;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getProdiById(id) {
    try {
      const prodi = await prisma.prodi.findUnique({
        where: { id },
        include: {
          fakultas: true,
          _count: {
            select: {
              users: true,
              usaha: true,
            },
          },
        },
      });

      if (!prodi) {
        const err = new Error('Program studi tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      return prodi;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async createProdi(data) {
    try {
      // Check if fakultas exists
      const fakultas = await prisma.fakultas.findUnique({
        where: { id: data.fakultasId },
      });

      if (!fakultas) {
        const err = new Error('Fakultas tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      // Check if prodi with same name in same fakultas already exists
      const existing = await prisma.prodi.findFirst({
        where: {
          nama: data.nama,
          fakultasId: data.fakultasId,
        },
      });

      if (existing) {
        const err = new Error('Program studi sudah ada di fakultas ini');
        err.statusCode = 400;
        throw err;
      }

      const prodi = await prisma.prodi.create({
        data: {
          nama: data.nama,
          fakultasId: data.fakultasId,
        },
        include: {
          fakultas: {
            select: {
              id: true,
              kode: true,
              nama: true,
            },
          },
        },
      });

      return prodi;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async updateProdi(id, data) {
    try {
      const prodi = await prisma.prodi.findUnique({
        where: { id },
      });

      if (!prodi) {
        const err = new Error('Program studi tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      // Check if new fakultas exists (if changing fakultasId)
      if (data.fakultasId && data.fakultasId !== prodi.fakultasId) {
        const fakultas = await prisma.fakultas.findUnique({
          where: { id: data.fakultasId },
        });

        if (!fakultas) {
          const err = new Error('Fakultas tidak ditemukan');
          err.statusCode = 404;
          throw err;
        }
      }

      // Check if prodi with same name in same fakultas already exists
      if (data.nama || data.fakultasId) {
        const existing = await prisma.prodi.findFirst({
          where: {
            id: { not: id },
            nama: data.nama || prodi.nama,
            fakultasId: data.fakultasId || prodi.fakultasId,
          },
        });

        if (existing) {
          const err = new Error('Program studi sudah ada di fakultas ini');
          err.statusCode = 400;
          throw err;
        }
      }

      const updated = await prisma.prodi.update({
        where: { id },
        data: {
          ...(data.nama && { nama: data.nama }),
          ...(data.fakultasId && { fakultasId: data.fakultasId }),
        },
        include: {
          fakultas: {
            select: {
              id: true,
              kode: true,
              nama: true,
            },
          },
        },
      });

      return updated;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async deleteProdi(id) {
    try {
      const prodi = await prisma.prodi.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              usaha: true,
            },
          },
        },
      });

      if (!prodi) {
        const err = new Error('Program studi tidak ditemukan');
        err.statusCode = 404;
        throw err;
      }

      // Check if prodi is in use
      if (prodi._count.users > 0 || prodi._count.usaha > 0) {
        const err = new Error(
          'Program studi tidak dapat dihapus karena masih digunakan'
        );
        err.statusCode = 400;
        throw err;
      }

      await prisma.prodi.delete({
        where: { id },
      });

      return { deleted: true };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== HELPER ==========

  async getProdiByFakultas(fakultasId) {
    try {
      const prodi = await prisma.prodi.findMany({
        where: { fakultasId },
        orderBy: { nama: 'asc' },
      });

      return prodi;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }
}
