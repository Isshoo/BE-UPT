import { prisma } from '../config/index.js';

export class MarketplaceService {
  // List events with filters, search, pagination, sorting
  async list(params) {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      semester,
      tahunAjaran,
      orderBy = 'createdAt',
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
                { deskripsi: { contains: search, mode: 'insensitive' } },
                { lokasi: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        status ? { status } : {},
        semester ? { semester } : {},
        tahunAjaran ? { tahunAjaran } : {},
      ],
    };

    const [total, items] = await Promise.all([
      prisma.eventMarketplace.count({ where }),
      prisma.eventMarketplace.findMany({
        where,
        orderBy: { [orderBy]: order },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          nama: true,
          deskripsi: true,
          semester: true,
          tahunAjaran: true,
          lokasi: true,
          tanggalPelaksanaan: true,
          mulaiPendaftaran: true,
          akhirPendaftaran: true,
          kuotaPeserta: true,
          status: true,
          gambarLayout: true,
          terkunci: true,
          createdAt: true,
          updatedAt: true,
          sponsor: {
            select: { id: true, nama: true, logo: true },
          },
          _count: {
            select: { usaha: true },
          },
        },
      }),
    ]);

    return { items, total, page: pageNum, limit: limitNum };
  }

  // Detail event
  async getById(id) {
    const event = await prisma.eventMarketplace.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        semester: true,
        tahunAjaran: true,
        lokasi: true,
        tanggalPelaksanaan: true,
        mulaiPendaftaran: true,
        akhirPendaftaran: true,
        kuotaPeserta: true,
        status: true,
        gambarLayout: true,
        terkunci: true,
        createdAt: true,
        updatedAt: true,
        sponsor: {
          select: { id: true, nama: true, logo: true },
        },
        kategoriPenilaian: {
          select: {
            id: true,
            nama: true,
            deskripsi: true,
            penilai: { select: { id: true, nama: true, email: true } },
            kriteria: { select: { id: true, nama: true, bobot: true } },
            pemenang: { select: { id: true, namaProduk: true } },
          },
        },
        usaha: {
          select: {
            id: true,
            namaProduk: true,
            kategori: true,
            tipeUsaha: true,
            nomorBooth: true,
            disetujui: true,
            pemilik: { select: { id: true, nama: true, email: true, role: true } },
          },
        },
      },
    });

    if (!event) {
      const error = new Error('Event tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return event;
  }

  // Create event
  async create(data) {
    const created = await prisma.eventMarketplace.create({
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi,
        semester: data.semester,
        tahunAjaran: data.tahunAjaran,
        lokasi: data.lokasi,
        tanggalPelaksanaan: new Date(data.tanggalPelaksanaan),
        mulaiPendaftaran: new Date(data.mulaiPendaftaran),
        akhirPendaftaran: new Date(data.akhirPendaftaran),
        kuotaPeserta: data.kuotaPeserta,
        status: data.status || 'DRAFT',
      },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        semester: true,
        tahunAjaran: true,
        lokasi: true,
        tanggalPelaksanaan: true,
        mulaiPendaftaran: true,
        akhirPendaftaran: true,
        kuotaPeserta: true,
        status: true,
        gambarLayout: true,
        terkunci: true,
        createdAt: true,
      },
    });

    return created;
  }

  // Update event (blocked when locked)
  async update(id, data) {
    const existing = await prisma.eventMarketplace.findUnique({
      where: { id },
      select: { id: true, terkunci: true },
    });
    if (!existing) {
      const error = new Error('Event tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    if (existing.terkunci) {
      const error = new Error('Event terkunci dan tidak dapat diubah');
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.eventMarketplace.update({
      where: { id },
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi,
        semester: data.semester,
        tahunAjaran: data.tahunAjaran,
        lokasi: data.lokasi,
        tanggalPelaksanaan: data.tanggalPelaksanaan
          ? new Date(data.tanggalPelaksanaan)
          : undefined,
        mulaiPendaftaran: data.mulaiPendaftaran ? new Date(data.mulaiPendaftaran) : undefined,
        akhirPendaftaran: data.akhirPendaftaran ? new Date(data.akhirPendaftaran) : undefined,
        kuotaPeserta: typeof data.kuotaPeserta === 'number' ? data.kuotaPeserta : undefined,
        status: data.status,
      },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        semester: true,
        tahunAjaran: true,
        lokasi: true,
        tanggalPelaksanaan: true,
        mulaiPendaftaran: true,
        akhirPendaftaran: true,
        kuotaPeserta: true,
        status: true,
        gambarLayout: true,
        terkunci: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  // Delete event (blocked when locked)
  async remove(id) {
    const existing = await prisma.eventMarketplace.findUnique({
      where: { id },
      select: { id: true, terkunci: true },
    });
    if (!existing) {
      const error = new Error('Event tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
    if (existing.terkunci) {
      const error = new Error('Event terkunci dan tidak dapat dihapus');
      error.statusCode = 400;
      throw error;
    }

    await prisma.eventMarketplace.delete({ where: { id } });
    return { message: 'Event berhasil dihapus' };
  }

  // Lock and unlock
  async lock(id) {
    const updated = await prisma.eventMarketplace.update({
      where: { id },
      data: { terkunci: true },
      select: { id: true, terkunci: true },
    });
    return updated;
  }

  async unlock(id) {
    const updated = await prisma.eventMarketplace.update({
      where: { id },
      data: { terkunci: false },
      select: { id: true, terkunci: true },
    });
    return updated;
  }

  // Save layout image URL
  async setLayoutImage(id, url) {
    const updated = await prisma.eventMarketplace.update({
      where: { id },
      data: { gambarLayout: url },
      select: { id: true, gambarLayout: true, updatedAt: true },
    });
    return updated;
  }
}