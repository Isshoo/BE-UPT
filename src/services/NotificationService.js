import { prisma } from '../config/index.js';

export class NotificationService {
  // ========== CREATE NOTIFICATION ==========

  async createNotification(data) {
    const { userId, judul, pesan, link } = data;

    const notification = await prisma.notifikasi.create({
      data: {
        userId,
        judul,
        pesan,
        link,
        sudahBaca: false,
      },
    });

    return notification;
  }

  async createBulkNotifications(notifications) {
    // notifications = [{ userId, judul, pesan, link }, ...]
    const created = await prisma.notifikasi.createMany({
      data: notifications.map((notif) => ({
        ...notif,
        sudahBaca: false,
      })),
    });

    return created;
  }

  // ========== GET NOTIFICATIONS ==========

  async getUserNotifications(userId, filters = {}) {
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

      const { page = 1, limit = 10, sudahBaca } = filters;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = { userId };

      if (sudahBaca !== undefined) {
        where.sudahBaca = sudahBaca === true || sudahBaca === 'true';
      }

      const [notifications, total] = await Promise.all([
        prisma.notifikasi.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notifikasi.count({ where }),
      ]);

      return {
        notifications,
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

  async getUnreadCount(userId) {
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

      const count = await prisma.notifikasi.count({
        where: {
          userId,
          sudahBaca: false,
        },
      });

      return count;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== MARK AS READ ==========

  async markAsRead(notificationId, userId) {
    try {
      // Validasi: Cek apakah notification ada dan milik user
      const notification = await prisma.notifikasi.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        const error = new Error('Notifikasi tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Update notification
      const updated = await prisma.notifikasi.update({
        where: { id: notificationId },
        data: { sudahBaca: true },
      });

      return updated;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async markAllAsRead(userId) {
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

      // Update all notifications
      await prisma.notifikasi.updateMany({
        where: {
          userId,
          sudahBaca: false,
        },
        data: { sudahBaca: true },
      });

      return { message: 'Semua notifikasi telah dibaca' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== DELETE NOTIFICATION ==========

  async deleteNotification(notificationId, userId) {
    try {
      // Validasi: Cek apakah notification ada dan milik user
      const notification = await prisma.notifikasi.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        const error = new Error('Notifikasi tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Delete notification
      await prisma.notifikasi.delete({
        where: { id: notificationId },
      });

      return { message: 'Notifikasi berhasil dihapus' };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== NOTIFICATION TRIGGERS ==========

  // Notifikasi untuk event marketplace
  async notifyEventCreated(eventId) {
    const event = await prisma.eventMarketplace.findUnique({
      where: { id: eventId },
    });

    if (!event) return;

    // Get all users (except admin)
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['USER', 'DOSEN'],
        },
      },
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      userId: user.id,
      judul: 'Event Marketplace Dibuka!',
      pesan: `Event "${event.nama}" telah dibuka untuk pendaftaran. Daftar sekarang!`,
      link: `/marketplace/${eventId}`,
    }));

    await this.createBulkNotifications(notifications);
  }

  async notifyEventStatusChanged(eventId, newStatus) {
    const event = await prisma.eventMarketplace.findUnique({
      where: { id: eventId },
      include: {
        usaha: {
          select: { pemilikId: true },
        },
      },
    });

    if (!event) return;

    const statusMessages = {
      BERLANGSUNG: 'Event sedang berlangsung! Selamat berjualan!',
      SELESAI: 'Event telah selesai. Terima kasih atas partisipasinya!',
    };

    const message = statusMessages[newStatus];
    if (!message) return;

    // Notify participants
    const participantIds = [...new Set(event.usaha.map((u) => u.pemilikId))];

    const notifications = participantIds.map((userId) => ({
      userId,
      judul: `Status Event: ${event.nama}`,
      pesan: message,
      link: `/marketplace/${eventId}`,
    }));

    await this.createBulkNotifications(notifications);
  }

  async notifyBusinessRegistered(usahaId) {
    const usaha = await prisma.usaha.findUnique({
      where: { id: usahaId },
      include: {
        event: true,
        pembimbing: true,
      },
    });

    if (!usaha) return;

    // Notify admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const adminNotifications = admins.map((admin) => ({
      userId: admin.id,
      judul: 'Pendaftaran Peserta Baru',
      pesan: `Usaha "${usaha.namaProduk}" telah mendaftar di event "${usaha.event.nama}"`,
      link: `/admin/marketplace/${usaha.eventId}`,
    }));

    await this.createBulkNotifications(adminNotifications);

    // Notify dosen pembimbing if exists
    if (usaha.pembimbingId) {
      await this.createNotification({
        userId: usaha.pembimbingId,
        judul: 'Mahasiswa Bimbingan Mendaftar Event',
        pesan: `Mahasiswa Anda mendaftarkan usaha "${usaha.namaProduk}" di event "${usaha.event.nama}"`,
        link: `/dosen/pendampingan/${usaha.eventId}`,
      });
    }
  }

  async notifyBusinessApproved(usahaId) {
    const usaha = await prisma.usaha.findUnique({
      where: { id: usahaId },
      include: {
        event: true,
        pemilik: true,
      },
    });

    if (!usaha) return;

    await this.createNotification({
      userId: usaha.pemilikId,
      judul: 'Usaha Anda Disetujui!',
      pesan: `Usaha "${usaha.namaProduk}" telah disetujui untuk mengikuti event "${usaha.event.nama}"`,
      link: `/marketplace/${usaha.eventId}`,
    });
  }

  async notifyBusinessRejected(usahaId) {
    const usaha = await prisma.usaha.findUnique({
      where: { id: usahaId },
      include: {
        event: true,
        pemilik: true,
      },
    });

    if (!usaha) return;

    const alasanText = usaha.alasanPenolakan
      ? ` Alasan: ${usaha.alasanPenolakan}`
      : '';

    await this.createNotification({
      userId: usaha.pemilikId,
      judul: 'Pendaftaran Usaha Ditolak',
      pesan: `Usaha "${usaha.namaProduk}" ditolak untuk event "${usaha.event.nama}".${alasanText}`,
      link: `/marketplace/${usaha.eventId}`,
    });
  }

  async notifyAssessmentAssigned(kategoriId, dosenId) {
    const kategori = await prisma.kategoriPenilaian.findUnique({
      where: { id: kategoriId },
      include: {
        event: true,
      },
    });

    if (!kategori) return;

    await this.createNotification({
      userId: dosenId,
      judul: 'Penugasan Penilaian Baru',
      pesan: `Anda ditugaskan sebagai penilai kategori "${kategori.nama}" di event "${kategori.event.nama}"`,
      link: `/dosen/penilaian/${kategori.eventId}`,
    });
  }

  async notifyAssessmentResults(eventId) {
    const event = await prisma.eventMarketplace.findUnique({
      where: { id: eventId },
      include: {
        usaha: {
          where: { tipeUsaha: 'MAHASISWA' },
          select: { pemilikId: true },
        },
      },
    });

    if (!event) return;

    const participantIds = [...new Set(event.usaha.map((u) => u.pemilikId))];

    const notifications = participantIds.map((userId) => ({
      userId,
      judul: 'Hasil Penilaian Diumumkan!',
      pesan: `Hasil penilaian untuk event "${event.nama}" telah diumumkan`,
      link: `/marketplace/${eventId}`,
    }));

    await this.createBulkNotifications(notifications);
  }

  // Notifikasi untuk UMKM binaan
  async notifyUmkmStageRequest(umkmId) {
    const umkm = await prisma.umkm.findUnique({
      where: { id: umkmId },
    });

    if (!umkm) return;

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      userId: admin.id,
      judul: 'Request Validasi Tahap UMKM',
      pesan: `UMKM "${umkm.nama}" meminta validasi untuk naik ke tahap selanjutnya`,
      link: `/admin/umkm/${umkmId}`,
    }));

    await this.createBulkNotifications(notifications);
  }

  async notifyUmkmStageValidated(umkmId, tahap) {
    const umkm = await prisma.umkm.findUnique({
      where: { id: umkmId },
      include: {
        user: true,
      },
    });

    if (!umkm) return;

    await this.createNotification({
      userId: umkm.userId,
      judul: 'Tahap UMKM Divalidasi!',
      pesan: `UMKM "${umkm.nama}" telah divalidasi dan naik ke Tahap ${tahap}`,
      link: `/profile/umkm/${umkmId}`,
    });
  }
}
