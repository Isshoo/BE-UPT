import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();
const userController = new UserController();

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize('ADMIN'));

router.get('/', userController.getUsers);

export default router;
