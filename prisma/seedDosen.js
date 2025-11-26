import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FAKULTAS_OPTIONS = [
  { value: 'Teknik', label: 'Teknik' },
  { value: 'Hukum', label: 'Hukum' },
  { value: 'FEB', label: 'Ekonomi dan Bisnis' },
  { value: 'Pertanian', label: 'Pertanian' },
  { value: 'Keperawatan', label: 'Keperawatan' },
  { value: 'Pariwisata', label: 'Pariwisata' },
  { value: 'PGSD', label: 'Ilmu Pendidikan' },
];

const PRODI_BY_FAKULTAS = {
  Teknik: [
    'Teknik Elektro',
    'Teknik Industri',
    'Teknik Informatika',
    'Teknik Sipil',
  ],
  Hukum: ['Hukum'],
  FEB: ['Manajemen', 'Akuntansi'],
  Pertanian: ['Agribisnis'],
  Keperawatan: ['Ilmu Keperawatan', 'Profesi Ners', 'Fisioterapi'],
  Pariwisata: ['Hospitality dan Pariwisata'],
  PGSD: ['Pendidikan Guru Sekolah Dasar'],
};

const ListDosen = [
  {
    nama: 'Inneke Victor, PhD',
    email: 'ivictor@unikadelasalle.ac.id',
    fakultas: 'Teknik',
    prodi: 'Teknik Industri',
  },
  {
    nama: 'Margie Christanty Poluan, S.E.,M.S.A',
    email: 'mpoluan@unikadelasalle.ac.id',
    fakultas: 'FEB',
    prodi: 'Akuntansi',
  },
  {
    nama: 'Steify M. E. W. Sepang, S.E., M.Si., Ak., C.A',
    email: 'ssepang@unikadelasalle.ac.id',
    fakultas: 'FEB',
    prodi: 'Akuntansi',
  },
  // {
  //   nama: 'Dr. Stella T. Kaunang, S.p., M.Si',
  //   email: 'skaunang@unikadelasalle.ac.id',
  //   fakultas: '',
  //   prodi: '',
  // },
  // {
  //   nama: 'Richard Uguy, ST., MT',
  //   email: 'ruguy@unikadelasalle.ac.id',
  //   fakultas: '',
  //   prodi: '',
  // },
  // {
  //   nama: 'Teddy Tandaju, S.E., MBA(Adv.)',
  //   email: 'ttandaju@unikadelasalle.ac.id',
  //   fakultas: '',
  //   prodi: '',
  // },
  // {
  //   nama: 'Steven Yones Kawatak, S.E., M.Ec.',
  //   email: 'skawatak@unikadelasalle.ac.id',
  //   fakultas: '',
  //   prodi: '',
  // },
  // {
  //   nama: 'Veronica Wongkar,  S.Pd., M.Pd',
  //   email: 'vwongkar@unikadelasalle.ac.id',
  //   fakultas: '',
  //   prodi: '',
  // },
  {
    nama: 'Deiby N. F. Tiwow, S.Pd., M.Pd',
    email: 'dtiwow@unikadelasalle.ac.id',
    fakultas: 'PGSD',
    prodi: 'Pendidikan Guru Sekolah Dasar',
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('1234', 10);

  // Dosen
  const dosenList = [];
  ListDosen.forEach(async (d) => {
    const dosen = await prisma.user.create({
      data: {
        email: d.email,
        password: hashedPassword,
        nama: d.nama,
        role: 'DOSEN',
        fakultas: d.fakultas,
        prodi: d.prodi,
      },
    });
    dosenList.push(dosen);
  });

  console.log(`✅ ${dosenList.length} Dosen created`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
