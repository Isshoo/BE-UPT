import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotifications() {
  try {
    console.log('🌱 Seeding notifications...');

    // Get sample users
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['USER', 'DOSEN'],
        },
      },
      take: 3,
    });

    if (users.length === 0) {
      console.log('⚠️  No users found. Please seed users first.');
      return;
    }

    // Create sample notifications for each user
    for (const user of users) {
      await prisma.notifikasi.createMany({
        data: [
          {
            userId: user.id,
            judul: 'Event Marketplace Dibuka!',
            pesan:
              'Event "Bazaar Semester Ganjil 2025" telah dibuka untuk pendaftaran. Daftar sekarang!',
            link: '/marketplace',
            sudahBaca: false,
          },
          {
            userId: user.id,
            judul: 'Selamat Datang di UPT-PIK!',
            pesan:
              'Terima kasih telah bergabung dengan platform UPT-PIK. Jelajahi fitur-fitur yang tersedia.',
            link: '/about',
            sudahBaca: false,
          },
          {
            userId: user.id,
            judul: 'Tips Mengikuti Marketplace',
            pesan:
              'Pastikan Anda menyiapkan produk terbaik dan booth yang menarik untuk event marketplace.',
            link: null,
            sudahBaca: true,
          },
        ],
      });
    }

    console.log('✅ Notifications seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
