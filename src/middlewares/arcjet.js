import { aj } from '../config/index.js';
import { ApiResponse } from '../utils/response.js';

// Arcjet middleware for rate limiting, bot detection, and security
export const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1, // number of requests made
    });

    // Check if the request is denied
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return ApiResponse.error(
          res,
          'Terlalu banyak permintaan. Silakan coba lagi nanti.',
          429
        );
      } else if (decision.reason.isBot()) {
        return ApiResponse.error(
          res,
          'Akses ditolak oleh kebijakan keamanan.',
          403
        );
      } else {
        return ApiResponse.error(
          res,
          'Akses ditolak oleh kebijakan keamanan.',
          403
        );
      }
    }

    // spoofed bots
    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed()
      )
    ) {
      return ApiResponse.error(
        res,
        'Aktivitas mencurigakan terdeteksi. Akses ditolak oleh kebijakan keamanan.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('Arcjet Middleware Error:', error);
    next();
  }
};
