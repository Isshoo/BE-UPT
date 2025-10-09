import { prisma } from '../config/index.js';

export class SponsorService {
  async listByEvent(eventId) {
    const sponsors = await prisma.sponsor.findMany({
      where: { eventId },
      select: {
        id: true,
        nama: true,
        logo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return sponsors;
  }

  async create(eventId, data) {
    const sponsor = await prisma.sponsor.create({
      data: {
        eventId,
        nama: data.nama,
        logo: data.logo,
      },
      select: {
        id: true,
        nama: true,
        logo: true,
        createdAt: true,
      },
    });
    return sponsor;
  }

  async update(id, data) {
    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        nama: data.nama,
        logo: data.logo,
      },
      select: {
        id: true,
        nama: true,
        logo: true,
        createdAt: true,
      },
    });
    return sponsor;
  }

  async remove(id) {
    await prisma.sponsor.delete({ where: { id } });
    return { message: 'Sponsor berhasil dihapus' };
  }
}