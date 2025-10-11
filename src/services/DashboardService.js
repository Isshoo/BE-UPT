import { prisma } from '../config/index.js';

export class DashboardService {
  // ========== GENERAL STATISTICS ==========

  async getGeneralStats() {
    const [
      totalUsers,
      totalEvents,
      totalUmkm,
      totalPeserta,
      activeEvents,
      pendingUmkmValidation,
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

      // Total UMKM
      prisma.umkm.count(),

      // Total peserta marketplace (unique users)
      prisma.usaha.findMany({
        select: {
          pemilikId: true,
        },
        distinct: ['pemilikId'],
      }),

      // Active events (TERBUKA, PERSIAPAN, BERLANGSUNG)
      prisma.eventMarketplace.count({
        where: {
          status: {
            in: ['TERBUKA', 'PERSIAPAN', 'BERLANGSUNG'],
          },
        },
      }),

      // UMKM waiting for validation
      prisma.tahapUmkm.count({
        where: {
          status: 'MENUNGGU_VALIDASI',
        },
      }),
    ]);

    return {
      totalUsers,
      totalEvents,
      totalUmkm,
      totalPeserta: totalPeserta.length,
      activeEvents,
      pendingUmkmValidation,
    };
  }

  // ========== MARKETPLACE ANALYTICS ==========

  async getMarketplaceAnalytics() {
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

    // Faculty comparison (for MAHASISWA type)
    const facultyComparison = await prisma.usaha.groupBy({
      by: ['fakultas'],
      where: {
        tipeUsaha: 'MAHASISWA',
        fakultas: {
          not: null,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          fakultas: 'desc',
        },
      },
    });

    // Program studi comparison (top 10)
    const prodiComparison = await prisma.usaha.groupBy({
      by: ['prodi'],
      where: {
        tipeUsaha: 'MAHASISWA',
        prodi: {
          not: null,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          prodi: 'desc',
        },
      },
      take: 10,
    });

    // Approval rate
    const [totalBusiness, approvedBusiness] = await Promise.all([
      prisma.usaha.count(),
      prisma.usaha.count({
        where: { disetujui: true },
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
      facultyComparison: facultyComparison.map((item) => ({
        fakultas: item.fakultas,
        count: item._count,
      })),
      prodiComparison: prodiComparison.map((item) => ({
        prodi: item.prodi,
        count: item._count,
      })),
      approvalRate,
    };
  }

  // ========== UMKM ANALYTICS ==========

  async getUmkmAnalytics() {
    // UMKM per stage
    const umkmPerStage = await prisma.umkm.groupBy({
      by: ['tahapSaatIni'],
      _count: true,
      orderBy: {
        tahapSaatIni: 'asc',
      },
    });

    // UMKM by category
    const umkmByCategory = await prisma.umkm.groupBy({
      by: ['kategori'],
      _count: true,
      orderBy: {
        _count: {
          kategori: 'desc',
        },
      },
    });

    // Stage completion rate
    const stageCompletionRate = await Promise.all(
      [1, 2, 3, 4].map(async (tahap) => {
        const completed = await prisma.tahapUmkm.count({
          where: {
            tahap,
            status: 'SELESAI',
          },
        });

        const total = await prisma.tahapUmkm.count({
          where: { tahap },
        });

        return {
          tahap,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          completed,
          total,
        };
      })
    );

    // Recent UMKM registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentRegistrations = await prisma.umkm.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    // Group by month
    const registrationsByMonth = this.groupByMonth(recentRegistrations);

    return {
      umkmPerStage: umkmPerStage.map((item) => ({
        tahap: item.tahapSaatIni,
        count: item._count,
      })),
      umkmByCategory: umkmByCategory.map((item) => ({
        kategori: item.kategori,
        count: item._count,
      })),
      stageCompletionRate,
      registrationsByMonth,
    };
  }

  // ========== GROWTH ANALYTICS ==========

  async getGrowthAnalytics() {
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

    // UMKM growth (by month)
    const umkmGrowth = await prisma.umkm.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: oneYearAgo,
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
      umkmGrowth: this.groupByMonth(umkmGrowth),
      eventGrowth: eventGrowth.map((item) => ({
        period: `${item.semester} ${item.tahunAjaran}`,
        count: item._count,
      })),
    };
  }

  // ========== RECENT ACTIVITIES ==========

  async getRecentActivities() {
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

    // Recent UMKM registrations
    const recentUmkm = await prisma.umkm.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nama: true,
        kategori: true,
        tahapSaatIni: true,
        createdAt: true,
        user: {
          select: {
            nama: true,
          },
        },
      },
    });

    return {
      recentEvents,
      recentBusinesses,
      recentUmkm,
    };
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
