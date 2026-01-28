import { Router } from 'express';
import { sellerController } from './seller.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('SELLER'));

router.post('/medicines', sellerController.addMedicine);
router.put('/medicines/:id', sellerController.updateMedicine);
router.delete('/medicines/:id', sellerController.deleteMedicine);
router.get('/medicines', sellerController.getSellerMedicines);

router.get('/orders', sellerController.getSellerOrders);
router.patch('/orders/:id/status', sellerController.updateOrderStatus);

router.get('/profile', sellerController.getSellerProfile);
router.put('/profile', sellerController.updateSellerProfile);
router.get('/dashboard', sellerController.getSellerDashboard);

export const sellerRouter = router;