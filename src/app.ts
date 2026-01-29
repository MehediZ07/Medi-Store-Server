import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { notFound } from './middlewares/notFound';

import { medicineRouter } from './modules/medicine/medicine.router';
import { categoryRouter } from './modules/category/category.router';
import { orderRouter } from './modules/order/order.router';
import { reviewRouter } from './modules/review/review.router';
import { sellerRouter } from './modules/seller/seller.router';
import { adminRouter } from './modules/admin/admin.router';
import { authenticate } from './middlewares/auth';

const app = express();

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:4000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediStore API is running!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

app.all('/api/auth/*', toNodeHandler(auth));

app.use('/api/medicines', medicineRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;