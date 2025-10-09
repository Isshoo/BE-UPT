import { ApiResponse } from '../utils/response.js';

export class ErrorHandler {
  static handle(err, req, res, next) {
    console.error('❌ Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
      return ApiResponse.error(
        res,
        'Data sudah ada dalam database',
        400,
        { field: err.meta?.target }
      );
    }

    if (err.code === 'P2025') {
      return ApiResponse.error(res, 'Data tidak ditemukan', 404);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
      return ApiResponse.error(res, 'Validasi gagal', 400, err.errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Token tidak valid', 401);
    }

    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token sudah kadaluarsa', 401);
    }

    // Custom error dengan statusCode
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    return ApiResponse.error(res, message, statusCode);
  }

  static notFound(req, res) {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
    return ApiResponse.error(res, `Route ${req.method} ${req.path} tidak ditemukan`, 404);
  }
}