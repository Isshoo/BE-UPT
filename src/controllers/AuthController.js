import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../utils/response.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res, next) => {
    try {
      const result = await this.authService.register(req.body);
      return ApiResponse.success(
        res,
        result,
        'Registrasi berhasil',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.login(req.body);
      return ApiResponse.success(
        res,
        result,
        'Login berhasil'
      );
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req, res, next) => {
    try {
      const user = await this.authService.getCurrentUser(req.user.id);
      return ApiResponse.success(
        res,
        { user },
        'Data user berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      // Logout hanya menghapus token di client side
      return ApiResponse.success(
        res,
        null,
        'Logout berhasil'
      );
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const result = await this.authService.changePassword(
        req.user.id,
        req.body
      );
      return ApiResponse.success(
        res,
        result,
        'Password berhasil diubah'
      );
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const user = await this.authService.updateProfile(
        req.user.id,
        req.body
      );
      return ApiResponse.success(
        res,
        { user },
        'Profil berhasil diupdate'
      );
    } catch (error) {
      next(error);
    }
  };
}