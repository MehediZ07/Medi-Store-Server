import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUserStatus);

router.get('/dashboard', adminController.getDashboardStats);

router.get('/orders', adminController.getAllOrders);

router.get('/sellers', adminController.getAllSellers);

export const adminRouter = router;