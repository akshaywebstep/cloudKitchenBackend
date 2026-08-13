import debugHelper from '../../../core/helpers/debug';
import { OrderStatus } from '../../../../prisma/generated/prisma/client';
import orderRepo from './order.repository';

// =====================================================
// 📄 GET ALL ORDERS (Admin — All branches/kitchens)
// =====================================================
export const getOrders = async (params: {
    page: number;
    limit: number;
    filters: {
        kitchenId?: number;
        branchId?: number;
        status?: OrderStatus;
    };
}) => {
    try {
        const { page, limit, filters } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        // ✅ Optional filters — If admin wants specific kitchen/branch 
        if (filters.kitchenId) where.userId = BigInt(filters.kitchenId);
        if (filters.branchId) where.branchId = BigInt(filters.branchId);
        if (filters.status) where.status = filters.status;

        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            orderRepo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, kitchenName: true, firstName: true, lastName: true, email: true, phone: true }
                    },
                    branch: {
                        select: { id: true, name: true, area: true, pincode: true, contactPhone: true }
                    },
                    items: {
                        include: {
                            menuItem: { select: { id: true, name: true, price: true } }
                        }
                    }
                }
            }),
            orderRepo.count({ where }),
            orderRepo.count({ where: {} }) 
        ]);

        const data = dataRes.data || [];
        const filtered = filteredCountRes.data || 0;
        const total = totalCountRes.data || 0;
        const totalPages = Math.ceil(filtered / limit);

        return {
            status: true,
            data,
            meta: {
                page, limit, total, filtered,
                count: data.length,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error: any) {
        debugHelper.debugError(`[Admin Order Service] getOrders failed: ${error.message}`);
        return { status: false, message: error.message || 'Failed to fetch orders', data: [], meta: null };
    }
};

// =====================================================
// 🔍 GET SINGLE ORDER (Admin — )
// =====================================================
export const getOrderById = async (id: number) => {
    try {
        const result = await orderRepo.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, kitchenName: true, firstName: true, lastName: true, email: true, phone: true }
                },
                branch: {
                    select: { id: true, name: true, addressLine1: true, addressLine2: true, area: true, pincode: true, contactPhone: true }
                },
                items: {
                    include: {
                        menuItem: { select: { id: true, name: true, price: true } }
                    }
                }
            }
        });

        if (!result.status) return { status: false, message: result.message };

        return { status: true, data: result.data, message: 'Order fetched successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to fetch order' };
    }
};