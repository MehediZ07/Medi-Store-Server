import { Request, Response, NextFunction } from 'express';
import { medicineService } from './medicine.service';

export const medicineController = {
  async getAllMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        categories: req.query.categories ? (req.query.categories as string).split(',') : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        status: req.query.status as string,
      };

      const paginationOptions = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await medicineService.getAllMedicines(filters, paginationOptions);

      res.json({
        success: true,
        message: 'Medicines retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMedicineById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const medicine = await medicineService.getMedicineById(id);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found',
        });
      }

      // Calculate average rating
      const averageRating = medicine.reviews.length > 0 
        ? medicine.reviews.reduce((sum, review) => sum + review.rating, 0) / medicine.reviews.length
        : 0;

      res.json({
        success: true,
        message: 'Medicine retrieved successfully',
        data: {
          ...medicine,
          averageRating,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};