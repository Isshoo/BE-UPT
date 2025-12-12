import { prisma } from '../config/index.js';

export class DashboardService {
  // ========== GENERAL STATISTICS ==========

  async getGeneralStats() {
    try {
      const [
        totalUsers,
        totalEvents,
        totalPeserta,
        totalKategori,
        activeEvents,
      ] = await Promise.all([
        // Total users (exclude admin)
        prisma.user.count({
          where: {
            role: {
              in: ['USER', 'DOSEN'],
            },
          },
        }),

        // Total events
        prisma.eventMarketplace.count(),

        // Total peserta marketplace (unique users)
        prisma.usaha.findMany({
          select: {
            pemilikId: true,
          },
          distinct: ['pemilikId'],
        }),

        // Total Kategori penilaian dengan nama unik dari seluruh event
        prisma.kategoriPenilaian.findMany({
          select: {
            nama: true,
          },
          distinct: ['nama'],
        }),

        // Active events (TERBUKA, BERLANGSUNG)
        prisma.eventMarketplace.count({
          where: {
            status: {
              in: ['TERBUKA', 'BERLANGSUNG'],
            },
          },
        }),
      ]);

      return {
        totalUsers,
        totalEvents,
        totalPeserta: totalPeserta.length,
        totalKategori: totalKategori.length,
        activeEvents,
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== MARKETPLACE ANALYTICS ==========

  async getMarketplaceAnalytics() {
    try {
      // Participants per semester
      const participantsPerSemester = await prisma.eventMarketplace.findMany({
        select: {
          id: true,
          nama: true,
          semester: true,
          tahunAjaran: true,
          _count: {
            select: {
              usaha: true,
            },
          },
        },
        orderBy: [{ tahunAjaran: 'desc' }, { semester: 'desc' }],
        take: 10,
      });

      // Category distribution (all time)
      const categoryDistribution = await prisma.usaha.groupBy({
        by: ['kategori'],
        _count: true,
        orderBy: {
          _count: {
            kategori: 'desc',
          },
        },
        take: 10,
      });

      // Business type comparison
      const businessTypeComparison = await prisma.usaha.groupBy({
        by: ['tipeUsaha'],
        _count: true,
      });

      // Faculty comparison (for MAHASISWA type) - now uses fakultasId relation
      const facultyComparisonRaw = await prisma.usaha.findMany({
        where: {
          tipeUsaha: 'MAHASISWA',
          fakultasId: { not: null },
        },
        select: {
          fakultas: {
            select: {
              kode: true,
              nama: true,
            },
          },
        },
      });

      // Group by fakultas
      const facultyMap = new Map();
      facultyComparisonRaw.forEach((item) => {
        if (item.fakultas) {
          const key = item.fakultas.kode;
          if (!facultyMap.has(key)) {
            facultyMap.set(key, { fakultas: item.fakultas.nama, count: 0 });
          }
          facultyMap.get(key).count++;
        }
      });
      const facultyComparison = Array.from(facultyMap.values()).sort(
        (a, b) => b.count - a.count
      );

      // Program studi comparison (top 10) - now uses prodiId relation
      const prodiComparisonRaw = await prisma.usaha.findMany({
        where: {
          tipeUsaha: 'MAHASISWA',
          prodiId: { not: null },
        },
        select: {
          prodi: {
            select: {
              nama: true,
            },
          },
        },
      });

      // Group by prodi
      const prodiMap = new Map();
      prodiComparisonRaw.forEach((item) => {
        if (item.prodi) {
          const key = item.prodi.nama;
          if (!prodiMap.has(key)) {
            prodiMap.set(key, { prodi: key, count: 0 });
          }
          prodiMap.get(key).count++;
        }
      });
      const prodiComparison = Array.from(prodiMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Approval rate
      const [totalBusiness, approvedBusiness] = await Promise.all([
        prisma.usaha.count(),
        prisma.usaha.count({
          where: { status: 'DISETUJUI' },
        }),
      ]);

      const approvalRate =
        totalBusiness > 0
          ? Math.round((approvedBusiness / totalBusiness) * 100)
          : 0;

      return {
        participantsPerSemester: participantsPerSemester.map((event) => ({
          eventName: event.nama,
          semester: `${event.semester} ${event.tahunAjaran}`,
          count: event._count.usaha,
        })),
        categoryDistribution: categoryDistribution.map((item) => ({
          kategori: item.kategori,
          count: item._count,
        })),
        businessTypeComparison: businessTypeComparison.map((item) => ({
          type: item.tipeUsaha,
          count: item._count,
        })),
        facultyComparison,
        prodiComparison,
        approvalRate,
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== GROWTH ANALYTICS ==========

  async getGrowthAnalytics() {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // User growth (by month)
      const userGrowth = await prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: oneYearAgo,
          },
          role: {
            in: ['USER', 'DOSEN'],
          },
        },
        _count: true,
      });

      // Event growth (by semester/tahun ajaran)
      const eventGrowth = await prisma.eventMarketplace.groupBy({
        by: ['tahunAjaran', 'semester'],
        _count: true,
        orderBy: [{ tahunAjaran: 'asc' }, { semester: 'asc' }],
      });

      return {
        userGrowth: this.groupByMonth(userGrowth),
        eventGrowth: eventGrowth.map((item) => ({
          period: `${item.semester} ${item.tahunAjaran}`,
          count: item._count,
        })),
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== RECENT ACTIVITIES ==========

  async getRecentActivities() {
    try {
      // Recent events
      const recentEvents = await prisma.eventMarketplace.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nama: true,
          status: true,
          createdAt: true,
        },
      });

      // Recent business registrations
      const recentBusinesses = await prisma.usaha.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          namaProduk: true,
          tipeUsaha: true,
          createdAt: true,
          pemilik: {
            select: {
              nama: true,
            },
          },
          event: {
            select: {
              nama: true,
            },
          },
        },
      });

      return {
        recentEvents,
        recentBusinesses,
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== HELPER METHODS ==========

  groupByMonth(data) {
    const monthlyData = {};

    data.forEach((item) => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += item._count || 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
