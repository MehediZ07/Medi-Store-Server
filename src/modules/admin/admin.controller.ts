import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';

export const adminController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const paginationOptions = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await adminService.getAllUsers(paginationOptions);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await adminService.updateUserStatus(id as string, status);

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();

      res.json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const paginationOptions = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await adminService.getAllOrders(paginationOptions);

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllSellers(req: Request, res: Response, next: NextFunction) {
    try {
      const paginationOptions = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await adminService.getAllSellers(paginationOptions);

      res.json({
        success: true,
        message: 'Sellers retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};