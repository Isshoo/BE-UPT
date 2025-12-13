import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==================== DATA DEFINITIONS ====================

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

const DOSEN_DATA = [
  {
    nama: 'Inneke Victor, PhD',
    email: 'ivictor@unikadelasalle.ac.id',
    fakultasKode: 'Teknik',
    prodiNama: 'Teknik Industri',
  },
  {
    nama: 'Dr. John Doe, M.T.',
    email: 'jdoe@unikadelasalle.ac.id',
    fakultasKode: 'Teknik',
    prodiNama: 'Teknik Informatika',
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
  {
    nama: 'Dr. Maria Tan, M.M.',
    email: 'mtan@unikadelasalle.ac.id',
    fakultasKode: 'FEB',
    prodiNama: 'Manajemen',
  },
];

const USER_DATA = [
  {
    nama: 'Budi Santoso',
    email: 'budi.santoso@student.unikadelasalle.ac.id',
    fakultasKode: null,
    prodiNama: null,
  },
  {
    nama: 'Siti Rahayu',
    email: 'siti.rahayu@student.unikadelasalle.ac.id',
    fakultasKode: null,
    prodiNama: null,
  },
  {
    nama: 'Andi Wijaya',
    email: 'andi.wijaya@student.unikadelasalle.ac.id',
    fakultasKode: null,
    prodiNama: null,
  },
  {
    nama: 'Dewi Lestari',
    email: 'dewi.lestari@student.unikadelasalle.ac.id',
    fakultasKode: null,
    prodiNama: null,
  },
  {
    nama: 'Rudi Hermawan',
    email: 'rudi.hermawan@student.unikadelasalle.ac.id',
    fakultasKode: null,
    prodiNama: null,
  },
  {
    nama: 'Maya Putri',
    email: 'maya.putri@student.unikadelasalle.ac.id',
    fakultasKode: null,
    prodiNama: null,
  },
  {
    nama: 'Pak Ahmad',
    email: 'ahmad.umkm@gmail.com',
    fakultasKode: null,
    prodiNama: null,
  }, // UMKM Luar
  {
    nama: 'Bu Sari',
    email: 'sari.umkm@gmail.com',
    fakultasKode: null,
    prodiNama: null,
  }, // UMKM Luar
];

const EVENT_DATA = [
  {
    nama: 'Bazaar Kewirausahaan 2024',
    deskripsi:
      'Event bazaar tahunan untuk memamerkan produk mahasiswa dan UMKM lokal. Acara ini bertujuan untuk meningkatkan jiwa kewirausahaan dan memberikan pengalaman langsung dalam berjualan.',
    semester: 'Ganjil',
    tahunAjaran: '2024/2025',
    lokasi: 'Gedung Auditorium Lt. 1',
    tanggalPelaksanaan: new Date('2024-11-15'),
    kuotaPeserta: 50,
    status: 'SELESAI',
  },
  {
    nama: 'Creative Market Festival',
    deskripsi:
      'Festival pasar kreatif yang menampilkan produk-produk inovatif dari mahasiswa berbagai jurusan. Tema tahun ini adalah "Sustainable Innovation".',
    semester: 'Genap',
    tahunAjaran: '2024/2025',
    lokasi: 'Lapangan Parkir Kampus',
    tanggalPelaksanaan: new Date('2025-03-20'),
    kuotaPeserta: 40,
    status: 'BERLANGSUNG',
  },
  {
    nama: 'Tech Startup Expo 2025',
    deskripsi:
      'Pameran startup teknologi yang dikembangkan oleh mahasiswa Fakultas Teknik. Kesempatan untuk networking dengan investor dan pelaku industri.',
    semester: 'Ganjil',
    tahunAjaran: '2025/2026',
    lokasi: 'Gedung Teknik Lt. 2',
    tanggalPelaksanaan: new Date('2025-10-08'),
    kuotaPeserta: 30,
    status: 'TERBUKA',
  },
];

const SPONSOR_DATA = [
  {
    nama: 'Bank Sulutgo',
    logo: 'https://res.cloudinary.com/dtkczgmyn/image/upload/v1765461453/bank-sulutgo_nsmnpm.jpg',
  },
  {
    nama: 'Telkom Indonesia',
    logo: 'https://res.cloudinary.com/dtkczgmyn/image/upload/v1765461512/1200px-Telkom_Indonesia_2013.svg_yuul45.png',
  },
  {
    nama: 'Tokopedia',
    logo: 'https://res.cloudinary.com/dtkczgmyn/image/upload/v1765461428/tokopedia-icon-logo-symbol-free-png_iil1k1.png',
  },
  {
    nama: 'Shopee',
    logo: 'https://res.cloudinary.com/dtkczgmyn/image/upload/v1765461533/x5eTGWrJa0goC6lBiHyfJy6P-nYBpk3J6WloVtD4mKCMZht0ja8mOlX0B96wtVHgiwSrN-IgQn_JwWy3k1p0XA_w600-h300-pc0xffffff-pd_webi0u.png',
  },
  {
    nama: 'Gojek',
    logo: 'https://res.cloudinary.com/dtkczgmyn/image/upload/v1765461549/gojek-icon-logo-symbol-free-png_gvb1cx.png',
  },
];

const KATEGORI_DATA = [
  {
    nama: 'Best Innovation',
    deskripsi: 'Penghargaan untuk produk/usaha paling inovatif',
  },
  {
    nama: 'Best Design',
    deskripsi: 'Penghargaan untuk desain produk/booth terbaik',
  },
  { nama: 'Best Sales', deskripsi: 'Penghargaan untuk penjualan tertinggi' },
  {
    nama: 'Best Presentation',
    deskripsi: 'Penghargaan untuk presentasi dan pelayanan terbaik',
  },
];

const KRITERIA_DATA = [
  { nama: 'Kreativitas', bobot: 30 },
  { nama: 'Kualitas Produk', bobot: 25 },
  { nama: 'Presentasi', bobot: 20 },
  { nama: 'Packaging', bobot: 15 },
  { nama: 'Kebersihan', bobot: 10 },
];

const USAHA_MAHASISWA_DATA = [
  {
    namaProduk: 'EcoBottle - Botol Ramah Lingkungan',
    kategori: 'Produk Ramah Lingkungan',
    deskripsi:
      'Botol minum yang terbuat dari bahan daur ulang dan dapat diurai secara alami. Dilengkapi dengan filter air portable.',
    telepon: '081234567890',
    mataKuliah: 'Kewirausahaan',
    anggota: [
      { nama: 'Budi Santoso', nim: '20210001' },
      { nama: 'Ahmad Fauzi', nim: '20210002' },
    ],
  },
  {
    namaProduk: 'SnackSehat - Camilan Organik',
    kategori: 'Makanan & Minuman',
    deskripsi:
      'Camilan sehat berbahan organik tanpa pengawet. Tersedia berbagai varian rasa yang lezat dan bergizi.',
    telepon: '081234567891',
    mataKuliah: 'Manajemen Bisnis',
    anggota: [
      { nama: 'Siti Rahayu', nim: '20210003' },
      { nama: 'Dewi Kusuma', nim: '20210004' },
    ],
  },
  {
    namaProduk: 'SmartFarm IoT',
    kategori: 'Teknologi',
    deskripsi:
      'Sistem monitoring pertanian berbasis IoT yang dapat memantau kelembaban tanah, suhu, dan memberikan notifikasi otomatis.',
    telepon: '081234567892',
    mataKuliah: 'Proyek Akhir',
    anggota: [
      { nama: 'Andi Wijaya', nim: '20210005' },
      { nama: 'Rudi Hermawan', nim: '20210006' },
    ],
  },
  {
    namaProduk: 'Herbal Care - Produk Kesehatan',
    kategori: 'Kesehatan',
    deskripsi:
      'Produk perawatan kesehatan berbahan herbal alami. Terdiri dari minyak esensial, salep herbal, dan suplemen.',
    telepon: '081234567893',
    mataKuliah: 'Kewirausahaan',
    anggota: [
      { nama: 'Maya Putri', nim: '20210007' },
      { nama: 'Lisa Andini', nim: '20210008' },
    ],
  },
];

const USAHA_UMKM_DATA = [
  {
    namaProduk: 'Kue Tradisional Bu Sari',
    kategori: 'Makanan Tradisional',
    deskripsi:
      'Aneka kue tradisional khas Manado yang dibuat dengan resep turun temurun. Kualitas terjamin dan rasa autentik.',
    telepon: '081345678901',
    namaPemilik: 'Ibu Sari Wulandari',
    alamat: 'Jl. Sam Ratulangi No. 45, Manado',
  },
  {
    namaProduk: 'Kerajinan Bambu Pak Ahmad',
    kategori: 'Kerajinan Tangan',
    deskripsi:
      'Berbagai kerajinan tangan dari bambu berkualitas tinggi. Produk ramah lingkungan dengan desain modern.',
    telepon: '081345678902',
    namaPemilik: 'Bapak Ahmad Hidayat',
    alamat: 'Jl. Wolter Monginsidi No. 12, Manado',
  },
];

// ==================== SEED FUNCTIONS ====================

async function seedFakultasProdi() {
  console.log('\n📚 Seeding Fakultas & Prodi...');
  const fakultasMap = new Map();
  const prodiMap = new Map();

  for (const data of FAKULTAS_PRODI_DATA) {
    const fakultas = await prisma.fakultas.upsert({
      where: { kode: data.kode },
      update: { nama: data.nama },
      create: { kode: data.kode, nama: data.nama },
    });
    fakultasMap.set(data.kode, fakultas.id);
    console.log(`   ✅ Fakultas: ${fakultas.nama}`);

    for (const namaProdi of data.prodi) {
      const prodi = await prisma.prodi.upsert({
        where: {
          nama_fakultasId: { nama: namaProdi, fakultasId: fakultas.id },
        },
        update: {},
        create: { nama: namaProdi, fakultasId: fakultas.id },
      });
      prodiMap.set(`${data.kode}:${namaProdi}`, prodi.id);
    }
  }

  return { fakultasMap, prodiMap };
}

async function seedUsers(hashedPassword, fakultasMap, prodiMap) {
  console.log('\n👥 Seeding Users...');
  const userMap = new Map();

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'upt-pik@unikadelasalle.ac.id' },
    update: {},
    create: {
      email: 'upt-pik@unikadelasalle.ac.id',
      password: hashedPassword,
      nama: 'Admin UPT-PIK',
      role: 'ADMIN',
    },
  });
  userMap.set('admin', admin.id);
  console.log(`   ✅ Admin: ${admin.nama}`);

  // Dosen
  for (const d of DOSEN_DATA) {
    const dosen = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        password: hashedPassword,
        nama: d.nama,
        role: 'DOSEN',
        fakultasId: fakultasMap.get(d.fakultasKode),
        prodiId: prodiMap.get(`${d.fakultasKode}:${d.prodiNama}`),
      },
    });
    userMap.set(d.email, dosen.id);
    console.log(`   ✅ Dosen: ${dosen.nama}`);
  }

  // Regular Users
  for (const u of USER_DATA) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: hashedPassword,
        nama: u.nama,
        role: 'USER',
        fakultasId: u.fakultasKode ? fakultasMap.get(u.fakultasKode) : null,
        prodiId:
          u.fakultasKode && u.prodiNama
            ? prodiMap.get(`${u.fakultasKode}:${u.prodiNama}`)
            : null,
      },
    });
    userMap.set(u.email, user.id);
    console.log(`   ✅ User: ${user.nama}`);
  }

  return userMap;
}

async function seedEvents() {
  console.log('\n📅 Seeding Events...');
  const eventMap = new Map();

  for (let i = 0; i < EVENT_DATA.length; i++) {
    const e = EVENT_DATA[i];
    const event = await prisma.eventMarketplace.create({
      data: e,
    });
    eventMap.set(i, event.id);
    console.log(`   ✅ Event: ${event.nama} (${event.status})`);
  }

  return eventMap;
}

async function seedSponsors(eventMap) {
  console.log('\n🏢 Seeding Sponsors...');

  // Assign sponsors to events
  for (let i = 0; i < EVENT_DATA.length; i++) {
    const numSponsors = Math.min(3, SPONSOR_DATA.length);
    for (let j = 0; j < numSponsors; j++) {
      const s = SPONSOR_DATA[(i + j) % SPONSOR_DATA.length];
      await prisma.sponsor.create({
        data: {
          nama: s.nama,
          logo: s.logo,
          eventId: eventMap.get(i),
        },
      });
    }
  }
  console.log('   ✅ Sponsors added to all events');
}

async function seedKategoriAndKriteria(eventMap, userMap) {
  console.log('\n🏆 Seeding Kategori & Kriteria Penilaian...');
  const kategoriMap = new Map();

  // Get dosen IDs for penilai
  const dosenEmails = DOSEN_DATA.map((d) => d.email);
  const dosenIds = dosenEmails
    .map((email) => userMap.get(email))
    .filter(Boolean);

  for (let i = 0; i < EVENT_DATA.length; i++) {
    const eventId = eventMap.get(i);

    for (let k = 0; k < KATEGORI_DATA.length; k++) {
      const kat = KATEGORI_DATA[k];

      // Assign 1 random dosen as penilai
      const shuffledDosen = [...dosenIds].sort(() => Math.random() - 0.5);
      const penilaiIds = shuffledDosen.slice(0, 1);

      const kategori = await prisma.kategoriPenilaian.create({
        data: {
          nama: kat.nama,
          deskripsi: kat.deskripsi,
          eventId: eventId,
          penilai: {
            connect: penilaiIds.map((id) => ({ id })),
          },
        },
      });
      kategoriMap.set(`${i}:${k}`, kategori.id);

      // Add kriteria
      for (const krit of KRITERIA_DATA) {
        await prisma.kriteriaPenilaian.create({
          data: {
            nama: krit.nama,
            bobot: krit.bobot,
            kategoriId: kategori.id,
          },
        });
      }
    }
    console.log(`   ✅ Kategori & Kriteria for Event ${i + 1}`);
  }

  return kategoriMap;
}

async function seedUsaha(eventMap, userMap, fakultasMap, prodiMap) {
  console.log('\n🏪 Seeding Usaha...');
  const usahaMap = new Map();

  const userEmails = USER_DATA.map((u) => u.email);
  let usahaIndex = 0;

  for (let i = 0; i < EVENT_DATA.length; i++) {
    const eventId = eventMap.get(i);

    // Usaha Mahasiswa
    for (let m = 0; m < USAHA_MAHASISWA_DATA.length; m++) {
      const u = USAHA_MAHASISWA_DATA[m];
      const ownerEmail = userEmails[m % userEmails.length];

      // Get a dosen as pembimbing
      const pembimbingEmail = DOSEN_DATA[m % DOSEN_DATA.length].email;

      const fakultasId = fakultasMap.get(
        DOSEN_DATA[m % DOSEN_DATA.length].fakultasKode
      );
      const prodiId = prodiMap.get(
        `${DOSEN_DATA[m % DOSEN_DATA.length].fakultasKode}:${DOSEN_DATA[m % DOSEN_DATA.length].prodiNama}`
      );

      const usaha = await prisma.usaha.create({
        data: {
          namaProduk: u.namaProduk,
          kategori: u.kategori,
          deskripsi: u.deskripsi,
          tipeUsaha: 'MAHASISWA',
          telepon: u.telepon,
          mataKuliah: u.mataKuliah,
          anggota: u.anggota,
          ketuaId: u.anggota[0]?.nim || null,
          eventId: eventId,
          pemilikId: userMap.get(ownerEmail),
          fakultasId: fakultasId,
          prodiId: prodiId,
          pembimbingId: userMap.get(pembimbingEmail),
          nomorBooth:
            EVENT_DATA[i].status !== 'TERBUKA'
              ? `A${(usahaIndex % 20) + 1}`
              : null,
          status: EVENT_DATA[i].status !== 'TERBUKA' ? 'DISETUJUI' : 'PENDING',
        },
      });
      usahaMap.set(`${i}:mahasiswa:${m}`, usaha.id);
      usahaIndex++;
    }

    // Usaha UMKM Luar (only for some events)
    if (i < 2) {
      for (let m = 0; m < USAHA_UMKM_DATA.length; m++) {
        const u = USAHA_UMKM_DATA[m];
        const ownerEmail =
          USER_DATA.find((user) => user.fakultasKode === null)?.email ||
          userEmails[0];

        const usaha = await prisma.usaha.create({
          data: {
            namaProduk: u.namaProduk,
            kategori: u.kategori,
            deskripsi: u.deskripsi,
            tipeUsaha: 'UMKM_LUAR',
            telepon: u.telepon,
            namaPemilik: u.namaPemilik,
            alamat: u.alamat,
            eventId: eventId,
            pemilikId: userMap.get(ownerEmail),
            nomorBooth:
              EVENT_DATA[i].status !== 'TERBUKA'
                ? `B${(usahaIndex % 10) + 1}`
                : null,
            status:
              EVENT_DATA[i].status !== 'TERBUKA' ? 'DISETUJUI' : 'PENDING',
          },
        });
        usahaMap.set(`${i}:umkm:${m}`, usaha.id);
        usahaIndex++;
      }
    }

    console.log(`   ✅ Usaha for Event ${i + 1}`);
  }

  return usahaMap;
}

async function seedNilaiPenilaian(eventMap, usahaMap, userMap) {
  console.log('\n📊 Seeding Nilai Penilaian...');

  // Only seed nilai for completed events
  for (let i = 0; i < EVENT_DATA.length; i++) {
    if (EVENT_DATA[i].status !== 'SELESAI') continue;

    const eventId = eventMap.get(i);

    // Get all kategori for this event
    const kategoriList = await prisma.kategoriPenilaian.findMany({
      where: { eventId },
      include: { kriteria: true, penilai: true },
    });

    // Get all usaha for this event
    const usahaList = await prisma.usaha.findMany({
      where: { eventId, status: 'DISETUJUI' },
    });

    for (const kategori of kategoriList) {
      for (const usaha of usahaList) {
        for (const kriteria of kategori.kriteria) {
          for (const penilai of kategori.penilai) {
            // Generate random score between 60-100
            const nilai = Math.floor(Math.random() * 41) + 60;

            await prisma.nilaiPenilaian.upsert({
              where: {
                usahaId_kategoriId_kriteriaId: {
                  usahaId: usaha.id,
                  kategoriId: kategori.id,
                  kriteriaId: kriteria.id,
                },
              },
              update: { nilai },
              create: {
                nilai,
                usahaId: usaha.id,
                kategoriId: kategori.id,
                kriteriaId: kriteria.id,
                penilaiId: penilai.id,
              },
            });
          }
        }
      }

      // Set a random winner for completed events
      if (usahaList.length > 0) {
        const winnerId =
          usahaList[Math.floor(Math.random() * usahaList.length)].id;
        await prisma.kategoriPenilaian.update({
          where: { id: kategori.id },
          data: { pemenangId: winnerId },
        });
      }
    }

    console.log(`   ✅ Nilai for Event ${i + 1}`);
  }
}

async function seedRiwayatMarketplace(eventMap, usahaMap, userMap) {
  console.log('\n📜 Seeding Riwayat Marketplace...');

  const usahaList = await prisma.usaha.findMany({
    include: { pemilik: true },
  });

  for (const usaha of usahaList) {
    await prisma.riwayatMarketplace.upsert({
      where: {
        userId_eventId: {
          userId: usaha.pemilikId,
          eventId: usaha.eventId,
        },
      },
      update: {},
      create: {
        userId: usaha.pemilikId,
        eventId: usaha.eventId,
        usahaId: usaha.id,
      },
    });
  }

  console.log('   ✅ Riwayat created for all participants');
}

async function seedNotifikasi(userMap) {
  console.log('\n🔔 Seeding Notifikasi...');

  const notifikasiData = [
    {
      judul: 'Selamat Datang!',
      pesan:
        'Terima kasih telah bergabung di platform UPT-PIK. Silakan lengkapi profil Anda.',
      link: '/profile',
    },
    {
      judul: 'Event Baru Dibuka',
      pesan:
        'Tech Startup Expo 2025 sudah dibuka untuk pendaftaran. Segera daftarkan usaha Anda!',
      link: '/marketplace',
    },
    {
      judul: 'Pendaftaran Diterima',
      pesan:
        'Selamat! Pendaftaran usaha Anda untuk Bazaar Kewirausahaan 2024 telah diterima.',
      link: null,
    },
  ];

  const adminId = userMap.get('admin');
  const userIds = Array.from(userMap.values()).filter((id) => id !== adminId);

  for (const userId of userIds) {
    // Give each user 1-2 random notifications
    const numNotifs = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numNotifs; i++) {
      const notif = notifikasiData[i % notifikasiData.length];
      await prisma.notifikasi.create({
        data: {
          userId,
          judul: notif.judul,
          pesan: notif.pesan,
          link: notif.link,
          sudahBaca: Math.random() > 0.5,
        },
      });
    }
  }

  console.log('   ✅ Notifications created for all users');
}

async function clearDatabase() {
  console.log('\n🧹 Clearing database...');

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

// ==================== MAIN FUNCTION ====================

async function main() {
  await clearDatabase();
  console.log('🌱 Starting comprehensive database seeding...\n');
  console.log('='.repeat(50));

  const hashedPassword = await bcrypt.hash('1234', 10);

  // 1. Seed Fakultas & Prodi
  const { fakultasMap, prodiMap } = await seedFakultasProdi();

  // 2. Seed Users (Admin, Dosen, Regular Users)
  const userMap = await seedUsers(hashedPassword, fakultasMap, prodiMap);

  // 3. Seed Events
  const eventMap = await seedEvents();

  // 4. Seed Sponsors
  await seedSponsors(eventMap);

  // 5. Seed Kategori & Kriteria Penilaian
  const kategoriMap = await seedKategoriAndKriteria(eventMap, userMap);

  // 6. Seed Usaha
  const usahaMap = await seedUsaha(eventMap, userMap, fakultasMap, prodiMap);

  // 7. Seed Nilai Penilaian (only for completed events)
  await seedNilaiPenilaian(eventMap, usahaMap, userMap);

  // 8. Seed Riwayat Marketplace
  await seedRiwayatMarketplace(eventMap, usahaMap, userMap);

  // 9. Seed Notifikasi
  await seedNotifikasi(userMap);

  console.log('\n' + '='.repeat(50));
  console.log('✨ Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - ${FAKULTAS_PRODI_DATA.length} Fakultas`);
  console.log(
    `   - ${FAKULTAS_PRODI_DATA.reduce((acc, f) => acc + f.prodi.length, 0)} Prodi`
  );
  console.log(
    `   - 1 Admin + ${DOSEN_DATA.length} Dosen + ${USER_DATA.length} Users`
  );
  console.log(`   - ${EVENT_DATA.length} Events`);
  console.log(`   - ${KATEGORI_DATA.length} Kategori per Event`);
  console.log('   - Multiple Usaha per Event');
  console.log('\n🔐 Default credentials:');
  console.log('   Admin: upt-pik@unikadelasalle.ac.id / 1234');
  console.log('   All users: [email] / 1234');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
