import { prisma } from '../../lib/prisma';
import { calculatePagination, formatPaginationResponse, PaginationOptions } from '../../helpers/paginationSortingHelper';

export const orderService = {
  async createOrder(data: {
    customerId: string;
    items: { medicineId: string; quantity: number }[];
  }) {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of data.items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        throw new Error(`Medicine with id ${item.medicineId} not found`);
      }

      if (medicine.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}`);
      }

      const itemTotal = medicine.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        price: medicine.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        totalAmount,
        orderItems: {
          create: orderItems,
        },
      },
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

    for (const item of data.items) {
      await prisma.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  },

  async getUserOrders(userId: string, paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orderItems: {
            include: {
              medicine: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: { customerId: userId } }),
    ]);

    return formatPaginationResponse(orders, total, page, limit);
  },

  async getOrderById(id: string, userId: string) {
    return await prisma.order.findFirst({
      where: {
        id,
        customerId: userId,
      },
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
};