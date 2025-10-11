import { UserService } from '../services/UserService.js';
import { ApiResponse } from '../utils/response.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req, res, next) => {
    try {
      const result = await this.userService.getUsers(req.query);
      return ApiResponse.paginate(
        res,
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Data user berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req, res, next) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      return ApiResponse.success(res, user, 'Detail user berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req, res, next) => {
    try {
      const user = await this.userService.createUser(req.body);
      return ApiResponse.success(res, user, 'User berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      return ApiResponse.success(res, user, 'User berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const result = await this.userService.deleteUser(req.params.id);
      return ApiResponse.success(res, result, 'User berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { newPassword } = req.body;
      const result = await this.userService.resetPassword(
        req.params.id,
        newPassword
      );
      return ApiResponse.success(res, result, 'Password berhasil direset');
    } catch (error) {
      next(error);
    }
  };

  getStatistics = async (req, res, next) => {
    try {
      const stats = await this.userService.getStatistics();
      return ApiResponse.success(res, stats, 'Statistik user berhasil diambil');
    } catch (error) {
      next(error);
    }
  };
}
