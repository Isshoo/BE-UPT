import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/index.js';

export class ExportService {
  // ========== HELPER METHODS ==========

  // Draw a professional table in PDF
  drawTable(doc, headers, rows, options = {}) {
    const {
      startX = 50,
      startY = doc.y,
      columnWidths = [],
      headerColor = '#174c4e',
      rowHeight = 20,
      fontSize = 9,
    } = options;

    const pageWidth = doc.page.width - 100;
    const numColumns = headers.length;
    const defaultWidth = pageWidth / numColumns;

    // Calculate column widths
    const widths = headers.map((_, i) => columnWidths[i] || defaultWidth);

    // Draw header row
    let x = startX;
    let y = startY;

    doc.fillColor(headerColor).rect(x, y, pageWidth, rowHeight).fill();

    doc.fillColor('#ffffff').fontSize(fontSize).font('Helvetica-Bold');

    headers.forEach((header, i) => {
      doc.text(header, x + 4, y + 5, {
        width: widths[i] - 8,
        height: rowHeight,
        align: 'left',
      });
      x += widths[i];
    });

    y += rowHeight;

    // Draw data rows
    doc.fillColor('#000000').font('Helvetica').fontSize(fontSize);

    rows.forEach((row, rowIndex) => {
      x = startX;

      // Check if we need a new page
      if (y + rowHeight > doc.page.height - 80) {
        doc.addPage();
        y = 50;

        // Redraw header on new page
        doc.fillColor(headerColor).rect(x, y, pageWidth, rowHeight).fill();
        doc.fillColor('#ffffff').font('Helvetica-Bold');
        headers.forEach((header, i) => {
          doc.text(header, x + 4, y + 5, { width: widths[i] - 8 });
          x += widths[i];
        });
        y += rowHeight;
        x = startX;
        doc.fillColor('#000000').font('Helvetica');
      }

      // Alternate row background
      if (rowIndex % 2 === 0) {
        doc.fillColor('#f9f9f9').rect(x, y, pageWidth, rowHeight).fill();
      }

      // Draw borders
      doc.strokeColor('#e0e0e0').lineWidth(0.5);
      doc.rect(x, y, pageWidth, rowHeight).stroke();

      // Draw cell content
      doc.fillColor('#333333');
      row.forEach((cell, i) => {
        const cellValue =
          cell !== null && cell !== undefined ? String(cell) : '-';
        doc.text(cellValue, x + 4, y + 5, {
          width: widths[i] - 8,
          height: rowHeight - 4,
          align: 'left',
          ellipsis: true,
        });
        x += widths[i];
      });

      y += rowHeight;
    });

    return y;
  }

  // Add PDF header
  addPdfHeader(doc, title, subtitle = null) {
    // Header background
    doc.fillColor('#174c4e').rect(0, 0, doc.page.width, 80).fill();

    // Title
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold');
    doc.text(title, 50, 25, { align: 'center', width: doc.page.width - 100 });

    if (subtitle) {
      doc.fontSize(12).font('Helvetica');
      doc.text(subtitle, 50, 50, {
        align: 'center',
        width: doc.page.width - 100,
      });
    }

    doc.moveDown(3);
    doc.fillColor('#000000').font('Helvetica');
  }

  // Add PDF footer with page numbers
  addPdfFooter(doc) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      // Footer line
      doc.strokeColor('#e0e0e0').lineWidth(1);
      doc
        .moveTo(50, doc.page.height - 50)
        .lineTo(doc.page.width - 50, doc.page.height - 50)
        .stroke();

      // Export date
      doc.fillColor('#666666').fontSize(8).font('Helvetica');
      doc.text(
        `Diekspor pada: ${new Date().toLocaleString('id-ID')}`,
        50,
        doc.page.height - 40
      );

      // Page number
      doc.text(
        `Halaman ${i + 1} dari ${pages.count}`,
        doc.page.width - 150,
        doc.page.height - 40
      );
    }
  }

  // Add summary box
  addSummaryBox(doc, items) {
    const startY = doc.y;
    const boxWidth = (doc.page.width - 100) / items.length;

    items.forEach((item, i) => {
      const x = 50 + i * boxWidth;

      // Box background
      doc
        .fillColor('#f8f9fa')
        .rect(x, startY, boxWidth - 10, 50)
        .fill();
      doc
        .strokeColor('#e0e0e0')
        .rect(x, startY, boxWidth - 10, 50)
        .stroke();

      // Label
      doc.fillColor('#666666').fontSize(9).font('Helvetica');
      doc.text(item.label, x + 10, startY + 10, { width: boxWidth - 30 });

      // Value
      doc.fillColor('#174c4e').fontSize(16).font('Helvetica-Bold');
      doc.text(String(item.value), x + 10, startY + 28, {
        width: boxWidth - 30,
      });
    });

    doc.y = startY + 60;
    doc.fillColor('#000000').font('Helvetica');
  }

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
          fakultas: { select: { nama: true } },
          prodi: { select: { nama: true } },
          createdAt: true,
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Pengguna');

      // Title
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'DATA PENGGUNA UPT-PIK';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getRow(1).height = 30;

      // Export date
      worksheet.mergeCells('A2:G2');
      worksheet.getCell('A2').value =
        `Diekspor pada: ${new Date().toLocaleString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      // Headers
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

      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Data
      users.forEach((user, index) => {
        worksheet.addRow([
          index + 1,
          user.nama,
          user.email,
          user.role,
          user.fakultas?.nama || '-',
          user.prodi?.nama || '-',
          new Date(user.createdAt).toLocaleDateString('id-ID'),
        ]);
      });

      // Column widths
      worksheet.columns = [
        { width: 5 },
        { width: 25 },
        { width: 30 },
        { width: 12 },
        { width: 20 },
        { width: 25 },
        { width: 15 },
      ];

      // Borders
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

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportUsersToPDF() {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          nama: true,
          email: true,
          role: true,
          fakultas: { select: { nama: true } },
          prodi: { select: { nama: true } },
          createdAt: true,
        },
      });

      // Count by role
      const roleCount = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          bufferPages: true,
        });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addPdfHeader(
          doc,
          'DATA PENGGUNA UPT-PIK',
          `Total: ${users.length} pengguna`
        );

        doc.y = 100;

        // Summary
        this.addSummaryBox(doc, [
          { label: 'Total Pengguna', value: users.length },
          { label: 'User', value: roleCount['USER'] || 0 },
          { label: 'Dosen', value: roleCount['DOSEN'] || 0 },
          { label: 'Admin', value: roleCount['ADMIN'] || 0 },
        ]);

        doc.moveDown();

        // Table
        const headers = ['No', 'Nama Lengkap', 'Email', 'Role', 'Fakultas'];
        const rows = users.map((user, i) => [
          i + 1,
          user.nama,
          user.email,
          user.role,
          user.fakultas?.nama || '-',
        ]);

        this.drawTable(doc, headers, rows, {
          columnWidths: [30, 120, 150, 60, 130],
        });

        // Footer
        // this.addPdfFooter(doc);

        doc.end();
      });
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportEventToExcel(eventId) {
    try {
      const event = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
        include: {
          usaha: {
            include: {
              pemilik: { select: { nama: true, email: true } },
              pembimbing: { select: { nama: true } },
              fakultas: { select: { nama: true } },
              prodi: { select: { nama: true } },
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              kriteria: true,
              pemenang: { select: { namaProduk: true, nomorBooth: true } },
              penilai: { select: { nama: true } },
            },
          },
          sponsor: true,
        },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'UPT Pusat Inovasi dan Kewirausahaan';
      workbook.created = new Date();

      // Calculate statistics
      const approvedCount = event.usaha.filter(
        (u) => u.status === 'DISETUJUI'
      ).length;
      const pendingCount = event.usaha.filter(
        (u) => u.status === 'PENDING'
      ).length;
      const rejectedCount = event.usaha.filter(
        (u) => u.status === 'DITOLAK'
      ).length;
      const mahasiswaCount = event.usaha.filter(
        (u) => u.tipeUsaha === 'MAHASISWA'
      ).length;
      const umkmCount = event.usaha.filter(
        (u) => u.tipeUsaha === 'UMKM_LUAR'
      ).length;

      // Faculty distribution
      const fakultasDistribution = {};
      event.usaha.forEach((u) => {
        const fakultas = u.fakultas?.nama || 'Umum/Eksternal';
        fakultasDistribution[fakultas] =
          (fakultasDistribution[fakultas] || 0) + 1;
      });

      // ========== SHEET 1: RINGKASAN ==========
      const summarySheet = workbook.addWorksheet('Ringkasan');

      // Header
      summarySheet.mergeCells('A1:D1');
      summarySheet.getCell('A1').value = 'UPT PUSAT INOVASI DAN KEWIRAUSAHAAN';
      summarySheet.getCell('A1').font = { size: 12, bold: true };
      summarySheet.getCell('A1').alignment = { horizontal: 'center' };

      summarySheet.mergeCells('A2:D2');
      summarySheet.getCell('A2').value =
        'Universitas Katolik De La Salle Manado';
      summarySheet.getCell('A2').alignment = { horizontal: 'center' };

      summarySheet.addRow([]);

      summarySheet.mergeCells('A4:D4');
      summarySheet.getCell('A4').value = `LAPORAN EVENT: ${event.nama}`;
      summarySheet.getCell('A4').font = { size: 14, bold: true };
      summarySheet.getCell('A4').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
      };
      summarySheet.getCell('A4').font = {
        size: 14,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      summarySheet.getCell('A4').alignment = { horizontal: 'center' };

      summarySheet.addRow([]);

      // Info Event
      const infoData = [
        ['Semester', event.semester],
        ['Tahun Ajaran', event.tahunAjaran],
        [
          'Hari/Tanggal',
          new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        ],
        ['Lokasi', event.lokasi],
        ['Status Event', event.status],
        ['Kuota Peserta', event.kuotaPeserta],
        [''],
        ['STATISTIK PESERTA'],
        ['Total Peserta', event.usaha.length],
        ['Peserta Disetujui', approvedCount],
        ['Menunggu Verifikasi', pendingCount],
        ['Ditolak', rejectedCount],
        [''],
        ['KOMPOSISI PESERTA'],
        ['Mahasiswa', mahasiswaCount],
        ['UMKM Luar', umkmCount],
        [''],
        ['KATEGORI PENILAIAN', event.kategoriPenilaian.length],
        ['SPONSOR', event.sponsor?.length || 0],
      ];

      infoData.forEach(([label, value]) => {
        if (label === '') {
          summarySheet.addRow([]);
        } else if (value === undefined) {
          const row = summarySheet.addRow([label]);
          row.getCell(1).font = { bold: true, size: 11 };
          row.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFf0f0f0' },
          };
        } else {
          const row = summarySheet.addRow([label, value]);
          row.getCell(1).font = { bold: true };
        }
      });

      summarySheet.columns = [{ width: 25 }, { width: 40 }];

      // ========== SHEET 2: DISTRIBUSI FAKULTAS ==========
      const fakultasSheet = workbook.addWorksheet('Distribusi Fakultas');
      const fakultasHeader = fakultasSheet.addRow([
        'No',
        'Fakultas',
        'Jumlah Peserta',
        'Persentase',
      ]);
      fakultasHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      fakultasHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
      };

      Object.entries(fakultasDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([fakultas, count], index) => {
          fakultasSheet.addRow([
            index + 1,
            fakultas,
            count,
            `${((count / (event.usaha.length || 1)) * 100).toFixed(1)}%`,
          ]);
        });

      fakultasSheet.columns = [
        { width: 5 },
        { width: 35 },
        { width: 15 },
        { width: 12 },
      ];

      // ========== SHEET 3: DAFTAR PESERTA ==========
      const pesertaSheet = workbook.addWorksheet('Daftar Peserta');
      const pesertaHeader = pesertaSheet.addRow([
        'No',
        'Booth',
        'Nama Produk',
        'Kategori',
        'Tipe Usaha',
        'Pemilik',
        'Email',
        'Telepon',
        'Fakultas',
        'Prodi',
        'Pembimbing',
        'Status',
      ]);

      pesertaHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      pesertaHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
      };

      event.usaha.forEach((usaha, index) => {
        pesertaSheet.addRow([
          index + 1,
          usaha.nomorBooth || '-',
          usaha.namaProduk,
          usaha.kategori,
          usaha.tipeUsaha === 'MAHASISWA' ? 'Mahasiswa' : 'UMKM Luar',
          usaha.pemilik.nama,
          usaha.pemilik.email,
          usaha.telepon,
          usaha.fakultas?.nama || '-',
          usaha.prodi?.nama || '-',
          usaha.pembimbing?.nama || '-',
          usaha.status,
        ]);
      });

      pesertaSheet.columns = [
        { width: 5 },
        { width: 8 },
        { width: 25 },
        { width: 15 },
        { width: 12 },
        { width: 20 },
        { width: 25 },
        { width: 15 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 12 },
      ];

      // ========== SHEET 4+: HASIL PENILAIAN PER KATEGORI ==========
      for (const kategori of event.kategoriPenilaian) {
        const sheetName = `Penilaian - ${kategori.nama.substring(0, 20)}`;
        const scoreSheet = workbook.addWorksheet(sheetName);

        // Header info
        scoreSheet.mergeCells('A1:E1');
        scoreSheet.getCell('A1').value = `Kategori: ${kategori.nama}`;
        scoreSheet.getCell('A1').font = { size: 12, bold: true };

        if (kategori.deskripsi) {
          scoreSheet.mergeCells('A2:E2');
          scoreSheet.getCell('A2').value = kategori.deskripsi;
        }

        scoreSheet.addRow([
          'Penilai:',
          kategori.penilai.map((p) => p.nama).join(', ') || '-',
        ]);

        if (kategori.pemenang) {
          const winnerRow = scoreSheet.addRow([
            '🏆 PEMENANG:',
            kategori.pemenang.namaProduk,
          ]);
          winnerRow.getCell(1).font = { bold: true };
          winnerRow.getCell(2).font = { bold: true };
          winnerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFffd700' },
          };
        }

        scoreSheet.addRow([]);

        // Kriteria
        const kriteriaRow = scoreSheet.addRow([
          'Kriteria:',
          ...kategori.kriteria.map((k) => `${k.nama} (${k.bobot}%)`),
        ]);
        kriteriaRow.font = { bold: true };

        scoreSheet.addRow([]);

        // Get scores for this category
        const businesses = event.usaha.filter(
          (u) => u.status === 'DISETUJUI' && u.tipeUsaha === 'MAHASISWA'
        );
        const businessScores = [];

        for (const business of businesses) {
          const scores = await prisma.nilaiPenilaian.findMany({
            where: { usahaId: business.id, kategoriId: kategori.id },
          });

          let totalScore = 0;
          const scoreDetails = [];

          kategori.kriteria.forEach((kriteria) => {
            const score = scores.find((s) => s.kriteriaId === kriteria.id);
            const nilai = score?.nilai || 0;
            const weightedScore = (nilai * kriteria.bobot) / 100;
            totalScore += weightedScore;
            scoreDetails.push(nilai);
          });

          businessScores.push({
            business,
            totalScore,
            scoreDetails,
          });
        }

        businessScores.sort((a, b) => b.totalScore - a.totalScore);

        // Score table header
        const scoreHeader = scoreSheet.addRow([
          'Rank',
          'Nama Produk',
          'Pemilik',
          'Booth',
          ...kategori.kriteria.map((k) => k.nama),
          'Total Nilai',
        ]);
        scoreHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        scoreHeader.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF174c4e' },
        };

        // Score data
        businessScores.forEach((item, index) => {
          scoreSheet.addRow([
            index + 1,
            item.business.namaProduk,
            item.business.pemilik.nama,
            item.business.nomorBooth || '-',
            ...item.scoreDetails,
            item.totalScore.toFixed(2),
          ]);
        });

        scoreSheet.columns = [
          { width: 6 },
          { width: 25 },
          { width: 20 },
          { width: 8 },
          ...kategori.kriteria.map(() => ({ width: 12 })),
          { width: 12 },
        ];
      }

      // ========== SHEET: DAFTAR PEMENANG ==========
      const winners = event.kategoriPenilaian.filter((k) => k.pemenang);
      if (winners.length > 0) {
        const winnerSheet = workbook.addWorksheet('Daftar Pemenang');
        const winnerHeader = winnerSheet.addRow([
          'No',
          'Kategori',
          'Pemenang',
          'Booth',
        ]);
        winnerHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        winnerHeader.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFffd700' },
        };

        winners.forEach((k, index) => {
          winnerSheet.addRow([
            index + 1,
            k.nama,
            k.pemenang.namaProduk,
            k.pemenang.nomorBooth || '-',
          ]);
        });

        winnerSheet.columns = [
          { width: 5 },
          { width: 30 },
          { width: 30 },
          { width: 10 },
        ];
      }

      // ========== SHEET: SPONSOR ==========
      if (event.sponsor && event.sponsor.length > 0) {
        const sponsorSheet = workbook.addWorksheet('Sponsor');
        const sponsorHeader = sponsorSheet.addRow(['No', 'Nama Sponsor']);
        sponsorHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sponsorHeader.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF174c4e' },
        };

        event.sponsor.forEach((s, index) => {
          sponsorSheet.addRow([index + 1, s.nama]);
        });

        sponsorSheet.columns = [{ width: 5 }, { width: 40 }];
      }

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportEventToPDF(eventId) {
    try {
      // Fetch comprehensive event data
      const event = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
        include: {
          usaha: {
            include: {
              pemilik: { select: { nama: true, email: true } },
              pembimbing: { select: { nama: true } },
              fakultas: { select: { nama: true } },
              prodi: { select: { nama: true } },
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              kriteria: true,
              pemenang: { select: { namaProduk: true, nomorBooth: true } },
              penilai: { select: { nama: true } },
            },
          },
          sponsor: true,
        },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Calculate statistics
      const approvedCount = event.usaha.filter(
        (u) => u.status === 'DISETUJUI'
      ).length;
      const pendingCount = event.usaha.filter(
        (u) => u.status === 'PENDING'
      ).length;
      const rejectedCount = event.usaha.filter(
        (u) => u.status === 'DITOLAK'
      ).length;
      const mahasiswaCount = event.usaha.filter(
        (u) => u.tipeUsaha === 'MAHASISWA'
      ).length;
      const umkmCount = event.usaha.filter(
        (u) => u.tipeUsaha === 'UMKM_LUAR'
      ).length;

      // Calculate faculty distribution
      const fakultasDistribution = {};
      event.usaha.forEach((u) => {
        const fakultas = u.fakultas?.nama || 'Umum/Eksternal';
        fakultasDistribution[fakultas] =
          (fakultasDistribution[fakultas] || 0) + 1;
      });

      // Get assessment scores for each category
      const assessmentResults = [];
      for (const kategori of event.kategoriPenilaian) {
        const businesses = event.usaha.filter(
          (u) => u.status === 'DISETUJUI' && u.tipeUsaha === 'MAHASISWA'
        );
        const businessScores = [];

        for (const business of businesses) {
          const scores = await prisma.nilaiPenilaian.findMany({
            where: { usahaId: business.id, kategoriId: kategori.id },
          });

          let totalScore = 0;
          const scoreDetails = [];

          kategori.kriteria.forEach((kriteria) => {
            const score = scores.find((s) => s.kriteriaId === kriteria.id);
            const nilai = score?.nilai || 0;
            const weightedScore = (nilai * kriteria.bobot) / 100;
            totalScore += weightedScore;
            scoreDetails.push({
              kriteriaId: kriteria.id,
              kriteriaNama: kriteria.nama,
              nilai,
              bobot: kriteria.bobot,
              weightedScore,
            });
          });

          businessScores.push({
            business,
            totalScore,
            scoreDetails,
          });
        }

        businessScores.sort((a, b) => b.totalScore - a.totalScore);
        assessmentResults.push({
          kategori,
          scores: businessScores,
        });
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          bufferPages: true,
        });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ========== COVER PAGE ==========
        // Letterhead
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('UPT PUSAT INOVASI DAN KEWIRAUSAHAAN', 50, 50, {
          align: 'center',
          width: doc.page.width - 100,
        });
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        doc.text('Universitas Katolik De La Salle Manado', 50, 65, {
          align: 'center',
          width: doc.page.width - 100,
        });
        doc.text('Jl. Kairagi I, Kombos Timur, Manado 95253', 50, 78, {
          align: 'center',
          width: doc.page.width - 100,
        });

        // Divider line
        doc.strokeColor('#174c4e').lineWidth(2);
        doc
          .moveTo(50, 95)
          .lineTo(doc.page.width - 50, 95)
          .stroke();
        doc.strokeColor('#fba635').lineWidth(1);
        doc
          .moveTo(50, 98)
          .lineTo(doc.page.width - 50, 98)
          .stroke();

        // Title
        doc.y = 140;
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('LAPORAN PELAKSANAAN', 50, doc.y, {
          align: 'center',
          width: doc.page.width - 100,
        });
        doc.text('EVENT MARKETPLACE', 50, doc.y + 5, {
          align: 'center',
          width: doc.page.width - 100,
        });

        doc.y += 50;

        // Event Name Box
        doc
          .fillColor('#174c4e')
          .rect(60, doc.y, doc.page.width - 120, 50)
          .fill();
        doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold');
        doc.text(event.nama.toUpperCase(), 70, doc.y + 15, {
          align: 'center',
          width: doc.page.width - 140,
        });

        doc.y += 80;

        // Event Info Summary
        doc.fillColor('#333333').fontSize(11).font('Helvetica');
        const infoY = doc.y;
        doc.text('Semester', 120, infoY);
        doc.text(`: ${event.semester}`, 220, infoY);
        doc.text('Tahun Ajaran', 120, infoY + 18);
        doc.text(`: ${event.tahunAjaran}`, 220, infoY + 18);
        doc.text('Hari/Tanggal', 120, infoY + 36);
        doc.text(
          `: ${new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
          220,
          infoY + 36
        );
        doc.text('Lokasi', 120, infoY + 54);
        doc.text(`: ${event.lokasi}`, 220, infoY + 54);
        doc.text('Status Event', 120, infoY + 72);
        doc.text(`: ${event.status}`, 220, infoY + 72);

        // Footer of cover
        doc.y = doc.page.height - 120;
        doc.fontSize(10).fillColor('#666666');
        doc.text(
          `Dokumen ini dicetak secara otomatis pada ${new Date().toLocaleString('id-ID')}`,
          50,
          doc.y,
          { align: 'center', width: doc.page.width - 100 }
        );

        // ========== PAGE 2: RINGKASAN EKSEKUTIF ==========
        doc.addPage();

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('I. RINGKASAN EKSEKUTIF', 50, 50);
        doc.moveDown();

        // Summary Statistics
        doc.y = 80;
        this.addSummaryBox(doc, [
          { label: 'Total Peserta', value: event.usaha.length },
          { label: 'Peserta Disetujui', value: approvedCount },
          { label: 'Menunggu Verifikasi', value: pendingCount },
          {
            label: 'Kategori Penilaian',
            value: event.kategoriPenilaian.length,
          },
        ]);

        doc.moveDown();

        // Participant Type Statistics
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('Komposisi Peserta:', 50);
        doc.moveDown(0.5);

        const compHeaders = ['Jenis Peserta', 'Jumlah', 'Persentase'];
        const compRows = [
          [
            'Mahasiswa',
            mahasiswaCount,
            `${((mahasiswaCount / (event.usaha.length || 1)) * 100).toFixed(1)}%`,
          ],
          [
            'UMKM Luar',
            umkmCount,
            `${((umkmCount / (event.usaha.length || 1)) * 100).toFixed(1)}%`,
          ],
        ];
        this.drawTable(doc, compHeaders, compRows, {
          columnWidths: [200, 100, 100],
        });

        doc.moveDown(2);

        // Faculty Distribution
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('Distribusi Peserta per Fakultas:', 50);
        doc.moveDown(0.5);

        const fakultasHeaders = ['Fakultas', 'Jumlah Peserta', 'Persentase'];
        const fakultasRows = Object.entries(fakultasDistribution)
          .sort((a, b) => b[1] - a[1])
          .map(([fakultas, count]) => [
            fakultas,
            count,
            `${((count / (event.usaha.length || 1)) * 100).toFixed(1)}%`,
          ]);

        this.drawTable(doc, fakultasHeaders, fakultasRows, {
          columnWidths: [250, 100, 100],
        });

        // ========== PAGE 3+: DAFTAR PESERTA ==========
        doc.addPage();

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('II. DAFTAR PESERTA', 50, 50);
        doc.moveDown();

        const pesertaHeaders = [
          'No',
          'Booth',
          'Nama Produk',
          'Pemilik',
          'Fakultas',
          'Status',
        ];
        const pesertaRows = event.usaha.map((u, i) => [
          i + 1,
          u.nomorBooth || '-',
          u.namaProduk,
          u.pemilik.nama,
          u.fakultas?.nama || 'Eksternal',
          u.status,
        ]);

        doc.y = 80;
        this.drawTable(doc, pesertaHeaders, pesertaRows, {
          columnWidths: [30, 40, 150, 110, 90, 70],
        });

        // ========== PAGE 4+: DETAIL PENILAIAN ==========
        if (assessmentResults.length > 0) {
          doc.addPage();

          doc.fontSize(14).font('Helvetica-Bold').fillColor('#174c4e');
          doc.text('III. HASIL PENILAIAN', 50, 50);

          let pageY = 80;

          for (const result of assessmentResults) {
            const { kategori, scores } = result;

            // Check if we need a new page
            if (pageY > doc.page.height - 200) {
              doc.addPage();
              pageY = 50;
            }

            doc.y = pageY;

            // Category Header
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#174c4e');
            doc.text(`Kategori: ${kategori.nama}`, 50, doc.y);

            if (kategori.deskripsi) {
              doc.fontSize(9).font('Helvetica').fillColor('#666666');
              doc.text(kategori.deskripsi, 50, doc.y + 5);
            }

            doc.moveDown(0.5);

            // Winner highlight
            if (kategori.pemenang) {
              doc.y += 5;
              doc
                .fillColor('#ffd700')
                .rect(50, doc.y, doc.page.width - 100, 25)
                .fill();
              doc
                .strokeColor('#e0b000')
                .rect(50, doc.y, doc.page.width - 100, 25)
                .stroke();
              doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold');
              doc.text(
                `🏆 PEMENANG: ${kategori.pemenang.namaProduk} (Booth: ${kategori.pemenang.nomorBooth || '-'})`,
                60,
                doc.y + 7
              );
              doc.y += 35;
            }

            doc.moveDown(0.3);

            // Kriteria list
            doc.fontSize(9).font('Helvetica').fillColor('#333333');
            doc.text(
              `Kriteria: ${kategori.kriteria.map((k) => `${k.nama} (${k.bobot}%)`).join(', ')}`,
              50
            );
            doc.text(
              `Penilai: ${kategori.penilai.map((p) => p.nama).join(', ') || '-'}`,
              50
            );

            doc.moveDown(0.5);

            // Scores table
            if (scores.length > 0) {
              const scoreHeaders = ['Rank', 'Produk', 'Pemilik', 'Total Nilai'];
              const scoreRows = scores
                .slice(0, 10)
                .map((item, i) => [
                  i + 1,
                  item.business.namaProduk,
                  item.business.pemilik.nama,
                  item.totalScore.toFixed(2),
                ]);

              this.drawTable(doc, scoreHeaders, scoreRows, {
                columnWidths: [40, 200, 150, 80],
                fontSize: 8,
              });
            } else {
              doc.fontSize(9).font('Helvetica').fillColor('#666666');
              doc.text('Belum ada peserta yang dinilai pada kategori ini.', 50);
            }

            pageY = doc.y + 30;
          }
        }

        // ========== DAFTAR PEMENANG FINAL ==========
        const winners = event.kategoriPenilaian.filter((k) => k.pemenang);
        if (winners.length > 0) {
          doc.addPage();

          doc.fontSize(14).font('Helvetica-Bold').fillColor('#174c4e');
          doc.text('IV. DAFTAR PEMENANG', 50, 50);
          doc.moveDown();

          doc.y = 80;

          const winnerHeaders = ['No', 'Kategori', 'Pemenang', 'Booth'];
          const winnerRows = winners.map((k, i) => [
            i + 1,
            k.nama,
            k.pemenang.namaProduk,
            k.pemenang.nomorBooth || '-',
          ]);

          this.drawTable(doc, winnerHeaders, winnerRows, {
            columnWidths: [40, 200, 180, 70],
          });
        }

        // ========== SPONSOR PAGE ==========
        if (event.sponsor && event.sponsor.length > 0) {
          doc.addPage();

          doc.fontSize(14).font('Helvetica-Bold').fillColor('#174c4e');
          doc.text('V. DAFTAR SPONSOR', 50, 50);
          doc.moveDown();

          doc.y = 80;

          const sponsorHeaders = ['No', 'Nama Sponsor'];
          const sponsorRows = event.sponsor.map((s, i) => [i + 1, s.nama]);

          this.drawTable(doc, sponsorHeaders, sponsorRows, {
            columnWidths: [40, 400],
          });
        }

        // ========== FOOTER ON ALL PAGES ==========
        // this.addPdfFooter(doc);

        doc.end();
      });
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportAssessmentToExcel(kategoriId) {
    try {
      const kategori = await prisma.kategoriPenilaian.findUnique({
        where: { id: kategoriId },
        include: {
          event: true,
          kriteria: true,
          pemenang: true,
          penilai: { select: { nama: true } },
        },
      });

      if (!kategori) {
        const error = new Error('Kategori penilaian tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const businesses = await prisma.usaha.findMany({
        where: {
          eventId: kategori.eventId,
          status: 'DISETUJUI',
          tipeUsaha: 'MAHASISWA',
        },
        include: {
          pemilik: { select: { nama: true } },
          fakultas: { select: { nama: true } },
        },
        orderBy: { nomorBooth: 'asc' },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Hasil Penilaian');

      // Title
      const titleColSpan = 5 + kategori.kriteria.length;
      worksheet.mergeCells(1, 1, 1, titleColSpan);
      worksheet.getCell('A1').value = `HASIL PENILAIAN: ${kategori.nama}`;
      worksheet.getCell('A1').font = { size: 14, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };

      worksheet.addRow([]);
      worksheet.addRow(['Event', kategori.event.nama]);
      worksheet.addRow(['Kategori', kategori.nama]);
      worksheet.addRow(['Deskripsi', kategori.deskripsi || '-']);
      worksheet.addRow([
        'Penilai',
        kategori.penilai.map((p) => p.nama).join(', ') || '-',
      ]);
      worksheet.addRow([
        'Pemenang',
        kategori.pemenang?.namaProduk || 'Belum ditentukan',
      ]);
      worksheet.addRow([]);

      // Headers
      const headers = [
        'Rank',
        'Nama Produk',
        'Pemilik',
        'Fakultas',
        'Booth',
        ...kategori.kriteria.map((k) => `${k.nama} (${k.bobot}%)`),
        'Total Nilai',
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
      };

      // Calculate scores
      const businessScores = [];
      for (const business of businesses) {
        const scores = await prisma.nilaiPenilaian.findMany({
          where: {
            usahaId: business.id,
            kategoriId: kategori.id,
          },
        });

        let totalScore = 0;
        const kriteriaScores = kategori.kriteria.map((kriteria) => {
          const score = scores.find((s) => s.kriteriaId === kriteria.id);
          const nilai = score?.nilai || 0;
          totalScore += (nilai * kriteria.bobot) / 100;
          return nilai;
        });

        businessScores.push({
          business,
          kriteriaScores,
          totalScore,
        });
      }

      // Sort by total score
      businessScores.sort((a, b) => b.totalScore - a.totalScore);

      // Add data rows
      businessScores.forEach((item, index) => {
        const row = [
          index + 1,
          item.business.namaProduk,
          item.business.pemilik.nama,
          item.business.fakultas?.nama || '-',
          item.business.nomorBooth || '-',
          ...item.kriteriaScores,
          item.totalScore.toFixed(2),
        ];

        const dataRow = worksheet.addRow(row);

        // Highlight winner
        if (index === 0) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD700' },
          };
        }
      });

      // Column widths
      worksheet.columns = [
        { width: 6 },
        { width: 25 },
        { width: 20 },
        { width: 20 },
        { width: 8 },
        ...kategori.kriteria.map(() => ({ width: 14 })),
        { width: 12 },
      ];

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportAssessmentToPDF(kategoriId) {
    try {
      const kategori = await prisma.kategoriPenilaian.findUnique({
        where: { id: kategoriId },
        include: {
          event: true,
          kriteria: true,
          pemenang: true,
          penilai: { select: { nama: true } },
        },
      });

      if (!kategori) {
        const error = new Error('Kategori penilaian tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const businesses = await prisma.usaha.findMany({
        where: {
          eventId: kategori.eventId,
          status: 'DISETUJUI',
          tipeUsaha: 'MAHASISWA',
        },
        include: {
          pemilik: { select: { nama: true } },
        },
        orderBy: { nomorBooth: 'asc' },
      });

      // Calculate scores
      const businessScores = [];
      for (const business of businesses) {
        const scores = await prisma.nilaiPenilaian.findMany({
          where: { usahaId: business.id, kategoriId: kategori.id },
        });

        let totalScore = 0;
        kategori.kriteria.forEach((kriteria) => {
          const score = scores.find((s) => s.kriteriaId === kriteria.id);
          totalScore += ((score?.nilai || 0) * kriteria.bobot) / 100;
        });

        businessScores.push({ business, totalScore });
      }

      businessScores.sort((a, b) => b.totalScore - a.totalScore);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          bufferPages: true,
        });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addPdfHeader(doc, 'HASIL PENILAIAN', kategori.nama);

        doc.y = 100;

        // Info Box
        doc.fontSize(10).font('Helvetica');
        const infoY = doc.y;

        doc
          .fillColor('#f8f9fa')
          .rect(50, infoY, doc.page.width - 100, 60)
          .fill();
        doc
          .strokeColor('#e0e0e0')
          .rect(50, infoY, doc.page.width - 100, 60)
          .stroke();

        doc.fillColor('#333333');
        doc.text(`Event: ${kategori.event.nama}`, 60, infoY + 10);
        doc.text(`Kategori: ${kategori.nama}`, 60, infoY + 25);
        doc.text(
          `Penilai: ${kategori.penilai.map((p) => p.nama).join(', ') || '-'}`,
          60,
          infoY + 40
        );

        doc.y = infoY + 80;

        // Winner highlight
        if (kategori.pemenang) {
          doc
            .fillColor('#ffd700')
            .rect(50, doc.y, doc.page.width - 100, 35)
            .fill();
          doc
            .strokeColor('#e0e0e0')
            .rect(50, doc.y, doc.page.width - 100, 35)
            .stroke();

          doc.fillColor('#333333').fontSize(12).font('Helvetica-Bold');
          doc.text(
            `🏆 PEMENANG: ${kategori.pemenang.namaProduk}`,
            60,
            doc.y + 10
          );
          doc.y += 50;
        }

        // Kriteria summary
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('Kriteria Penilaian:', 50);
        doc.moveDown(0.5);

        doc.fontSize(9).font('Helvetica').fillColor('#333333');
        kategori.kriteria.forEach((k, i) => {
          doc.text(`${i + 1}. ${k.nama} - Bobot: ${k.bobot}%`, 60);
        });

        doc.moveDown();

        // Results Table
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('Peringkat Peserta:', 50);
        doc.moveDown(0.5);

        const headers = [
          'Rank',
          'Nama Produk',
          'Pemilik',
          'Booth',
          'Total Nilai',
        ];
        const rows = businessScores.map((item, i) => [
          i + 1,
          item.business.namaProduk,
          item.business.pemilik.nama,
          item.business.nomorBooth || '-',
          item.totalScore.toFixed(2),
        ]);

        this.drawTable(doc, headers, rows, {
          columnWidths: [40, 180, 130, 60, 80],
        });

        // Footer
        // this.addPdfFooter(doc);

        doc.end();
      });
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
          _count: { select: { usaha: true } },
          usaha: { select: { status: true } },
        },
        orderBy: [{ tahunAjaran: 'desc' }, { semester: 'desc' }],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data Marketplace');

      // Title
      worksheet.mergeCells('A1:J1');
      worksheet.getCell('A1').value = 'DATA EVENT MARKETPLACE UPT-PIK';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getRow(1).height = 30;

      // Export date
      worksheet.mergeCells('A2:J2');
      worksheet.getCell('A2').value =
        `Diekspor pada: ${new Date().toLocaleString('id-ID')}`;
      worksheet.getCell('A2').font = { size: 10, italic: true };
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      // Headers
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
        'Disetujui',
        'Status',
      ]);

      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Data
      events.forEach((event, index) => {
        const approvedCount = event.usaha.filter(
          (u) => u.status === 'DISETUJUI'
        ).length;
        worksheet.addRow([
          index + 1,
          event.nama,
          event.semester,
          event.tahunAjaran,
          new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID'),
          event.lokasi,
          event.kuotaPeserta,
          event._count.usaha,
          approvedCount,
          event.status,
        ]);
      });

      // Column widths
      worksheet.columns = [
        { width: 5 },
        { width: 30 },
        { width: 12 },
        { width: 12 },
        { width: 18 },
        { width: 20 },
        { width: 8 },
        { width: 12 },
        { width: 10 },
        { width: 15 },
      ];

      // Borders
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

      // Summary sheet
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

      const statusCount = events.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {});

      summarySheet.addRow([]);
      summarySheet.addRow(['Status', 'Jumlah']).font = { bold: true };
      Object.entries(statusCount).forEach(([s, count]) => {
        summarySheet.addRow([s, count]);
      });

      summarySheet.columns = [{ width: 25 }, { width: 15 }];

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportMarketplaceToPDF(filters = {}) {
    try {
      const { status, semester, tahunAjaran } = filters;

      const where = {};
      if (status) where.status = status;
      if (semester) where.semester = semester;
      if (tahunAjaran) where.tahunAjaran = tahunAjaran;

      const events = await prisma.eventMarketplace.findMany({
        where,
        include: {
          _count: { select: { usaha: true } },
          usaha: { select: { status: true } },
        },
        orderBy: [{ tahunAjaran: 'desc' }, { semester: 'desc' }],
      });

      const totalPeserta = events.reduce((sum, e) => sum + e._count.usaha, 0);
      const statusCount = events.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {});

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          bufferPages: true,
        });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addPdfHeader(doc, 'DATA EVENT MARKETPLACE', 'UPT-PIK');

        doc.y = 100;

        // Summary
        this.addSummaryBox(doc, [
          { label: 'Total Event', value: events.length },
          { label: 'Total Peserta', value: totalPeserta },
          {
            label: 'Aktif',
            value:
              (statusCount['TERBUKA'] || 0) + (statusCount['BERLANGSUNG'] || 0),
          },
          { label: 'Selesai', value: statusCount['SELESAI'] || 0 },
        ]);

        doc.moveDown();

        // Table
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('Daftar Event', 50);
        doc.moveDown(0.5);

        const headers = ['No', 'Nama Event', 'Semester', 'Peserta', 'Status'];
        const rows = events.map((e, i) => [
          i + 1,
          e.nama,
          `${e.semester} ${e.tahunAjaran}`,
          e._count.usaha,
          e.status,
        ]);

        this.drawTable(doc, headers, rows, {
          columnWidths: [30, 200, 100, 60, 100],
        });

        // Footer
        // this.addPdfFooter(doc);

        doc.end();
      });
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
              pemilik: { select: { nama: true, email: true } },
              fakultas: { select: { nama: true } },
              prodi: { select: { nama: true } },
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              pemenang: { select: { namaProduk: true } },
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

      eventsHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      eventsHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
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
        { width: 15 },
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
        'Booth',
        'Nama Produk',
        'Kategori',
        'Tipe',
        'Pemilik',
        'Email',
        'Telepon',
        'Fakultas',
        'Prodi',
        'Status',
      ]);

      participantsHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      participantsHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF174c4e' },
      };

      let participantNo = 1;
      events.forEach((event) => {
        event.usaha.forEach((usaha) => {
          participantsSheet.addRow([
            participantNo++,
            event.nama,
            usaha.nomorBooth || '-',
            usaha.namaProduk,
            usaha.kategori,
            usaha.tipeUsaha === 'MAHASISWA' ? 'Mahasiswa' : 'UMKM',
            usaha.pemilik.nama,
            usaha.pemilik.email,
            usaha.telepon,
            usaha.fakultas?.nama || '-',
            usaha.prodi?.nama || '-',
            usaha.status,
          ]);
        });
      });

      participantsSheet.columns = [
        { width: 5 },
        { width: 20 },
        { width: 8 },
        { width: 20 },
        { width: 15 },
        { width: 12 },
        { width: 18 },
        { width: 22 },
        { width: 14 },
        { width: 15 },
        { width: 18 },
        { width: 12 },
      ];

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  async exportMarketplaceDetailedToPDF(filters = {}) {
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
              pemilik: { select: { nama: true } },
              fakultas: { select: { nama: true } },
            },
            orderBy: { nomorBooth: 'asc' },
          },
        },
        orderBy: [{ tahunAjaran: 'desc' }, { semester: 'desc' }],
      });

      const totalPeserta = events.reduce((sum, e) => sum + e.usaha.length, 0);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4',
          bufferPages: true,
        });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addPdfHeader(doc, 'LAPORAN DATA MARKETPLACE', 'Detail Lengkap');

        doc.y = 100;

        // Summary
        this.addSummaryBox(doc, [
          { label: 'Total Event', value: events.length },
          { label: 'Total Peserta', value: totalPeserta },
        ]);

        doc.moveDown();

        // Per-event details
        events.forEach((event, eventIndex) => {
          if (eventIndex > 0) {
            doc.addPage();
            doc.y = 50;
          }

          // Event header
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#174c4e');
          doc.text(`${eventIndex + 1}. ${event.nama}`, 50);

          doc.fontSize(10).font('Helvetica').fillColor('#666666');
          doc.text(
            `${event.semester} ${event.tahunAjaran} | ${event.lokasi} | Status: ${event.status}`,
            50
          );
          doc.moveDown();

          // Participants table
          const headers = ['No', 'Booth', 'Nama Produk', 'Pemilik', 'Status'];
          const rows = event.usaha.map((u, i) => [
            i + 1,
            u.nomorBooth || '-',
            u.namaProduk,
            u.pemilik.nama,
            u.status,
          ]);

          if (rows.length > 0) {
            this.drawTable(doc, headers, rows, {
              columnWidths: [30, 50, 180, 130, 100],
            });
          } else {
            doc.fontSize(10).fillColor('#999999');
            doc.text('Belum ada peserta', 50);
          }

          doc.moveDown(2);
        });

        // Footer
        // this.addPdfFooter(doc);

        doc.end();
      });
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }
}
