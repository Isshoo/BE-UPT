import { UserService } from '../services/UserService.js';
import { ApiResponse } from '../utils/response.js';
import { validateRequest } from '../utils/validators.js';
import {
  getUsersQuerySchema,
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  resetPasswordSchema,
} from '../schemas/user.schema.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getUsersGuest = async (req, res) => {
    try {
      // Validasi query params
      await validateRequest(req, {
        schema: getUsersQuerySchema,
      });

      // Extract validated query params
      const { role, page, limit, search } = req.query;

      // Panggil service
      const result = await this.userService.getUsersGuest({
        role,
        page,
        limit,
        search,
      });

      // Return success response
      return ApiResponse.paginate(
        res,
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data user berhasil diambil'
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

  getUsers = async (req, res) => {
    try {
      // Validasi query params
      await validateRequest(req, {
        schema: getUsersQuerySchema,
      });

      // Extract validated query params
      const { role, page, limit, search } = req.query;

      // Panggil service
      const result = await this.userService.getUsers({
        role,
        page,
        limit,
        search,
      });

      // Return success response
      return ApiResponse.paginate(
        res,
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data user berhasil diambil'
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

  getUserById = async (req, res) => {
    try {
      // Validasi params
      await validateRequest(req, {
        schema: getUserByIdSchema,
      });

      // Extract validated params
      const { id } = req.params;

      // Panggil service
      const user = await this.userService.getUserById(id);

      // Return success response
      return ApiResponse.success(res, { user }, 'Detail user berhasil diambil');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  createUser = async (req, res) => {
    try {
      // Validasi dengan Zod schema + Controller validation
      await validateRequest(req, {
        required: ['email', 'password', 'nama'],
        allowed: ['email', 'password', 'nama', 'role', 'fakultasId', 'prodiId'],
        schema: createUserSchema,
      });

      // Extract validated data (sudah divalidasi dan di-sanitize oleh Zod)
      const { email, password, nama, role, fakultasId, prodiId } = req.body;

      // Panggil service
      const user = await this.userService.createUser({
        email,
        password,
        nama,
        role,
        fakultasId,
        prodiId,
      });

      // Return success response
      return ApiResponse.success(res, { user }, 'User berhasil dibuat', 201);
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  updateUser = async (req, res) => {
    try {
      // Validasi dengan Zod schema + Controller validation
      await validateRequest(req, {
        required: [],
        allowed: ['nama', 'email', 'fakultasId', 'prodiId'],
        schema: updateUserSchema,
      });

      // Validasi business rule: Minimal 1 field harus diisi untuk update
      const { nama, email, fakultasId, prodiId } = req.body;
      const hasAnyField =
        nama !== undefined ||
        email !== undefined ||
        fakultasId !== undefined ||
        prodiId !== undefined;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          'Minimal satu field harus diisi untuk update user',
          400,
          [
            {
              field: 'body',
              message:
                'Minimal satu field (nama, email, fakultas, atau prodi) harus diisi',
            },
          ]
        );
      }

      // Extract validated params
      const { id } = req.params;

      // Panggil service
      const user = await this.userService.updateUser(id, {
        nama,
        email,
        fakultasId,
        prodiId,
      });

      // Return success response
      return ApiResponse.success(res, { user }, 'User berhasil diupdate');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  deleteUser = async (req, res) => {
    try {
      // Validasi params
      await validateRequest(req, {
        schema: getUserByIdSchema,
      });

      // Extract validated params
      const { id } = req.params;

      // Panggil service
      const result = await this.userService.deleteUser(id);

      // Return success response
      return ApiResponse.success(res, result, 'User berhasil dihapus');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  resetPassword = async (req, res) => {
    try {
      // Validasi dengan Zod schema + Controller validation
      await validateRequest(req, {
        required: ['newPassword'],
        allowed: ['newPassword'],
        schema: resetPasswordSchema,
      });

      // Extract validated data
      const { id } = req.params;
      const { newPassword } = req.body;

      // Panggil service
      const result = await this.userService.resetPassword(id, newPassword);

      // Return success response
      return ApiResponse.success(res, result, 'Password berhasil direset');
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Terjadi kesalahan',
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getStatistics = async (req, res) => {
    try {
      // Panggil service
      const stats = await this.userService.getStatistics();

      // Return success response
      return ApiResponse.success(res, stats, 'Statistik user berhasil diambil');
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
