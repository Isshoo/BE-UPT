import { prisma } from '../config/index.js';

export class UserService {
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

    const users = await prisma.user.findMany({
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
      take: parseInt(limit),
    });

    return users;
  }
}
