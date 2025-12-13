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
              anggota: true,
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              kriteria: true,
              pemenang: { select: { namaProduk: true } },
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

      const infoData = [
        ['Semester', event.semester],
        ['Tahun Ajaran', event.tahunAjaran],
        [
          'Tanggal Pelaksanaan',
          new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID'),
        ],
        ['Lokasi', event.lokasi],
        ['Kuota Peserta', event.kuotaPeserta],
        ['Total Peserta', event.usaha.length],
        ['Status', event.status],
        [
          'Peserta Disetujui',
          event.usaha.filter((u) => u.status === 'DISETUJUI').length,
        ],
        [
          'Menunggu Persetujuan',
          event.usaha.filter((u) => u.status === 'PENDING').length,
        ],
      ];

      infoData.forEach(([label, value]) => {
        const row = infoSheet.addRow([label, value]);
        row.getCell(1).font = { bold: true };
      });

      infoSheet.columns = [{ width: 25 }, { width: 40 }];

      // Sheet 2: Daftar Peserta (Enhanced)
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
        'Jumlah Anggota',
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
          usaha.anggota?.length || 1,
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
        { width: 15 },
        { width: 20 },
        { width: 20 },
        { width: 12 },
        { width: 12 },
      ];

      // Sheet 3: Kategori Penilaian
      if (event.kategoriPenilaian.length > 0) {
        const penilaianSheet = workbook.addWorksheet('Kategori Penilaian');
        const penilaianHeader = penilaianSheet.addRow([
          'No',
          'Kategori',
          'Deskripsi',
          'Pemenang',
          'Jumlah Kriteria',
        ]);

        penilaianHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        penilaianHeader.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF174c4e' },
        };

        event.kategoriPenilaian.forEach((kategori, index) => {
          penilaianSheet.addRow([
            index + 1,
            kategori.nama,
            kategori.deskripsi || '-',
            kategori.pemenang?.namaProduk || 'Belum ditentukan',
            kategori.kriteria.length,
          ]);
        });

        penilaianSheet.columns = [
          { width: 5 },
          { width: 25 },
          { width: 35 },
          { width: 25 },
          { width: 15 },
        ];
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
      const event = await prisma.eventMarketplace.findUnique({
        where: { id: eventId },
        include: {
          usaha: {
            include: {
              pemilik: { select: { nama: true } },
              pembimbing: { select: { nama: true } },
              fakultas: { select: { nama: true } },
            },
            orderBy: { nomorBooth: 'asc' },
          },
          kategoriPenilaian: {
            include: {
              pemenang: { select: { namaProduk: true } },
            },
          },
        },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      const approvedCount = event.usaha.filter(
        (u) => u.status === 'DISETUJUI'
      ).length;
      const pendingCount = event.usaha.filter(
        (u) => u.status === 'PENDING'
      ).length;

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
        this.addPdfHeader(doc, 'LAPORAN EVENT MARKETPLACE', event.nama);

        doc.y = 100;

        // Event Details Box
        doc.fontSize(11).font('Helvetica');
        const detailsY = doc.y;

        doc
          .fillColor('#f8f9fa')
          .rect(50, detailsY, doc.page.width - 100, 80)
          .fill();
        doc
          .strokeColor('#e0e0e0')
          .rect(50, detailsY, doc.page.width - 100, 80)
          .stroke();

        doc.fillColor('#333333');
        doc.text(`Semester: ${event.semester}`, 60, detailsY + 10);
        doc.text(`Tahun Ajaran: ${event.tahunAjaran}`, 60, detailsY + 25);
        doc.text(
          `Tanggal: ${new Date(event.tanggalPelaksanaan).toLocaleDateString('id-ID')}`,
          60,
          detailsY + 40
        );
        doc.text(`Lokasi: ${event.lokasi}`, 60, detailsY + 55);

        doc.text(`Status: ${event.status}`, 300, detailsY + 10);
        doc.text(`Kuota: ${event.kuotaPeserta}`, 300, detailsY + 25);
        doc.text(`Total Peserta: ${event.usaha.length}`, 300, detailsY + 40);

        doc.y = detailsY + 100;

        // Summary boxes
        this.addSummaryBox(doc, [
          { label: 'Total Peserta', value: event.usaha.length },
          { label: 'Disetujui', value: approvedCount },
          { label: 'Menunggu', value: pendingCount },
          {
            label: 'Kategori Penilaian',
            value: event.kategoriPenilaian.length,
          },
        ]);

        doc.moveDown();

        // Participants Table
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#174c4e');
        doc.text('Daftar Peserta', 50);
        doc.moveDown(0.5);

        const headers = [
          'No',
          'Booth',
          'Nama Produk',
          'Pemilik',
          'Fakultas',
          'Status',
        ];
        const rows = event.usaha.map((u, i) => [
          i + 1,
          u.nomorBooth || '-',
          u.namaProduk,
          u.pemilik.nama,
          u.fakultas?.nama || '-',
          u.status,
        ]);

        this.drawTable(doc, headers, rows, {
          columnWidths: [30, 40, 150, 100, 100, 70],
        });

        // Winners section
        const winners = event.kategoriPenilaian.filter((k) => k.pemenang);
        if (winners.length > 0) {
          doc.addPage();
          doc.y = 50;

          doc.fontSize(12).font('Helvetica-Bold').fillColor('#174c4e');
          doc.text('Daftar Pemenang', 50);
          doc.moveDown(0.5);

          const winnerHeaders = ['No', 'Kategori', 'Pemenang'];
          const winnerRows = winners.map((k, i) => [
            i + 1,
            k.nama,
            k.pemenang.namaProduk,
          ]);

          this.drawTable(doc, winnerHeaders, winnerRows, {
            columnWidths: [40, 220, 230],
          });
        }

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
