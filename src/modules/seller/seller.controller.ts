import { Request, Response, NextFunction } from 'express';
import { sellerService } from './seller.service';
import { AuthenticatedRequest } from '../../middlewares/auth';

export const sellerController = {
  async addMedicine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const medicine = await sellerService.addMedicine(sellerId, req.body);

      res.status(201).json({
        success: true,
        message: 'Medicine added successfully',
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateMedicine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sellerId = req.user!.id;

      const medicine = await sellerService.updateMedicine(id as string, sellerId, req.body);

      res.json({
        success: true,
        message: 'Medicine updated successfully',
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteMedicine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sellerId = req.user!.id;

      await sellerService.deleteMedicine(id as string, sellerId);

      res.json({
        success: true,
        message: 'Medicine deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getSellerMedicines(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const paginationOptions = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await sellerService.getSellerMedicines(sellerId, paginationOptions);

      res.json({
        success: true,
        message: 'Medicines retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSellerOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const paginationOptions = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await sellerService.getSellerOrders(sellerId, paginationOptions);

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const sellerId = req.user!.id;

      const order = await sellerService.updateOrderStatus(id as string, sellerId, status);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSellerProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const profile = await sellerService.getSellerProfile(sellerId);

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSellerProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const profile = await sellerService.updateSellerProfile(sellerId, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSellerDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sellerId = req.user!.id;
      const dashboard = await sellerService.getSellerDashboard(sellerId);

      res.json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },
};