import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@uptpik.ac.id' },
    update: {},
    create: {
      email: 'admin@uptpik.ac.id',
      password: hashedPassword,
      nama: 'Admin UPT-PIK',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Dosen
  const dosen1 = await prisma.user.upsert({
    where: { email: 'dosen1@unikadelasalle.ac.id' },
    update: {},
    create: {
      email: 'dosen1@unikadelasalle.ac.id',
      password: hashedPassword,
      nama: 'Dr. John Doe',
      role: 'DOSEN',
      fakultas: 'Teknik',
      prodi: 'Informatika',
    },
  });
  console.log('✅ Dosen 1 created:', dosen1.email);

  const dosen2 = await prisma.user.upsert({
    where: { email: 'dosen2@unikadelasalle.ac.id' },
    update: {},
    create: {
      email: 'dosen2@unikadelasalle.ac.id',
      password: hashedPassword,
      nama: 'Dr. Jane Smith',
      role: 'DOSEN',
      fakultas: 'Ekonomi',
      prodi: 'Manajemen',
    },
  });
  console.log('✅ Dosen 2 created:', dosen2.email);

  // Create Regular Users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@student.unikadelasalle.ac.id' },
    update: {},
    create: {
      email: 'user1@student.unikadelasalle.ac.id',
      password: hashedPassword,
      nama: 'Ahmad Mahasiswa',
      role: 'USER',
    },
  });
  console.log('✅ User 1 created:', user1.email);

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@gmail.com' },
    update: {},
    create: {
      email: 'user2@gmail.com',
      password: hashedPassword,
      nama: 'Budi UMKM',
      role: 'USER',
    },
  });
  console.log('✅ User 2 created:', user2.email);

  // Create Sample Marketplace Event
  const event = await prisma.eventMarketplace.create({
    data: {
      nama: 'Bazaar Semester Ganjil 2024/2025',
      deskripsi:
        'Event bazaar untuk mahasiswa dan UMKM lokal semester ganjil tahun ajaran 2024/2025',
      semester: 'Ganjil',
      tahunAjaran: '2024/2025',
      lokasi: 'Lapangan Parkir UNSRAT',
      tanggalPelaksanaan: new Date('2025-03-15'),
      mulaiPendaftaran: new Date('2025-01-01'),
      akhirPendaftaran: new Date('2025-02-28'),
      kuotaPeserta: 50,
      status: 'TERBUKA',
    },
  });
  console.log('✅ Event created:', event.nama);

  // Create Sponsors
  await prisma.sponsor.createMany({
    data: [
      {
        nama: 'Bank Mandiri',
        logo: 'https://via.placeholder.com/200x100?text=Bank+Mandiri',
        eventId: event.id,
      },
      {
        nama: 'Telkomsel',
        logo: 'https://via.placeholder.com/200x100?text=Telkomsel',
        eventId: event.id,
      },
    ],
  });
  console.log('✅ Sponsors created');

  // Create Assessment Categories with Criteria
  const kategoriBooths = await prisma.kategoriPenilaian.create({
    data: {
      nama: 'Booth Terbaik',
      deskripsi: 'Penilaian untuk booth terbaik',
      eventId: event.id,
      penilai: {
        connect: [{ id: dosen1.id }],
      },
      kriteria: {
        create: [
          { nama: 'Kerapihan', bobot: 40 },
          { nama: 'Kebersihan', bobot: 30 },
          { nama: 'Tampilan', bobot: 20 },
          { nama: 'Tata Letak', bobot: 10 },
        ],
      },
    },
  });
  console.log('✅ Kategori Booth Terbaik created');

  const kategoriPresentasi = await prisma.kategoriPenilaian.create({
    data: {
      nama: 'Presentasi Terbaik',
      deskripsi: 'Penilaian untuk presentasi produk terbaik',
      eventId: event.id,
      penilai: {
        connect: [{ id: dosen2.id }],
      },
      kriteria: {
        create: [
          { nama: 'Komunikasi', bobot: 40 },
          { nama: 'Penguasaan Materi', bobot: 30 },
          { nama: 'Kreativitas', bobot: 30 },
        ],
      },
    },
  });
  console.log('✅ Kategori Presentasi Terbaik created');

  // Create Sample UMKM
  const umkm1 = await prisma.umkm.create({
    data: {
      nama: 'Kopi Manado Asli',
      kategori: 'Kuliner',
      deskripsi: 'Kopi khas Manado dengan cita rasa autentik',
      namaPemilik: 'Budi UMKM',
      alamat: 'Jl. Raya Manado No. 123',
      telepon: '081234567890',
      userId: user2.id,
      tahapSaatIni: 2,
      tahap: {
        create: [
          {
            tahap: 1,
            status: 'SELESAI',
            file: JSON.stringify([
              'https://cloudinary.com/sample-bmc.pdf',
            ]),
            tanggalSubmit: new Date('2024-12-01'),
            tanggalValidasi: new Date('2024-12-05'),
          },
          {
            tahap: 2,
            status: 'MENUNGGU_VALIDASI',
            file: JSON.stringify([
              'https://cloudinary.com/sample-logo.png',
              'https://cloudinary.com/sample-packaging.png',
            ]),
            tanggalSubmit: new Date('2024-12-20'),
          },
        ],
      },
    },
  });
  console.log('✅ UMKM created:', umkm1.nama);

  console.log('✨ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });