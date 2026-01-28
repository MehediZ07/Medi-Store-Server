import { prisma } from '../../lib/prisma';
import { calculatePagination, formatPaginationResponse, PaginationOptions } from '../../helpers/paginationSortingHelper';

export const adminService = {
  async getAllUsers(paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { 
              medicines: true, 
              orders: true, 
              reviews: true 
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return formatPaginationResponse(users, total, page, limit);
  },

  async updateUserStatus(userId: string, status: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
  },

  async getAllOrders(paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
          orderItems: {
            include: {
              medicine: {
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
      }),
      prisma.order.count(),
    ]);

    return formatPaginationResponse(orders, total, page, limit);
  },

  async getAllSellers(paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const [sellers, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'SELLER' },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { 
              medicines: true, 
              orders: true 
            },
          },
        },
      }),
      prisma.user.count({ where: { role: 'SELLER' } }),
    ]);

    return formatPaginationResponse(sellers, total, page, limit);
  },

  async getDashboardStats() {
    const [
      totalUsers,
      totalSellers,
      totalCustomers,
      totalMedicines,
      totalOrders,
      totalReviews,
      totalRevenue,
      recentOrders,
      topSellingMedicines,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.medicine.count(),
      prisma.order.count(),
      prisma.review.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }).then(result => result._sum.totalAmount || 0),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, email: true },
          },
          orderItems: {
            include: {
              medicine: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['medicineId'],
        _sum: { quantity: true },
        _count: { medicineId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }).then(async (items) => {
        const medicineIds = items.map(item => item.medicineId);
        const medicines = await prisma.medicine.findMany({
          where: { id: { in: medicineIds } },
          select: { id: true, name: true, price: true },
        });
        
        return items.map(item => {
          const medicine = medicines.find(m => m.id === item.medicineId);
          return {
            id: item.medicineId,
            name: medicine?.name || 'Unknown',
            totalSold: item._sum.quantity || 0,
            revenue: (item._sum.quantity || 0) * (medicine?.price || 0),
          };
        });
      }),
    ]);

    return {
      totalUsers,
      totalSellers,
      totalCustomers,
      totalMedicines,
      totalOrders,
      totalReviews,
      totalRevenue,
      recentOrders,
      topSellingMedicines,
    };
  },
};