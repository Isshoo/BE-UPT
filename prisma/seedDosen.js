import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ListDosen = [
  {
    nama: 'Inneke Victor, PhD',
    email: 'ivictor@unikadelasalle.ac.id',
    fakultasKode: 'Teknik',
    prodiNama: 'Teknik Industri',
  },
  {
    nama: 'Margie Christanty Poluan, S.E.,M.S.A',
    email: 'mpoluan@unikadelasalle.ac.id',
    fakultasKode: 'FEB',
    prodiNama: 'Akuntansi',
  },
  {
    nama: 'Steify M. E. W. Sepang, S.E., M.Si., Ak., C.A',
    email: 'ssepang@unikadelasalle.ac.id',
    fakultasKode: 'FEB',
    prodiNama: 'Akuntansi',
  },
  {
    nama: 'Deiby N. F. Tiwow, S.Pd., M.Pd',
    email: 'dtiwow@unikadelasalle.ac.id',
    fakultasKode: 'PGSD',
    prodiNama: 'Pendidikan Guru Sekolah Dasar',
  },
];

async function main() {
  console.log('🌱 Starting Dosen seed...\n');

  const hashedPassword = await bcrypt.hash('1234', 10);

  let createdCount = 0;
  let skippedCount = 0;

  for (const d of ListDosen) {
    // Check if dosen already exists
    const existing = await prisma.user.findUnique({
      where: { email: d.email },
    });

    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${d.nama}`);
      skippedCount++;
      continue;
    }

    // Find fakultas by kode
    const fakultas = await prisma.fakultas.findUnique({
      where: { kode: d.fakultasKode },
    });

    if (!fakultas) {
      console.log(
        `⚠️  Skipped (fakultas not found: ${d.fakultasKode}): ${d.nama}`
      );
      skippedCount++;
      continue;
    }

    // Find prodi by nama and fakultasId
    const prodi = await prisma.prodi.findFirst({
      where: {
        nama: d.prodiNama,
        fakultasId: fakultas.id,
      },
    });

    if (!prodi) {
      console.log(`⚠️  Skipped (prodi not found: ${d.prodiNama}): ${d.nama}`);
      skippedCount++;
      continue;
    }

    // Create dosen
    const dosen = await prisma.user.create({
      data: {
        email: d.email,
        password: hashedPassword,
        nama: d.nama,
        role: 'DOSEN',
        fakultasId: fakultas.id,
        prodiId: prodi.id,
      },
    });

    console.log(`✅ Created: ${dosen.nama} (${fakultas.nama} - ${prodi.nama})`);
    createdCount++;
  }

  console.log(`\n✨ Seeding Dosen selesai!`);
  console.log(`   Created: ${createdCount}`);
  console.log(`   Skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
