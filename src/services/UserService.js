import { prisma } from '../config/index.js';
import { hashPassword } from '../utils/index.js';

export class UserService {
  async getUsersGuest(filters = {}) {
    try {
      const { role, page = 1, limit = 100, search } = filters;

      const where = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { nama: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            nama: true,
            role: true,
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
          skip,
          take: parseInt(limit),
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
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

  async getUsers(filters = {}) {
    try {
      const { role, page = 1, limit = 100, search } = filters;

      const where = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { nama: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            nama: true,
            role: true,
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
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
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

  async getUserById(userId) {
    try {
      // Validasi: Cek apakah user ada
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
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
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        const error = new Error('User tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      return user;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async createUser(data) {
    try {
      const {
        email,
        password,
        nama,
        role = 'USER',
        fakultasId,
        prodiId,
      } = data;

      // Validasi: Cek apakah email sudah terdaftar
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        const error = new Error(
          'Email sudah terdaftar. Silakan gunakan email lain.'
        );
        error.statusCode = 409;
        throw error;
      }

      // Validasi: Cek apakah nama sudah terdaftar
      // Gunakan findFirst karena nama bukan unique field
      const existingName = await prisma.user.findFirst({
        where: { nama: nama.trim() },
      });

      if (existingName) {
        const error = new Error(
          'Nama sudah terdaftar. Silakan gunakan nama lain.'
        );
        error.statusCode = 409;
        throw error;
      }

      // Validasi fakultas dan prodi jika ada
      if (fakultasId) {
        const fakultas = await prisma.fakultas.findUnique({
          where: { id: fakultasId },
        });
        if (!fakultas) {
          const error = new Error('Fakultas tidak ditemukan');
          error.statusCode = 404;
          throw error;
        }
      }

      if (prodiId) {
        const prodi = await prisma.prodi.findUnique({
          where: { id: prodiId },
        });
        if (!prodi) {
          const error = new Error('Program studi tidak ditemukan');
          error.statusCode = 404;
          throw error;
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          nama: nama.trim(),
          role,
          fakultasId: role === 'DOSEN' ? fakultasId || null : null,
          prodiId: role === 'DOSEN' ? prodiId || null : null,
        },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
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
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async updateUser(userId, data) {
    try {
      const { nama, email, fakultasId, prodiId } = data;

      // Validasi: Cek apakah user ada
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        const error = new Error('User tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah email sedang diubah dan sudah digunakan
      if (email && email.toLowerCase().trim() !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (emailExists) {
          const error = new Error(
            'Email sudah digunakan. Silakan gunakan email lain.'
          );
          error.statusCode = 409;
          throw error;
        }
      }

      // Validasi: Cek apakah nama sedang diubah dan sudah digunakan
      if (nama && nama.trim() !== existingUser.nama) {
        // Gunakan findFirst karena nama bukan unique field
        const nameExists = await prisma.user.findFirst({
          where: { nama: nama.trim() },
        });

        if (nameExists) {
          const error = new Error(
            'Nama sudah digunakan. Silakan gunakan nama lain.'
          );
          error.statusCode = 409;
          throw error;
        }
      }

      // Validasi fakultas dan prodi jika ada
      if (fakultasId) {
        const fakultas = await prisma.fakultas.findUnique({
          where: { id: fakultasId },
        });
        if (!fakultas) {
          const error = new Error('Fakultas tidak ditemukan');
          error.statusCode = 404;
          throw error;
        }
      }

      if (prodiId) {
        const prodi = await prisma.prodi.findUnique({
          where: { id: prodiId },
        });
        if (!prodi) {
          const error = new Error('Program studi tidak ditemukan');
          error.statusCode = 404;
          throw error;
        }
      }

      // Prepare update data (hanya field yang diisi)
      const updateData = {};
      if (nama !== undefined) updateData.nama = nama.trim();
      if (email !== undefined) updateData.email = email.toLowerCase().trim();
      if (existingUser.role === 'DOSEN') {
        if (fakultasId !== undefined)
          updateData.fakultasId = fakultasId || null;
        if (prodiId !== undefined) updateData.prodiId = prodiId || null;
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
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
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async deleteUser(userId) {
    try {
      // Validasi: Cek apakah user ada
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              usaha: true,
              nilaiPenilaian: true,
            },
          },
        },
      });

      if (!user) {
        const error = new Error('User tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cegah penghapusan user yang memiliki data terkait
      if (user._count.usaha > 0) {
        const error = new Error(
          'User tidak dapat dihapus karena memiliki data usaha terkait.'
        );
        error.statusCode = 400;
        throw error;
      }

      if (user._count.nilaiPenilaian > 0) {
        const error = new Error(
          'User tidak dapat dihapus karena memiliki data penilaian terkait.'
        );
        error.statusCode = 400;
        throw error;
      }

      // Delete user
      await prisma.user.delete({
        where: { id: userId },
      });

      return { message: 'User berhasil dihapus' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async resetPassword(userId, newPassword) {
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

      // Hash password baru
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password berhasil direset' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async getStatistics() {
    try {
      const [total, byRole] = await Promise.all([
        prisma.user.count(),
        prisma.user.groupBy({
          by: ['role'],
          _count: true,
        }),
      ]);

      return {
        total,
        byRole: byRole.reduce((acc, item) => {
          acc[item.role.toLowerCase()] = item._count;
          return acc;
        }, {}),
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }
}
