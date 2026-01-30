import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { AuthenticatedRequest } from '../../middlewares/auth';

export const orderController = {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.id;
      const orderData = {
        ...req.body,
        customerId,
      };

      const result = await orderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        message: `Order created successfully and split into ${result.sellerOrders.length} seller orders`,
        data: result.parentOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const paginationOptions = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await orderService.getUserOrders(userId, paginationOptions);

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const order = await orderService.getOrderById(String(id), userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const order = await orderService.cancelOrder(String(id), userId);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },
};