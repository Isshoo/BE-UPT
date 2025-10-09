import { UserService } from '../services/UserService.js';
import { ApiResponse } from '../utils/response.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req, res, next) => {
    try {
      const users = await this.userService.getUsers(req.query);
      return ApiResponse.success(res, users, 'Data user berhasil diambil');
    } catch (error) {
      next(error);
    }
  };
}
