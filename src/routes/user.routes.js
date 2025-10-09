import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { AuthMiddleware, ValidationMiddleware } from '../middlewares/index.js';
import {
  UserListSchema,
  UserCreateSchema,
  UserUpdateSchema,
  UserParamIdSchema,
} from '../validators/user.validators.js';

const router = express.Router();
const controller = new UserController();

router.use(AuthMiddleware.authenticate, AuthMiddleware.authorize('ADMIN'));

router.get('/', ValidationMiddleware.validate(UserListSchema), controller.index);
router.get('/:id', ValidationMiddleware.validate(UserParamIdSchema), controller.show);
router.post('/', ValidationMiddleware.validate(UserCreateSchema), controller.store);
router.put('/:id', ValidationMiddleware.validate(UserUpdateSchema), controller.update);
router.delete('/:id', ValidationMiddleware.validate(UserParamIdSchema), controller.destroy);

export default router;