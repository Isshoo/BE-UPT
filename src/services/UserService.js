import { prisma } from '../config/index.js';
import { hashPassword } from '../utils/index.js';

export class UserService {
  async list(params) {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      sortBy = 'createdAt',
      order = 'desc',
    } = params;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const where = {
      AND: [
        search
          ? {
              OR: [
                { nama: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        role ? { role } : {},
      ],
    };

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
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
      }),
    ]);

    return { items, total, page: pageNum, limit: limitNum };
  }

  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
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

  async create(data) {
    const { email, password, nama, role, fakultas, prodi } = data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const error = new Error('Email sudah terdaftar');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        role, // 'ADMIN' | 'DOSEN' | 'USER'
        fakultas: role === 'DOSEN' ? fakultas ?? null : null,
        prodi: role === 'DOSEN' ? prodi ?? null : null,
      },
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

    return created;
  }

  async update(id, data) {
    const { email, password, nama, role, fakultas, prodi } = data;

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== id) {
        const error = new Error('Email sudah digunakan');
        error.statusCode = 400;
        throw error;
      }
    }

    let updateData = {
      nama,
      email,
      role,
    };

    if (typeof password === 'string' && password.length > 0) {
      updateData.password = await hashPassword(password);
    }

    if (role === 'DOSEN') {
      updateData.fakultas = fakultas ?? null;
      updateData.prodi = prodi ?? null;
    } else if (role) {
      updateData.fakultas = null;
      updateData.prodi = null;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return updated;
  }

  async remove(id) {
    await prisma.user.delete({ where: { id } });
    return { message: 'User berhasil dihapus' };
  }
}