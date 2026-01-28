import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service';
import { AuthenticatedRequest } from '../../middlewares/auth';

export const reviewController = {
  async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const reviewData = {
        ...req.body,
        customerId,
      };

      const review = await reviewService.createReview(reviewData);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMedicineReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { medicineId } = req.params;
      const reviews = await reviewService.getMedicineReviews(medicineId as string);

      res.json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerId = req.user!.id;
      const updateData = req.body;

      const review = await reviewService.updateReview(id as string, customerId, updateData);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerId = req.user!.id;

      await reviewService.deleteReview(id as string, customerId);

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id as string);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      res.json({
        success: true,
        message: 'Review retrieved successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },
};