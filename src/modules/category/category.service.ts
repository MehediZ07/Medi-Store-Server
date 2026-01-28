import { prisma } from '../../lib/prisma';

export const categoryService = {
  async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { medicines: true },
        },
      },
    });
  },

  async getCategoryById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        medicines: {
          include: {
            seller: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  },

  async createCategory(data: { name: string; description?: string }) {
    return await prisma.category.create({
      data,
    });
  },

  async updateCategory(id: string, data: { name?: string; description?: string }) {
    return await prisma.category.update({
      where: { id },
      data,
    });
  },

  async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  },
};