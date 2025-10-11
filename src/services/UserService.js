import { prisma } from '../config/index.js';
import { hashPassword } from '../utils/index.js';

export class UserService {
  async getUsersGuest(filters = {}) {
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
          fakultas: true,
          prodi: true,
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
  }
  async getUsers(filters = {}) {
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
          fakultas: true,
          prodi: true,
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
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        fakultas: true,
        prodi: true,
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
  }

  async createUser(data) {
    const { email, password, nama, role, fakultas, prodi } = data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        role,
        fakultas: role === 'DOSEN' ? fakultas : null,
        prodi: role === 'DOSEN' ? prodi : null,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        fakultas: true,
        prodi: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(userId, data) {
    const { nama, email, fakultas, prodi } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        const error = new Error('Email sudah digunakan');
        error.statusCode = 400;
        throw error;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        email,
        fakultas: existingUser.role === 'DOSEN' ? fakultas : undefined,
        prodi: existingUser.role === 'DOSEN' ? prodi : undefined,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        fakultas: true,
        prodi: true,
      },
    });

    return user;
  }

  async deleteUser(userId) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            usaha: true,
            umkm: true,
          },
        },
      },
    });

    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Prevent deleting user with data
    if (user._count.usaha > 0 || user._count.umkm > 0) {
      const error = new Error(
        'User tidak dapat dihapus karena memiliki data terkait'
      );
      error.statusCode = 400;
      throw error;
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User berhasil dihapus' };
  }

  async resetPassword(userId, newPassword) {
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil direset' };
  }

  async getStatistics() {
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
  }
}
