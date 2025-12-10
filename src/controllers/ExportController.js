import { ExportService } from '../services/ExportService.js';
import { ApiResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validators.js';
import {
  exportUsersQuerySchema,
  exportEventSchema,
  exportAssessmentSchema,
  exportMarketplaceQuerySchema,
  exportMarketplaceDetailedQuerySchema,
} from '../schemas/export.schema.js';

export class ExportController {
  constructor() {
    this.exportService = new ExportService();
  }

  exportUsers = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: exportUsersQuerySchema,
      });

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

      if (format === 'pdf') {
        const buffer = await this.exportService.exportUsersToPDF();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=data-pengguna-${Date.now()}.pdf`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(
        res,
        'Format tidak didukung. Format yang tersedia: excel, pdf.',
        400,
        [{ field: 'format', message: 'Format harus "excel" atau "pdf"' }]
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  exportEvent = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: exportEventSchema,
      });

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

      return ApiResponse.error(
        res,
        'Format tidak didukung. Format yang tersedia: excel, pdf.',
        400,
        [{ field: 'format', message: 'Format harus "excel" atau "pdf"' }]
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  exportAssessment = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: exportAssessmentSchema,
      });

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

      if (format === 'pdf') {
        const buffer =
          await this.exportService.exportAssessmentToPDF(kategoriId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=hasil-penilaian-${kategoriId}-${Date.now()}.pdf`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(
        res,
        'Format tidak didukung. Format yang tersedia: excel, pdf.',
        400,
        [{ field: 'format', message: 'Format harus "excel" atau "pdf"' }]
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  exportMarketplace = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: exportMarketplaceQuerySchema,
      });

      const { format = 'excel', status, semester, tahunAjaran } = req.query;
      const filters = { status, semester, tahunAjaran };

      if (format === 'excel') {
        const buffer =
          await this.exportService.exportAllMarketplaceToExcel(filters);

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

      if (format === 'pdf') {
        const buffer = await this.exportService.exportMarketplaceToPDF(filters);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=data-marketplace-${Date.now()}.pdf`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(
        res,
        'Format tidak didukung. Format yang tersedia: excel, pdf.',
        400,
        [{ field: 'format', message: 'Format harus "excel" atau "pdf"' }]
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  exportMarketplaceDetailed = async (req, res) => {
    try {
      await validateRequest(req, {
        schema: exportMarketplaceDetailedQuerySchema,
      });

      const { format = 'excel', status, semester, tahunAjaran } = req.query;
      const filters = { status, semester, tahunAjaran };

      if (format === 'excel') {
        const buffer =
          await this.exportService.exportMarketplaceDetailed(filters);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=data-marketplace-detail-${Date.now()}.xlsx`
        );

        return res.send(buffer);
      }

      if (format === 'pdf') {
        const buffer =
          await this.exportService.exportMarketplaceDetailedToPDF(filters);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=data-marketplace-detail-${Date.now()}.pdf`
        );

        return res.send(buffer);
      }

      return ApiResponse.error(
        res,
        'Format tidak didukung. Format yang tersedia: excel, pdf.',
        400,
        [{ field: 'format', message: 'Format harus "excel" atau "pdf"' }]
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };
}
