import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { AuthMiddleware } from '../middlewares/index.js';

const router = express.Router();
const userController = new UserController();

router.get('/guest', userController.getUsersGuest);

router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize('ADMIN'));

router.get('/', userController.getUsers);
router.get('/statistics', userController.getStatistics);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/reset-password', userController.resetPassword);

export default router;
