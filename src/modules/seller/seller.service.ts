import { prisma } from '../../lib/prisma';
import { calculatePagination, formatPaginationResponse, PaginationOptions } from '../../helpers/paginationSortingHelper';

export const sellerService = {
  async addMedicine(sellerId: string, data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    image?: string;
    categoryId: string;
  }) {
    return await prisma.medicine.create({
      data: {
        ...data,
        sellerId,
      },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async updateMedicine(id: string, sellerId: string, data: any) {
    return await prisma.medicine.update({
      where: {
        id,
        sellerId,
      },
      data,
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async deleteMedicine(id: string, sellerId: string) {
    return await prisma.medicine.delete({
      where: {
        id,
        sellerId,
      },
    });
  },

  async getSellerMedicines(sellerId: string, paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where: { sellerId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          image: true,
          status: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { reviews: true, orderItems: true },
          },
        },
      }),
      prisma.medicine.count({ where: { sellerId } }),
    ]);

    const medicinesWithIsActive = medicines.map(medicine => ({
      ...medicine,
      isActive: medicine.status === 'ACTIVE',
    }));

    return formatPaginationResponse(medicinesWithIsActive, total, page, limit);
  },

  async getSellerOrders(sellerId: string, paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          orderItems: {
            some: {
              medicine: {
                sellerId,
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
          orderItems: {
            where: {
              medicine: {
                sellerId,
              },
            },
            include: {
              medicine: true,
            },
          },
        },
      }),
      prisma.order.count({
        where: {
          orderItems: {
            some: {
              medicine: {
                sellerId,
              },
            },
          },
        },
      }),
    ]);

    return formatPaginationResponse(orders, total, page, limit);
  },

  async updateOrderStatus(orderId: string, sellerId: string, status: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        orderItems: {
          some: {
            medicine: {
              sellerId,
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          include: {
            medicine: true,
          },
        },
      },
    });
  },

  async getSellerProfile(sellerId: string) {
    return await prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            medicines: true,
            orders: true,
          },
        },
      },
    });
  },

  async updateSellerProfile(sellerId: string, data: { name?: string; image?: string }) {
    return await prisma.user.update({
      where: { id: sellerId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  },

  async getSellerDashboard(sellerId: string) {
    const [
      totalMedicines,
      activeMedicines,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      topSellingMedicines,
    ] = await Promise.all([
      prisma.medicine.count({ where: { sellerId } }),
      prisma.medicine.count({ where: { sellerId, status: 'ACTIVE' } }),
      prisma.order.count({
        where: {
          orderItems: {
            some: {
              medicine: { sellerId },
            },
          },
        },
      }),
      prisma.order.count({
        where: {
          status: 'PLACED',
          orderItems: {
            some: {
              medicine: { sellerId },
            },
          },
        },
      }),
      prisma.orderItem.aggregate({
        where: {
          medicine: { sellerId },
        },
        _sum: {
          price: true,
        },
      }).then(result => result._sum.price || 0),
      prisma.order.findMany({
        where: {
          orderItems: {
            some: {
              medicine: { sellerId },
            },
          },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true, email: true },
          },
          orderItems: {
            where: {
              medicine: { sellerId },
            },
            include: {
              medicine: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.orderItem.groupBy({
        where: {
          medicine: { sellerId },
        },
        by: ['medicineId'],
        _sum: { quantity: true },
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
      totalMedicines,
      activeMedicines,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      topSellingMedicines,
    };
  },
};