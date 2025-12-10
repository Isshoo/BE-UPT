import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FAKULTAS_PRODI_DATA = [
  {
    kode: 'Teknik',
    nama: 'Teknik',
    prodi: [
      'Teknik Elektro',
      'Teknik Industri',
      'Teknik Informatika',
      'Teknik Sipil',
    ],
  },
  {
    kode: 'Hukum',
    nama: 'Hukum',
    prodi: ['Hukum'],
  },
  {
    kode: 'FEB',
    nama: 'Ekonomi dan Bisnis',
    prodi: ['Manajemen', 'Akuntansi'],
  },
  {
    kode: 'Pertanian',
    nama: 'Pertanian',
    prodi: ['Agribisnis'],
  },
  {
    kode: 'Keperawatan',
    nama: 'Keperawatan',
    prodi: ['Ilmu Keperawatan', 'Profesi Ners', 'Fisioterapi'],
  },
  {
    kode: 'Pariwisata',
    nama: 'Pariwisata',
    prodi: ['Hospitality dan Pariwisata'],
  },
  {
    kode: 'PGSD',
    nama: 'Ilmu Pendidikan',
    prodi: ['Pendidikan Guru Sekolah Dasar'],
  },
];

async function main() {
  console.log('🌱 Seeding Fakultas dan Prodi...\n');

  for (const fakultasData of FAKULTAS_PRODI_DATA) {
    // Create or update Fakultas
    const fakultas = await prisma.fakultas.upsert({
      where: { kode: fakultasData.kode },
      update: { nama: fakultasData.nama },
      create: {
        kode: fakultasData.kode,
        nama: fakultasData.nama,
      },
    });

    console.log(`✅ Fakultas: ${fakultas.nama} (${fakultas.kode})`);

    // Create Prodi for this Fakultas
    for (const namaProdi of fakultasData.prodi) {
      const prodi = await prisma.prodi.upsert({
        where: {
          nama_fakultasId: {
            nama: namaProdi,
            fakultasId: fakultas.id,
          },
        },
        update: {},
        create: {
          nama: namaProdi,
          fakultasId: fakultas.id,
        },
      });

      console.log(`   └─ Prodi: ${prodi.nama}`);
    }
  }

  console.log('\n✨ Seeding Fakultas dan Prodi selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
