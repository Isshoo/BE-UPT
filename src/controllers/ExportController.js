import { ExportService } from '../services/ExportService.js';
import { ApiResponse } from '../utils/response.js';

export class ExportController {
  constructor() {
    this.exportService = new ExportService();
  }

  exportUsers = async (req, res, next) => {
    try {
      const { format = 'excel' } = req.query;

      if (format === 'excel') {
        const buffer = await this.exportService.exportUsersToExcel();

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=data-pengguna-${Date.now()}.xlsx`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(res, 'Format tidak didukung', 400);
    } catch (error) {
      next(error);
    }
  };

  exportUmkm = async (req, res, next) => {
    try {
      const { format = 'excel' } = req.query;

      if (format === 'excel') {
        const buffer = await this.exportService.exportUmkmToExcel();

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=data-umkm-${Date.now()}.xlsx`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(res, 'Format tidak didukung', 400);
    } catch (error) {
      next(error);
    }
  };

  exportEvent = async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const { format = 'excel' } = req.query;

      if (format === 'excel') {
        const buffer = await this.exportService.exportEventToExcel(eventId);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=laporan-event-${eventId}-${Date.now()}.xlsx`
        );

        return res.send(buffer);
      }

      if (format === 'pdf') {
        const buffer = await this.exportService.exportEventToPDF(eventId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=laporan-event-${eventId}-${Date.now()}.pdf`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(res, 'Format tidak didukung', 400);
    } catch (error) {
      next(error);
    }
  };

  exportAssessment = async (req, res, next) => {
    try {
      const { kategoriId } = req.params;
      const { format = 'excel' } = req.query;

      if (format === 'excel') {
        const buffer =
          await this.exportService.exportAssessmentToExcel(kategoriId);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=hasil-penilaian-${kategoriId}-${Date.now()}.xlsx`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(res, 'Format tidak didukung', 400);
    } catch (error) {
      next(error);
    }
  };
  exportMarketplace = async (req, res, next) => {
    try {
      const { format = 'excel', status, semester, tahunAjaran } = req.query;

      if (format === 'excel') {
        const buffer = await this.exportService.exportAllMarketplaceToExcel({
          status,
          semester,
          tahunAjaran,
        });

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=data-marketplace-${Date.now()}.xlsx`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(res, 'Format tidak didukung', 400);
    } catch (error) {
      next(error);
    }
  };

  exportMarketplaceDetailed = async (req, res, next) => {
    try {
      const { status, semester, tahunAjaran } = req.query;

      const buffer = await this.exportService.exportMarketplaceDetailed({
        status,
        semester,
        tahunAjaran,
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=data-marketplace-detail-${Date.now()}.xlsx`
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}
