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

        return ApiResponse.error(
          res,
          'Validasi gagal',
          400,
          errors,
        );
      }
    };
  }
}