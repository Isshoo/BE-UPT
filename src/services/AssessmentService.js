import { prisma } from '../config/index.js';

export class AssessmentService {
  // Kategori Penilaian
  async listKategori(eventId) {
    const kategori = await prisma.kategoriPenilaian.findMany({
      where: { eventId },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        pemenangId: true,
        createdAt: true,
        penilai: {
          select: { id: true, nama: true, email: true },
        },
        kriteria: {
          select: { id: true, nama: true, bobot: true },
        },
        pemenang: {
          select: { id: true, namaProduk: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return kategori;
  }

  async createKategori(eventId, data) {
    const kategori = await prisma.kategoriPenilaian.create({
      data: {
        eventId,
        nama: data.nama,
        deskripsi: data.deskripsi,
      },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        createdAt: true,
      },
    });
    return kategori;
  }

  async updateKategori(id, data) {
    const kategori = await prisma.kategoriPenilaian.update({
      where: { id },
      data: {
        nama: data.nama,
        deskripsi: data.deskripsi,
      },
      select: {
        id: true,
        nama: true,
        deskripsi: true,
        updatedAt: true,
      },
    });
    return kategori;
  }

  async removeKategori(id) {
    await prisma.kategoriPenilaian.delete({ where: { id } });
    return { message: 'Kategori penilaian berhasil dihapus' };
  }

  // Assign dosen penilai ke kategori
  async assignPenilai(kategoriId, dosenIds) {
    const kategori = await prisma.kategoriPenilaian.update({
      where: { id: kategoriId },
      data: {
        penilai: {
          set: dosenIds.map((id) => ({ id })),
        },
      },
      select: {
        id: true,
        nama: true,
        penilai: {
          select: { id: true, nama: true, email: true },
        },
      },
    });
    return kategori;
  }

  // Kriteria Penilaian
  async listKriteria(kategoriId) {
    const kriteria = await prisma.kriteriaPenilaian.findMany({
      where: { kategoriId },
      select: {
        id: true,
        nama: true,
        bobot: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return kriteria;
  }

  async createKriteria(kategoriId, data) {
    const kriteria = await prisma.kriteriaPenilaian.create({
      data: {
        kategoriId,
        nama: data.nama,
        bobot: data.bobot,
      },
      select: {
        id: true,
        nama: true,
        bobot: true,
        createdAt: true,
      },
    });
    return kriteria;
  }

  async updateKriteria(id, data) {
    const kriteria = await prisma.kriteriaPenilaian.update({
      where: { id },
      data: {
        nama: data.nama,
        bobot: data.bobot,
      },
      select: {
        id: true,
        nama: true,
        bobot: true,
        updatedAt: true,
      },
    });
    return kriteria;
  }

  async removeKriteria(id) {
    await prisma.kriteriaPenilaian.delete({ where: { id } });
    return { message: 'Kriteria penilaian berhasil dihapus' };
  }

  // Validasi total bobot kriteria = 100%
  async validateBobotKriteria(kategoriId) {
    const kriteria = await prisma.kriteriaPenilaian.findMany({
      where: { kategoriId },
      select: { bobot: true },
    });

    const totalBobot = kriteria.reduce((sum, k) => sum + k.bobot, 0);
    return {
      totalBobot,
      isValid: totalBobot === 100,
      kriteria: kriteria.length,
    };
  }

  // Set pemenang kategori
  async setPemenang(kategoriId, usahaId) {
    const kategori = await prisma.kategoriPenilaian.update({
      where: { id: kategoriId },
      data: { pemenangId: usahaId },
      select: {
        id: true,
        nama: true,
        pemenang: {
          select: { id: true, namaProduk: true },
        },
      },
    });
    return kategori;
  }
}