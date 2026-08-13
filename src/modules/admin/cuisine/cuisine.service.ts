import DebugHelper from '../../../core/helpers/debug';
import { Status } from '../../../../prisma/generated/prisma/client';
import stringHelper from '../../../core/helpers/string.helper';
import cuisineRepo from './cuisine.repository';

// =====================================================
// ✅ CREATE CUISINE
// =====================================================
export const createCuisine = async (data: {
    name: string;
    image?: string;
    status?: Status;
}) => {
    try {
        const existing = await cuisineRepo.findFirst({
            where: { name: stringHelper.toTitleCase(data.name.trim().toLowerCase()) }
        });

        if (existing.status) {
            return { status: false, message: 'Cuisine with this name already exists' };
        }

        const result = await cuisineRepo.create({
            name: stringHelper.toTitleCase(data.name.trim().toLowerCase()),
            image: data.image,
            status: data.status || Status.ACTIVE
        });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return {
            status: true,
            data: result.data,
            message: 'Cuisine created successfully'
        };
    } catch (error: any) {
        DebugHelper.debugError('[Cuisine Service] createCuisine failed:', error);
        return { status: false, message: error.message || 'Failed to create cuisine' };
    }
};

// =====================================================
// 📄 GET ALL CUISINES
// =====================================================
export const getCuisines = async (params: {
    page: number;
    limit: number;
    filters: {
        name?: string;
        status?: Status;
    };
}) => {
    try {
        const { page, limit, filters } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters.name) {
            where.name = { contains: filters.name.trim() };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            cuisineRepo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            cuisineRepo.count({ where }),
            cuisineRepo.count({ where: {} })
        ]);

        const data = dataRes.data || [];
        const filtered = filteredCountRes.data || 0;
        const total = totalCountRes.data || 0;
        const totalPages = Math.ceil(filtered / limit);

        return {
            status: true,
            data,
            meta: {
                page,
                limit,
                total,
                filtered,
                count: data.length,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error: any) {
        DebugHelper.debugError(`[Cuisine Service] getCuisines failed: ${error.message}`);
        return { status: false, message: error.message || 'Failed to fetch cuisines', data: [], meta: null };
    }
};

// =====================================================
// 📄 GET SINGLE CUISINE
// =====================================================
export const getCuisineById = async (id: number) => {
    try {
        const result = await cuisineRepo.findUnique({ where: { id } });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Cuisine fetched successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to fetch cuisine' };
    }
};

// =====================================================
// ✏️ UPDATE CUISINE
// =====================================================
export const updateCuisine = async (
    id: number,
    data: {
        name?: string;
        image?: string;
        status?: Status;
    }
) => {
    try {
        const existing = await cuisineRepo.findUnique({ where: { id } });

        if (!existing.status) {
            return { status: false, message: 'Cuisine not found' };
        }

        if (data.name) {
            const nameClash = await cuisineRepo.findFirst({
                where: {
                    name: stringHelper.toTitleCase(data.name.trim().toLowerCase()),
                    NOT: { id }
                }
            });

            if (nameClash.status) {
                return { status: false, message: 'Another cuisine with this name already exists' };
            }
        }

        const result = await cuisineRepo.update(id, {
            ...(data.name ? { name: stringHelper.toTitleCase(data.name.trim().toLowerCase()) } : {}),
            ...(data.image !== undefined ? { image: data.image || null } : {}),
            ...(data.status ? { status: data.status } : {})
        });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Cuisine updated successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to update cuisine' };
    }
};

// =====================================================
// 🗑️ DELETE CUISINE
// =====================================================
export const deleteCuisine = async (id: number) => {
    try {
        const existing = await cuisineRepo.findUnique({ where: { id } });

        if (!existing.status) {
            return { status: false, message: 'Cuisine not found' };
        }

        const result = await cuisineRepo.delete({ id });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Cuisine deleted successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to delete cuisine' };
    }
};