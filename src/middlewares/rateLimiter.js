import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 2 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak request dari IP ini, coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (more strict)
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 2 minutes
  max: 20, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login, coba lagi setelah 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export limiter (strict untuk prevent abuse)
export const exportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 10 exports per hour
  message: {
    success: false,
    message: 'Terlalu banyak export, coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
