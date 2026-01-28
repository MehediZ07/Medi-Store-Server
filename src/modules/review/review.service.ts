import { prisma } from '../../lib/prisma';

export const reviewService = {
  async createReview(data: {
    customerId: string;
    medicineId: string;
    rating: number;
    comment?: string;
  }) {
    return await prisma.review.create({
      data,
      include: {
        customer: {
          select: { id: true, name: true, image: true },
        },
        medicine: {
          select: { id: true, name: true },
        },
      },
    });
  },

  async getMedicineReviews(medicineId: string) {
    return await prisma.review.findMany({
      where: { medicineId },
      include: {
        customer: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateReview(id: string, customerId: string, data: { rating?: number; comment?: string }) {
    return await prisma.review.update({
      where: {
        id,
        customerId,
      },
      data,
      include: {
        customer: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  },

  async deleteReview(id: string, customerId: string) {
    return await prisma.review.delete({
      where: {
        id,
        customerId,
      },
    });
  },

  async getReviewById(id: string) {
    return await prisma.review.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, image: true },
        },
        medicine: {
          select: { id: true, name: true },
        },
      },
    });
  },
};