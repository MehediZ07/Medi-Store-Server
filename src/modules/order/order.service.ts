import { prisma } from '../../lib/prisma';
import { calculatePagination, formatPaginationResponse, PaginationOptions } from '../../helpers/paginationSortingHelper';

export const orderService = {
  async createOrder(data: {
    customerId: string;
    items: { medicineId: string; quantity: number; price: number }[];
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      zipCode: string;
      phone: string;
    };
    totalAmount: number;
  }) {
    // Group items by seller
    const itemsBySeller: { [sellerId: string]: any[] } = {};
    
    for (const item of data.items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
        include: { seller: true }
      });

      if (!medicine) {
        throw new Error(`Medicine with id ${item.medicineId} not found`);
      }

      if (medicine.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}`);
      }

      const sellerId = medicine.sellerId;
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      
      itemsBySeller[sellerId].push({
        ...item,
        medicine,
        price: medicine.price
      });
    }

    // Create parent order
    const parentOrder = await prisma.order.create({
      data: {
        customerId: data.customerId,
        totalAmount: data.totalAmount,
        fullName: data.shippingAddress.fullName,
        address: data.shippingAddress.address,
        city: data.shippingAddress.city,
        zipCode: data.shippingAddress.zipCode,
        phone: data.shippingAddress.phone,
        status: 'PLACED'
      }
    });

    // Create seller orders
    const sellerOrders = [];
    
    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      const sellerTotal = items.reduce((sum, item) => 
        sum + (item.medicine.price * item.quantity), 0
      );
      
      const sellerOrder = await prisma.order.create({
        data: {
          customerId: data.customerId,
          sellerId: sellerId,
          parentOrderId: parentOrder.id,
          totalAmount: sellerTotal,
          fullName: data.shippingAddress.fullName,
          address: data.shippingAddress.address,
          city: data.shippingAddress.city,
          zipCode: data.shippingAddress.zipCode,
          phone: data.shippingAddress.phone,
          status: 'PLACED',
          orderItems: {
            create: items.map(item => ({
              medicineId: item.medicineId,
              quantity: item.quantity,
              price: item.medicine.price
            }))
          }
        },
        include: {
          orderItems: {
            include: { medicine: true }
          },
          seller: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      sellerOrders.push(sellerOrder);
    }

    // Update stock
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

    return { parentOrder, sellerOrders };
  },

  async getUserOrders(userId: string, paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { 
          customerId: userId,
          parentOrderId: null
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          fullName: true,
          address: true,
          city: true,
          zipCode: true,
          phone: true,
          childOrders: {
            include: {
              seller: {
                select: { id: true, name: true, email: true }
              },
              orderItems: {
                include: {
                  medicine: {
                    select: { id: true, name: true, image: true, price: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ 
        where: { 
          customerId: userId,
          parentOrderId: null 
        } 
      }),
    ]);

    return formatPaginationResponse(orders, total, page, limit);
  },

  async getOrderById(id: string, userId: string) {
    return await prisma.order.findFirst({
      where: {
        id,
        customerId: userId,
        parentOrderId: null
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        fullName: true,
        address: true,
        city: true,
        zipCode: true,
        phone: true,
        customer: {
          select: { id: true, name: true, email: true },
        },
        childOrders: {
          include: {
            seller: {
              select: { id: true, name: true, email: true }
            },
            orderItems: {
              include: {
                medicine: {
                  select: { id: true, name: true, image: true, price: true },
                },
              },
            },
          },
        },
      },
    });
  },

  async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: userId,
        parentOrderId: null,
        status: 'PLACED',
      },
      include: {
        childOrders: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found or cannot be cancelled');
    }

    // Cancel all child orders and restore stock
    for (const childOrder of order.childOrders) {
      await prisma.order.update({
        where: { id: childOrder.id },
        data: { status: 'CANCELLED' },
      });

      for (const item of childOrder.orderItems) {
        await prisma.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        childOrders: {
          include: {
            seller: {
              select: { name: true }
            },
            orderItems: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    });
  },

  async updateParentOrderStatus(parentOrderId: string) {
    const childOrders = await prisma.order.findMany({
      where: { parentOrderId },
      select: { status: true }
    });

    if (childOrders.length === 0) return;

    const statuses = childOrders.map(order => order.status);
    let parentStatus = 'PLACED';

    if (statuses.every(status => status === 'DELIVERED')) {
      parentStatus = 'DELIVERED';
    } else if (statuses.every(status => status === 'CANCELLED')) {
      parentStatus = 'CANCELLED';
    } else if (statuses.some(status => status === 'SHIPPED')) {
      parentStatus = 'PROCESSING';
    } else if (statuses.some(status => status === 'PROCESSING')) {
      parentStatus = 'PROCESSING';
    }

    await prisma.order.update({
      where: { id: parentOrderId },
      data: { status: parentStatus as any }
    });
  },
};