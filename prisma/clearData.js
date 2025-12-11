import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing existing data...\n');

  // Delete in order (respecting foreign key constraints)
  // Start from tables with no dependencies, then work up

  // 1. Delete notification and history first (no dependencies on them)
  console.log('   Deleting notifikasi...');
  await prisma.notifikasi.deleteMany();

  console.log('   Deleting riwayat_marketplace...');
  await prisma.riwayatMarketplace.deleteMany();

  // 2. Delete nilai_penilaian (depends on usaha, kategori, kriteria, user)
  console.log('   Deleting nilai_penilaian...');
  await prisma.nilaiPenilaian.deleteMany();

  // 3. Delete kriteria_penilaian (depends on kategori)
  console.log('   Deleting kriteria_penilaian...');
  await prisma.kriteriaPenilaian.deleteMany();

  // 4. Delete usaha (depends on event, user, fakultas, prodi)
  // Must be before kategori because pemenangId references usaha
  console.log('   Deleting usaha...');
  await prisma.usaha.deleteMany();

  // 5. Delete kategori_penilaian (depends on event, user for penilai)
  console.log('   Deleting kategori_penilaian...');
  await prisma.kategoriPenilaian.deleteMany();

  // 6. Delete sponsor (depends on event)
  console.log('   Deleting sponsor...');
  await prisma.sponsor.deleteMany();

  // 7. Delete event_marketplace
  console.log('   Deleting event_marketplace...');
  await prisma.eventMarketplace.deleteMany();

  // 8. Delete users
  console.log('   Deleting users...');
  await prisma.user.deleteMany();

  // 9. Delete prodi (depends on fakultas)
  console.log('   Deleting prodi...');
  await prisma.prodi.deleteMany();

  // 10. Delete fakultas
  console.log('   Deleting fakultas...');
  await prisma.fakultas.deleteMany();

  console.log('\n✅ All data cleared successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
