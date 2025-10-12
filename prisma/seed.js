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

const KATEGORI_USAHA = [
  'Makanan & Minuman',
  'Fashion & Aksesoris',
  'Kerajinan Tangan',
  'Teknologi & Digital',
  'Jasa & Layanan',
  'Pendidikan',
  'Kesehatan & Kecantikan',
  'Pertanian & Peternakan',
];

async function main() {
  console.log('🌱 Starting seed...');

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

  // Seed Users
  console.log('👥 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@upt-pik.ac.id',
      password: hashedPassword,
      nama: 'Admin UPT-PIK',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin created');

  // Dosen per fakultas
  const dosenList = [];
  for (const fakultas of FAKULTAS_OPTIONS) {
    const prodis = PRODI_BY_FAKULTAS[fakultas.value];
    for (let i = 0; i < Math.min(prodis.length, 2); i++) {
      const dosen = await prisma.user.create({
        data: {
          email: `dosen.${fakultas.value.toLowerCase()}.${i + 1}@ukdlsm.ac.id`,
          password: hashedPassword,
          nama: `Dr. Dosen ${fakultas.label} ${i + 1}`,
          role: 'DOSEN',
          fakultas: fakultas.value,
          prodi: prodis[i % prodis.length],
        },
      });
      dosenList.push(dosen);
    }
  }

  console.log(`✅ ${dosenList.length} Dosen created`);

  // Regular Users
  const userList = [];
  for (let i = 1; i <= 30; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@gmail.com`,
        password: hashedPassword,
        nama: `User ${i}`,
        role: 'USER',
      },
    });
    userList.push(user);
  }

  console.log(`✅ ${userList.length} Users created`);

  // Seed Event Marketplace
  console.log('📅 Seeding events...');

  const currentYear = new Date().getFullYear();
  const events = [];

  // Event yang sudah selesai (tahun lalu)
  for (let i = 1; i <= 3; i++) {
    const event = await prisma.eventMarketplace.create({
      data: {
        nama: `Bazaar UKDLSM ${currentYear - 1} - Semester ${i % 2 === 0 ? 'Genap' : 'Ganjil'}`,
        deskripsi: `Event bazaar/marketplace UKDLSM semester ${i % 2 === 0 ? 'genap' : 'ganjil'} tahun ${currentYear - 1}. Event ini diikuti oleh mahasiswa dan UMKM lokal untuk mempromosikan produk mereka.`,
        semester: i % 2 === 0 ? 'Genap' : 'Ganjil',
        tahunAjaran: `${currentYear - 1}/${currentYear}`,
        lokasi: 'Sporthall Kampus UKDLSM',
        tanggalPelaksanaan: new Date(currentYear - 1, i * 3, 15),
        mulaiPendaftaran: new Date(currentYear - 1, i * 3 - 1, 1),
        akhirPendaftaran: new Date(currentYear - 1, i * 3, 10),
        kuotaPeserta: 50,
        status: 'SELESAI',
        terkunci: true,
      },
    });
    events.push(event);
  }

  // Event sedang berlangsung
  const ongoingEvent = await prisma.eventMarketplace.create({
    data: {
      nama: `Bazaar UKDLSM ${currentYear} - Semester Ganjil`,
      deskripsi: `Event bazaar/marketplace UKDLSM semester ganjil tahun ${currentYear}. Kesempatan emas untuk mahasiswa dan UMKM menampilkan produk terbaik mereka!`,
      semester: 'Ganjil',
      tahunAjaran: `${currentYear}/${currentYear + 1}`,
      lokasi: 'Sporthall Kampus UKDLSM',
      tanggalPelaksanaan: new Date(currentYear, 9, 15), // Oktober
      mulaiPendaftaran: new Date(currentYear, 8, 1), // September
      akhirPendaftaran: new Date(currentYear, 9, 10),
      kuotaPeserta: 60,
      status: 'BERLANGSUNG',
      terkunci: true,
    },
  });
  events.push(ongoingEvent);

  // Event terbuka (pendaftaran)
  const openEvent = await prisma.eventMarketplace.create({
    data: {
      nama: `Bazaar UKDLSM ${currentYear} - Semester Genap`,
      deskripsi: `Event bazaar/marketplace UKDLSM semester genap tahun ${currentYear}. Daftarkan usaha Anda sekarang!`,
      semester: 'Genap',
      tahunAjaran: `${currentYear}/${currentYear + 1}`,
      lokasi: 'Sporthall Kampus UKDLSM',
      tanggalPelaksanaan: new Date(currentYear + 1, 2, 20), // Maret tahun depan
      mulaiPendaftaran: new Date(currentYear, 10, 1), // November
      akhirPendaftaran: new Date(currentYear + 1, 2, 15),
      kuotaPeserta: 70,
      status: 'TERBUKA',
      terkunci: false,
    },
  });
  events.push(openEvent);

  console.log(`✅ ${events.length} Events created`);

  // Seed Sponsors untuk setiap event
  console.log('🏢 Seeding sponsors...');
  const sponsors = [
    'Bank BCA',
    'Telkomsel',
    'Indofood',
    'Unilever',
    'Coca Cola',
    'Samsung',
  ];

  for (const event of events) {
    for (let i = 0; i < 3; i++) {
      await prisma.sponsor.create({
        data: {
          nama: sponsors[i],
          logo: `https://via.placeholder.com/200x100?text=${sponsors[i]}`,
          eventId: event.id,
        },
      });
    }
  }

  console.log('✅ Sponsors created');

  // Seed Kategori Penilaian untuk event yang selesai dan berlangsung
  console.log('🏆 Seeding assessment categories...');

  for (const event of events.slice(0, 4)) {
    // Skip event terbuka
    // Kategori 1: Booth Terbaik
    const kategori1 = await prisma.kategoriPenilaian.create({
      data: {
        nama: 'Booth Terbaik',
        deskripsi:
          'Penilaian untuk booth dengan tampilan dan tata letak terbaik',
        eventId: event.id,
        penilai: {
          connect: dosenList.slice(0, 2).map((d) => ({ id: d.id })),
        },
        kriteria: {
          create: [
            { nama: 'Kerapihan', bobot: 30 },
            { nama: 'Kebersihan', bobot: 25 },
            { nama: 'Tampilan Visual', bobot: 25 },
            { nama: 'Tata Letak', bobot: 20 },
          ],
        },
      },
    });

    // Kategori 2: Presentasi Terbaik
    const kategori2 = await prisma.kategoriPenilaian.create({
      data: {
        nama: 'Presentasi Terbaik',
        deskripsi:
          'Penilaian untuk kemampuan presentasi dan komunikasi penjual',
        eventId: event.id,
        penilai: {
          connect: dosenList.slice(2, 4).map((d) => ({ id: d.id })),
        },
        kriteria: {
          create: [
            { nama: 'Komunikasi', bobot: 35 },
            { nama: 'Pengetahuan Produk', bobot: 30 },
            { nama: 'Kepercayaan Diri', bobot: 20 },
            { nama: 'Profesionalisme', bobot: 15 },
          ],
        },
      },
    });

    // Kategori 3: Produk Terbaik
    const kategori3 = await prisma.kategoriPenilaian.create({
      data: {
        nama: 'Produk Terbaik',
        deskripsi: 'Penilaian untuk kualitas dan inovasi produk',
        eventId: event.id,
        penilai: {
          connect: dosenList.slice(4, 6).map((d) => ({ id: d.id })),
        },
        kriteria: {
          create: [
            { nama: 'Kualitas', bobot: 35 },
            { nama: 'Inovasi', bobot: 30 },
            { nama: 'Harga', bobot: 20 },
            { nama: 'Kemasan', bobot: 15 },
          ],
        },
      },
    });
  }

  console.log('✅ Assessment categories created');

  // Seed Usaha (Businesses) untuk event yang sudah selesai dan berlangsung
  console.log('🏪 Seeding businesses...');

  const usahaList = [];

  // Untuk event yang sudah selesai dan berlangsung
  for (const event of events.slice(0, 4)) {
    const numUsaha = event.status === 'SELESAI' ? 35 : 30;

    for (let i = 0; i < numUsaha; i++) {
      const isMahasiswa = i < numUsaha * 0.7; // 70% mahasiswa, 30% UMKM luar
      const kategori =
        KATEGORI_USAHA[Math.floor(Math.random() * KATEGORI_USAHA.length)];

      let usahaData = {
        namaProduk: `${kategori} ${isMahasiswa ? 'Mahasiswa' : 'UMKM'} ${i + 1}`,
        kategori: kategori,
        deskripsi: `Produk berkualitas tinggi dari kategori ${kategori}. Dibuat dengan bahan terbaik dan pelayanan ramah.`,
        tipeUsaha: isMahasiswa ? 'MAHASISWA' : 'UMKM_LUAR',
        eventId: event.id,
        telepon: `08${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(10, '0')}`,
        disetujui: true,
        nomorBooth: `B${(i + 1).toString().padStart(2, '0')}`,
        tanggalDisetujui: new Date(),
      };

      if (isMahasiswa) {
        const user = userList[i % userList.length];
        const dosen = dosenList.find(
          (d) => d.fakultas === user.fakultas && d.prodi === user.prodi
        );

        usahaData = {
          ...usahaData,
          pemilikId: user.id,
          anggota: [
            {
              nama: user.nama,
              nim: `${Math.floor(Math.random() * 90000000) + 10000000}`,
            },
            {
              nama: 'Anggota 2',
              nim: `${Math.floor(Math.random() * 90000000) + 10000000}`,
            },
          ],
          ketuaId: `${Math.floor(Math.random() * 90000000) + 10000000}`,
          fakultas: user.fakultas,
          prodi: user.prodi,
          pembimbingId: dosen?.id,
          mataKuliah: 'Kewirausahaan',
        };
      } else {
        usahaData = {
          ...usahaData,
          pemilikId: userList[i % userList.length].id,
          namaPemilik: `Pemilik UMKM ${i + 1}`,
          alamat: `Jl. Raya Kombos No. ${i + 1}, Kairagi`,
        };
      }

      const usaha = await prisma.usaha.create({
        data: usahaData,
      });

      usahaList.push(usaha);

      // Create riwayat marketplace (check if not exists)
      const existingRiwayat = await prisma.riwayatMarketplace.findUnique({
        where: {
          userId_eventId: {
            userId: usahaData.pemilikId,
            eventId: event.id,
          },
        },
      });

      if (!existingRiwayat) {
        await prisma.riwayatMarketplace.create({
          data: {
            userId: usahaData.pemilikId,
            eventId: event.id,
            usahaId: usaha.id,
          },
        });
      }
    }
  }

  console.log(`✅ ${usahaList.length} Businesses created`);

  // Seed Nilai Penilaian untuk event yang sudah selesai
  console.log('📊 Seeding assessment scores...');

  for (const event of events.slice(0, 3)) {
    // Hanya event selesai
    const kategoris = await prisma.kategoriPenilaian.findMany({
      where: { eventId: event.id },
      include: { kriteria: true, penilai: true },
    });

    const usahas = await prisma.usaha.findMany({
      where: {
        eventId: event.id,
        tipeUsaha: 'MAHASISWA',
        disetujui: true,
      },
    });

    for (const kategori of kategoris) {
      let topScore = 0;
      let winnerId = null;

      for (const usaha of usahas) {
        let totalScore = 0;

        for (const kriteria of kategori.kriteria) {
          // Random nilai antara 70-95
          const nilai = Math.floor(Math.random() * 26) + 70;
          const penilai =
            kategori.penilai[
              Math.floor(Math.random() * kategori.penilai.length)
            ];

          await prisma.nilaiPenilaian.create({
            data: {
              nilai,
              usahaId: usaha.id,
              kategoriId: kategori.id,
              kriteriaId: kriteria.id,
              penilaiId: penilai.id,
            },
          });

          // Calculate weighted score
          totalScore += (nilai * kriteria.bobot) / 100;
        }

        // Track highest score
        if (totalScore > topScore) {
          topScore = totalScore;
          winnerId = usaha.id;
        }
      }

      // Set winner
      if (winnerId) {
        await prisma.kategoriPenilaian.update({
          where: { id: kategori.id },
          data: { pemenangId: winnerId },
        });
      }
    }
  }

  console.log('✅ Assessment scores created');

  // Seed UMKM Binaan
  console.log('🏭 Seeding UMKM binaan...');

  const umkmCategories = KATEGORI_USAHA;

  for (let i = 0; i < 25; i++) {
    const user = userList[i % userList.length];
    const kategori =
      umkmCategories[Math.floor(Math.random() * umkmCategories.length)];
    const tahapSaatIni = Math.floor(Math.random() * 4) + 1;

    const umkm = await prisma.umkm.create({
      data: {
        nama: `UMKM ${kategori} ${i + 1}`,
        kategori: kategori,
        deskripsi: `Usaha ${kategori} yang telah berjalan dengan komitmen kualitas dan pelayanan terbaik.`,
        namaPemilik: `Pemilik UMKM ${i + 1}`,
        alamat: `Jl. Raya Kombos No. ${i + 1}, Kairagi`,
        telepon: `08${Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(10, '0')}`,
        userId: user.id,
        tahapSaatIni: tahapSaatIni,
      },
    });

    // Create tahap records
    for (let t = 1; t <= 4; t++) {
      let status = 'BELUM_DIMULAI';
      let files = null;

      if (t < tahapSaatIni) {
        status = 'SELESAI';
        files = [`https://example.com/tahap${t}_file.pdf`];
      } else if (t === tahapSaatIni) {
        status = Math.random() > 0.5 ? 'SEDANG_PROSES' : 'MENUNGGU_VALIDASI';
        files = [`https://example.com/tahap${t}_file.pdf`];
      }

      await prisma.tahapUmkm.create({
        data: {
          umkmId: umkm.id,
          tahap: t,
          status: status,
          file: files,
          tanggalSubmit: status !== 'BELUM_DIMULAI' ? new Date() : null,
          tanggalValidasi: status === 'SELESAI' ? new Date() : null,
        },
      });
    }
  }

  console.log('✅ UMKM binaan created');

  // Seed Notifikasi
  console.log('🔔 Seeding notifications...');

  // Notifikasi untuk semua user tentang event terbuka
  for (const user of [...userList, ...dosenList]) {
    await prisma.notifikasi.create({
      data: {
        userId: user.id,
        judul: 'Event Marketplace Baru Dibuka!',
        pesan: `Event "${openEvent.nama}" telah dibuka untuk pendaftaran. Daftar sekarang juga!`,
        link: `/marketplace/${openEvent.id}`,
        sudahBaca: Math.random() > 0.7, // 30% sudah dibaca
      },
    });
  }

  // Notifikasi untuk dosen tentang penugasan
  for (const dosen of dosenList.slice(0, 6)) {
    await prisma.notifikasi.create({
      data: {
        userId: dosen.id,
        judul: 'Penugasan Sebagai Penilai',
        pesan: `Anda ditugaskan sebagai penilai dalam event "${ongoingEvent.nama}". Silakan cek detail event.`,
        link: `/penilaian/${ongoingEvent.id}`,
        sudahBaca: Math.random() > 0.5,
      },
    });
  }

  // Notifikasi untuk admin tentang pending validasi
  await prisma.notifikasi.create({
    data: {
      userId: admin.id,
      judul: 'UMKM Menunggu Validasi',
      pesan:
        'Terdapat 5 UMKM yang menunggu validasi tahap. Mohon segera ditindaklanjuti.',
      link: '/admin/umkm',
      sudahBaca: false,
    },
  });

  console.log('✅ Notifications created');

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log('================');
  console.log('👤 Admin: 1');
  console.log(`👨‍🏫 Dosen: ${dosenList.length}`);
  console.log(`👥 Users: ${userList.length}`);
  console.log(`📅 Events: ${events.length}`);
  console.log(`🏪 Businesses: ${usahaList.length}`);
  console.log('🏭 UMKM: 25');
  console.log(
    `🔔 Notifications: ${userList.length + dosenList.length + 6 + 1}`
  );
  console.log('================');
  console.log('\n✅ Seed completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin:');
  console.log('  Email: admin@upt-pik.ac.id');
  console.log('  Password: password123');
  console.log('\nDosen:');
  console.log('  Email: dosen.teknik.1@ukdlsm.ac.id');
  console.log('  Password: password123');
  console.log('\nUser:');
  console.log('  Email: user1@gmail.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
