import { UserService } from '../services/UserService.js';
import { ApiResponse } from '../utils/response.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  index = async (req, res, next) => {
    try {
      const result = await this.userService.list(req.query);
      return ApiResponse.paginate(
        res,
        result.items,
        result.page,
        result.limit,
        result.total,
        'Daftar user berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  show = async (req, res, next) => {
    try {
      const user = await this.userService.getById(req.params.id);
      return ApiResponse.success(res, { user }, 'Detail user berhasil diambil');
    } catch (error) {
      next(error);
    }
  };

  store = async (req, res, next) => {
    try {
      const user = await this.userService.create(req.body);
      return ApiResponse.success(res, { user }, 'User berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const user = await this.userService.update(req.params.id, req.body);
      return ApiResponse.success(res, { user }, 'User berhasil diupdate');
    } catch (error) {
      next(error);
    }
  };

  destroy = async (req, res, next) => {
    try {
      const result = await this.userService.remove(req.params.id);
      return ApiResponse.success(res, result, 'User berhasil dihapus');
    } catch (error) {
      next(error);
    }
  };
}