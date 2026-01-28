import { prisma } from '../../lib/prisma';
import { calculatePagination, formatPaginationResponse, PaginationOptions } from '../../helpers/paginationSortingHelper';

interface MedicineFilters {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export const medicineService = {
  async getAllMedicines(filters: MedicineFilters, paginationOptions: PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);
    
    const where: any = {
      status: 'ACTIVE',
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categories?.length) {
      where.categoryId = { in: filters.categories };
    }

    if (filters.minPrice !== undefined) {
      where.price = { ...where.price, gte: filters.minPrice };
    }

    if (filters.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filters.maxPrice };
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          seller: {
            select: { id: true, name: true, email: true },
          },
          category: true,
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.medicine.count({ where }),
    ]);

    const medicinesWithRating = medicines.map(medicine => ({
      ...medicine,
      averageRating: medicine.reviews.length > 0 
        ? medicine.reviews.reduce((sum, review) => sum + review.rating, 0) / medicine.reviews.length
        : 0,
      reviews: undefined,
    }));

    return formatPaginationResponse(medicinesWithRating, total, page, limit);
  },

  async getMedicineById(id: string) {
    return await prisma.medicine.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, email: true },
        },
        category: true,
        reviews: {
          include: {
            customer: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });
  },
};