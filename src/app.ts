import express from 'express';
import cors from 'cors';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { notFound } from './middlewares/notFound';

import { medicineRouter } from './modules/medicine/medicine.router';
import { categoryRouter } from './modules/category/category.router';
import { orderRouter } from './modules/order/order.router';
import { reviewRouter } from './modules/review/review.router';
import { sellerRouter } from './modules/seller/seller.router';
import { adminRouter } from './modules/admin/admin.router';
import authRouter from './modules/auth/auth.router';

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

app.use('/api/auth', authRouter);

app.use('/api/medicines', medicineRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;