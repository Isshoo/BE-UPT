import { ApiResponse } from '../utils/response.js';

export class ValidationMiddleware {
  static validate(schema) {
    return async (req, res, next) => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        next();
      } catch (error) {
        const errors = error.errors?.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return ApiResponse.error(res, 'Validasi gagal', 400, errors);
      }
    };
  }
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // Minimal 6 karakter
    return password && password.length >= 6;
  }

  static validateRequired(fields, body) {
    const missing = [];

    fields.forEach((field) => {
      if (!body[field] || body[field].toString().trim() === '') {
        missing.push(field);
      }
    });

    return missing;
  }

  static validateRegister(req, res, next) {
    const { email, password, nama } = req.body;

    const missing = ValidationMiddleware.validateRequired(
      ['email', 'password', 'nama'],
      req.body
    );

    if (missing.length > 0) {
      return ApiResponse.error(
        res,
        `Field berikut harus diisi: ${missing.join(', ')}`,
        400
      );
    }

    if (!ValidationMiddleware.validateEmail(email)) {
      return ApiResponse.error(res, 'Format email tidak valid', 400);
    }

    if (!ValidationMiddleware.validatePassword(password)) {
      return ApiResponse.error(res, 'Password minimal 6 karakter', 400);
    }

    next();
  }

  static validateLogin(req, res, next) {
    const { email, password } = req.body;

    const missing = ValidationMiddleware.validateRequired(
      ['email', 'password'],
      req.body
    );

    if (missing.length > 0) {
      return ApiResponse.error(
        res,
        `Field berikut harus diisi: ${missing.join(', ')}`,
        400
      );
    }

    if (!ValidationMiddleware.validateEmail(email)) {
      return ApiResponse.error(res, 'Format email tidak valid', 400);
    }

    next();
  }

  static validateEventCreation(req, res, next) {
    const required = [
      'nama',
      'deskripsi',
      'semester',
      'tahunAjaran',
      'lokasi',
      'tanggalPelaksanaan',
      'mulaiPendaftaran',
      'akhirPendaftaran',
      'kuotaPeserta',
    ];

    const missing = ValidationMiddleware.validateRequired(required, req.body);

    if (missing.length > 0) {
      return ApiResponse.error(
        res,
        `Field berikut harus diisi: ${missing.join(', ')}`,
        400
      );
    }

    next();
  }
}
