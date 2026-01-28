import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/medicine/:medicineId', reviewController.getMedicineReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes
router.post('/', authenticate, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

export const reviewRouter = router;