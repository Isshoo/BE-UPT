import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.notifikasi.deleteMany();
  await prisma.riwayatMarketplace.deleteMany();
  await prisma.nilaiPenilaian.deleteMany();
  await prisma.tahapUmkm.deleteMany();
  await prisma.umkm.deleteMany();
  await prisma.usaha.deleteMany();
  await prisma.kriteriaPenilaian.deleteMany();
  await prisma.kategoriPenilaian.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.eventMarketplace.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Data cleared!');
}

main()
  .catch((e) => {
    console.error('❌ Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
