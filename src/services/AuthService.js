import { prisma } from '../config/index.js';
import { hashPassword, comparePassword } from '../utils/index.js';
import { generateToken } from '../config/jwt.js';

export class AuthService {
  async register(data) {
    const { email, password, nama } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id });

    return { user, token };
  }

  async login(data) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Email atau password salah');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken({ userId: user.id });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        fakultas: true,
        prodi: true,
        createdAt: true,
      },
    });

    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async changePassword(userId, data) {
    const { oldPassword, newPassword } = data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error('User tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password);

    if (!isPasswordValid) {
      const error = new Error('Password lama tidak sesuai');
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }

  async updateProfile(userId, data) {
    const { nama, fakultas, prodi } = data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        fakultas,
        prodi,
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        fakultas: true,
        prodi: true,
      },
    });

    return user;
  }
}