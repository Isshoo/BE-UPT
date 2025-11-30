import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/index.js';

export class ExportService {
  // ========== EXCEL EXPORTS ==========

  async exportUsersToExcel() {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
          fakultas: true,
          prodi: true,
          createdAt: true,
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Pengguna');

      // Add title
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'DATA PENGGUNA UPT-PIK';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getRow(1).height = 30;

      // Add export date
      worksheet.mergeCells('A2:G2');
      worksheet.getCell('A2').value =
        `Diekspor pada: ${new Date().toLocaleString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      // Add headers
      worksheet.addRow([]);
      const headerRow = worksheet.addRow([
        'No',
        'Nama Lengkap',
        'Email',
        'Role',
        'Fakultas',
        'Program Studi',
        'Tanggal Daftar',
      ]);

      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBA635' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Add data
      users.forEach((user, index) => {
        worksheet.addRow([
          index + 1,
          user.nama,
          user.email,
          user.role,
          user.fakultas || '-',
          user.prodi || '-',
          new Date(user.createdAt).toLocaleDateString('id-ID'),
        ]);
      });

      // Style columns
      worksheet.columns = [
        { width: 5 },
        { width: 25 },
        { width: 30 },
        { width: 12 },
        { width: 20 },
        { width: 25 },
        { width: 15 },
      ];

      // Add borders
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportUmkmToExcel() {
    try {
      const umkms = await prisma.umkm.findMany({
        include: {
          user: {
            select: {
              nama: true,
              email: true,
            },
          },
          tahap: {
            orderBy: { tahap: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data UMKM');

      // Add title
      worksheet.mergeCells('A1:H1');
      worksheet.getCell('A1').value = 'DATA UMKM BINAAN UPT-PIK';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getRow(1).height = 30;

      // Add export date
      worksheet.mergeCells('A2:H2');
      worksheet.getCell('A2').value =
        `Diekspor pada: ${new Date().toLocaleString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      // Add headers
      worksheet.addRow([]);
      const headerRow = worksheet.addRow([
        'No',
        'Nama UMKM',
        'Kategori',
        'Pemilik',
        'Kontak',
        'Tahap Saat Ini',
        'Status Tahap',
        'Tanggal Daftar',
      ]);

      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBA635' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Add data
      umkms.forEach((umkm, index) => {
        const currentStage = umkm.tahap.find(
          (t) => t.tahap === umkm.tahapSaatIni
        );

        worksheet.addRow([
          index + 1,
          umkm.nama,
          umkm.kategori,
          umkm.namaPemilik,
          umkm.telepon,
          `Tahap ${umkm.tahapSaatIni}`,
          currentStage?.status || '-',
          new Date(umkm.createdAt).toLocaleDateString('id-ID'),
        ]);
      });

      // Style columns
      worksheet.columns = [
        { width: 5 },
        { width: 25 },
        { width: 20 },
        { width: 20 },
        { width: 15 },
        { width: 12 },
        { width: 20 },
        { width: 15 },
      ];

      // Add borders
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportEventToExcel(eventId) {
    try {
      // Validasi: Cek apakah event ada
      const event = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
        include: {
          usaha: {
            include: {
              pemilik: {
                select: {
                  nama: true,
                  email: true,
                },
              },
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              kriteria: true,
              pemenang: {
                select: {
                  namaProduk: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const workbook = new ExcelJS.Workbook();

      // Sheet 1: Info Event
      const infoSheet = workbook.addWorksheet('Info Event');
      infoSheet.mergeCells('A1:B1');
      infoSheet.getCell('A1').value = `LAPORAN EVENT: ${event.nama}`;
      infoSheet.getCell('A1').font = { size: 14, bold: true };
      infoSheet.addRow([]);

      infoSheet.addRow(['Semester', event.semester]);
      infoSheet.addRow(['Tahun Ajaran', event.tahunAjaran]);
      infoSheet.addRow([
        'Tanggal Pelaksanaan',
        new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID'),
      ]);
      infoSheet.addRow(['Lokasi', event.lokasi]);
      infoSheet.addRow(['Kuota Peserta', event.kuotaPeserta]);
      infoSheet.addRow(['Total Peserta', event.usaha.length]);
      infoSheet.addRow(['Status', event.status]);

      infoSheet.columns = [{ width: 20 }, { width: 40 }];

      // Sheet 2: Daftar Peserta
      const pesertaSheet = workbook.addWorksheet('Daftar Peserta');
      const pesertaHeader = pesertaSheet.addRow([
        'No',
        'Nama Produk',
        'Kategori',
        'Tipe',
        'Pemilik',
        'Kontak',
        'Booth',
        'Status',
      ]);

      pesertaHeader.font = { bold: true };
      pesertaHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBA635' },
      };

      event.usaha.forEach((usaha, index) => {
        pesertaSheet.addRow([
          index + 1,
          usaha.namaProduk,
          usaha.kategori,
          usaha.tipeUsaha,
          usaha.pemilik.nama,
          usaha.telepon,
          usaha.nomorBooth || '-',
          usaha.disetujui ? 'Disetujui' : 'Menunggu',
        ]);
      });

      pesertaSheet.columns = [
        { width: 5 },
        { width: 25 },
        { width: 20 },
        { width: 15 },
        { width: 20 },
        { width: 15 },
        { width: 10 },
        { width: 15 },
      ];

      // Sheet 3: Kategori Penilaian
      if (event.kategoriPenilaian.length > 0) {
        const penilaianSheet = workbook.addWorksheet('Kategori Penilaian');
        const penilaianHeader = penilaianSheet.addRow([
          'No',
          'Kategori',
          'Pemenang',
          'Jumlah Kriteria',
        ]);

        penilaianHeader.font = { bold: true };
        penilaianHeader.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFBA635' },
        };

        event.kategoriPenilaian.forEach((kategori, index) => {
          penilaianSheet.addRow([
            index + 1,
            kategori.nama,
            kategori.pemenang?.namaProduk || 'Belum ada',
            kategori.kriteria.length,
          ]);
        });

        penilaianSheet.columns = [
          { width: 5 },
          { width: 30 },
          { width: 30 },
          { width: 18 },
        ];
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportAssessmentToExcel(kategoriId) {
    try {
      // Validasi: Cek apakah kategori ada
      const kategori = await prisma.kategoriPenilaian.findUnique({
        where: { id: kategoriId },
        include: {
          event: true,
          kriteria: true,
          pemenang: true,
        },
      });

      if (!kategori) {
        const error = new Error('Kategori penilaian tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Get all businesses with scores
      const businesses = await prisma.usaha.findMany({
        where: {
          eventId: kategori.eventId,
          disetujui: true,
          tipeUsaha: 'MAHASISWA',
        },
        include: {
          pemilik: {
            select: { nama: true },
          },
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Hasil Penilaian');

      // Title
      worksheet.mergeCells('A1:E1');
      worksheet.getCell('A1').value = `HASIL PENILAIAN: ${kategori.nama}`;
      worksheet.getCell('A1').font = { size: 14, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.addRow([]);
      worksheet.addRow(['Event', kategori.event.nama]);
      worksheet.addRow(['Kategori', kategori.nama]);
      worksheet.addRow([
        'Pemenang',
        kategori.pemenang?.namaProduk || 'Belum ditentukan',
      ]);
      worksheet.addRow([]);

      // Headers
      const headers = [
        'No',
        'Nama Produk',
        'Pemilik',
        'Booth',
        ...kategori.kriteria.map((k) => `${k.nama} (${k.bobot}%)`),
        'Total Nilai',
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBA635' },
      };

      // Data
      for (const [index, business] of businesses.entries()) {
        const scores = await prisma.nilaiPenilaian.findMany({
          where: {
            usahaId: business.id,
            kategoriId: kategori.id,
          },
        });

        const row = [
          index + 1,
          business.namaProduk,
          business.pemilik.nama,
          business.nomorBooth,
        ];

        let totalScore = 0;
        kategori.kriteria.forEach((kriteria) => {
          const score = scores.find((s) => s.kriteriaId === kriteria.id);
          const nilai = score?.nilai || 0;
          const weightedScore = (nilai * kriteria.bobot) / 100;
          totalScore += weightedScore;
          row.push(nilai);
        });

        row.push(totalScore.toFixed(2));
        worksheet.addRow(row);
      }

      // Set column widths
      worksheet.columns = [
        { width: 5 },
        { width: 25 },
        { width: 20 },
        { width: 10 },
        ...kategori.kriteria.map(() => ({ width: 15 })),
        { width: 12 },
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportAllMarketplaceToExcel(filters = {}) {
    try {
      const { status, semester, tahunAjaran } = filters;

      const where = {};
      if (status) where.status = status;
      if (semester) where.semester = semester;
      if (tahunAjaran) where.tahunAjaran = tahunAjaran;

      const events = await prisma.eventMarketplace.findMany({
        where,
        include: {
          _count: {
            select: {
              usaha: true,
            },
          },
        },
        orderBy: [{ tahunAjaran: 'desc' }, { semester: 'desc' }],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Marketplace');

      // Add title
      worksheet.mergeCells('A1:I1');
      worksheet.getCell('A1').value = 'DATA EVENT MARKETPLACE UPT-PIK';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getRow(1).height = 30;

      // Add export date
      worksheet.mergeCells('A2:I2');
      worksheet.getCell('A2').value =
        `Diekspor pada: ${new Date().toLocaleString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      // Add headers
      worksheet.addRow([]);
      const headerRow = worksheet.addRow([
        'No',
        'Nama Event',
        'Semester',
        'Tahun Ajaran',
        'Tanggal Pelaksanaan',
        'Lokasi',
        'Kuota',
        'Total Peserta',
        'Status',
      ]);

      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBA635' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Add data
      events.forEach((event, index) => {
        worksheet.addRow([
          index + 1,
          event.nama,
          event.semester,
          event.tahunAjaran,
          new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID'),
          event.lokasi,
          event.kuotaPeserta,
          event._count.usaha,
          event.status,
        ]);
      });

      // Style columns
      worksheet.columns = [
        { width: 5 },
        { width: 30 },
        { width: 12 },
        { width: 12 },
        { width: 18 },
        { width: 20 },
        { width: 8 },
        { width: 12 },
        { width: 15 },
      ];

      // Add borders
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }
      });

      // Add summary sheet
      const summarySheet = workbook.addWorksheet('Ringkasan');

      summarySheet.mergeCells('A1:B1');
      summarySheet.getCell('A1').value = 'RINGKASAN DATA MARKETPLACE';
      summarySheet.getCell('A1').font = { size: 14, bold: true };
      summarySheet.addRow([]);

      summarySheet.addRow(['Total Event', events.length]);
      summarySheet.addRow([
        'Total Peserta',
        events.reduce((sum, e) => sum + e._count.usaha, 0),
      ]);

      // Count by status
      const statusCount = events.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {});

      summarySheet.addRow([]);
      summarySheet.addRow(['Status', 'Jumlah']).font = { bold: true };
      Object.entries(statusCount).forEach(([status, count]) => {
        summarySheet.addRow([status, count]);
      });

      summarySheet.columns = [{ width: 25 }, { width: 15 }];

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportMarketplaceDetailed(filters = {}) {
    try {
      const { status, semester, tahunAjaran } = filters;

      const where = {};
      if (status) where.status = status;
      if (semester) where.semester = semester;
      if (tahunAjaran) where.tahunAjaran = tahunAjaran;

      const events = await prisma.eventMarketplace.findMany({
        where,
        include: {
          usaha: {
            include: {
              pemilik: {
                select: {
                  nama: true,
                  email: true,
                },
              },
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              pemenang: {
                select: {
                  namaProduk: true,
                },
              },
            },
          },
        },
        orderBy: [{ tahunAjaran: 'desc' }, { semester: 'desc' }],
      });

      const workbook = new ExcelJS.Workbook();

      // Sheet 1: Summary
      const summarySheet = workbook.addWorksheet('Ringkasan');
      summarySheet.mergeCells('A1:B1');
      summarySheet.getCell('A1').value = 'RINGKASAN DATA MARKETPLACE';
      summarySheet.getCell('A1').font = { size: 14, bold: true };
      summarySheet.addRow([]);

      summarySheet.addRow(['Total Event', events.length]);
      summarySheet.addRow([
        'Total Peserta',
        events.reduce((sum, e) => sum + e.usaha.length, 0),
      ]);

      summarySheet.columns = [{ width: 25 }, { width: 15 }];

      // Sheet 2: Events List
      const eventsSheet = workbook.addWorksheet('Daftar Event');
      const eventsHeader = eventsSheet.addRow([
        'No',
        'Nama Event',
        'Semester',
        'Tahun Ajaran',
        'Tanggal',
        'Lokasi',
        'Kuota',
        'Peserta',
        'Status',
      ]);

      eventsHeader.font = { bold: true };
      eventsHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBA635' },
      };

      events.forEach((event, index) => {
        eventsSheet.addRow([
          index + 1,
          event.nama,
          event.semester,
          event.tahunAjaran,
          new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID'),
          event.lokasi,
          event.kuotaPeserta,
          event.usaha.length,
          event.status,
        ]);
      });

      eventsSheet.columns = [
        { width: 5 },
        { width: 30 },
        { width: 12 },
        { width: 12 },
        { width: 18 },
        { width: 20 },
        { width: 8 },
        { width: 10 },
        { width: 15 },
      ];

      // Sheet 3: All Participants
      const participantsSheet = workbook.addWorksheet('Semua Peserta');
      const participantsHeader = participantsSheet.addRow([
        'No',
        'Event',
        'Nama Produk',
        'Kategori',
        'Tipe',
        'Pemilik',
        'Email',
        'Kontak',
        'Booth',
        'Status',
      ]);

      participantsHeader.font = { bold: true };
      participantsHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBA635' },
      };

      let participantNo = 1;
      events.forEach((event) => {
        event.usaha.forEach((usaha) => {
          participantsSheet.addRow([
            participantNo++,
            event.nama,
            usaha.namaProduk,
            usaha.kategori,
            usaha.tipeUsaha,
            usaha.pemilik.nama,
            usaha.pemilik.email,
            usaha.telepon,
            usaha.nomorBooth || '-',
            usaha.disetujui ? 'Disetujui' : 'Menunggu',
          ]);
        });
      });

      participantsSheet.columns = [
        { width: 5 },
        { width: 25 },
        { width: 25 },
        { width: 20 },
        { width: 15 },
        { width: 20 },
        { width: 25 },
        { width: 15 },
        { width: 10 },
        { width: 12 },
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  // ========== PDF EXPORTS ==========

  async exportEventToPDF(eventId) {
    try {
      // Validasi: Cek apakah event ada
      const event = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
        include: {
          usaha: {
            include: {
              pemilik: {
                select: {
                  nama: true,
                },
              },
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              pemenang: {
                select: {
                  namaProduk: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(20).text('LAPORAN EVENT MARKETPLACE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(event.nama, { align: 'center' });
        doc.moveDown(2);

        // Event Info
        doc.fontSize(12);
        doc.text(`Semester: ${event.semester}`);
        doc.text(`Tahun Ajaran: ${event.tahunAjaran}`);
        doc.text(
          `Tanggal: ${new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID')}`
        );
        doc.text(`Lokasi: ${event.lokasi}`);
        doc.text(`Status: ${event.status}`);
        doc.moveDown();
        doc.text(`Total Peserta: ${event.usaha.length}/${event.kuotaPeserta}`);
        doc.moveDown(2);

        // Participants
        doc.fontSize(14).text('Daftar Peserta', { underline: true });
        doc.moveDown();

        doc.fontSize(10);
        event.usaha.slice(0, 20).forEach((usaha, index) => {
          doc.text(
            `${index + 1}. ${usaha.namaProduk} - ${usaha.pemilik.nama} (Booth: ${usaha.nomorBooth || '-'})`
          );
        });

        if (event.usaha.length > 20) {
          doc.text(`... dan ${event.usaha.length - 20} peserta lainnya`);
        }

        doc.moveDown(2);

        // Winners
        if (event.kategoriPenilaian.some((k) => k.pemenang)) {
          doc.fontSize(14).text('Pemenang', { underline: true });
          doc.moveDown();

          doc.fontSize(10);
          event.kategoriPenilaian
            .filter((k) => k.pemenang)
            .forEach((kategori) => {
              doc.text(`${kategori.nama}: ${kategori.pemenang.namaProduk}`, {
                indent: 20,
              });
            });
        }

        // Footer
        doc
          .fontSize(8)
          .text(
            `Diekspor pada: ${new Date().toLocaleString('id-ID')}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );

        doc.end();
      });
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }
}
