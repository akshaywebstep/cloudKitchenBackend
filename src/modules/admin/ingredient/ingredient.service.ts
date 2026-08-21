import DebugHelper from '../../../core/helpers/debug';
import { Status } from '../../../../prisma/generated/prisma/client';
import stringHelper from '../../../core/helpers/string.helper';
import ingredientRepo from './ingredient.repository';

// =====================================================
// ✅ CREATE INGREDIENT
// =====================================================
export const createIngredient = async (data: {
    name: string;
    category: string;
    image?: string;
    status?: Status;
}) => {
    try {
        const existing = await ingredientRepo.findFirst({
            where: { name: stringHelper.toTitleCase(data.name.trim().toLowerCase()) }
        });

        if (existing.status) {
            return { status: false, message: 'Ingredient with this name already exists' };
        }

        const result = await ingredientRepo.create({
            name: stringHelper.toTitleCase(data.name.trim().toLowerCase()),
            category: stringHelper.toTitleCase(data.category.trim()),
            image: data.image,
            status: data.status || Status.ACTIVE
        });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return {
            status: true,
            data: result.data,
            message: 'Ingredient created successfully'
        };
    } catch (error: any) {
        DebugHelper.debugError('[Ingredient Service] createIngredient failed:', error);
        return { status: false, message: error.message || 'Failed to create ingredient' };
    }
};

// =====================================================
// 📄 GET ALL INGREDIENTS
// =====================================================
export const getIngredients = async (params: {
    page: number;
    limit: number;
    filters: {
        name?: string;
        category?: string;
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

        if (filters.category) {
            where.category = { contains: filters.category.trim() };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            ingredientRepo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            ingredientRepo.count({ where }),
            ingredientRepo.count({ where: {} })
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
        DebugHelper.debugError(`[Ingredient Service] getIngredients failed: ${error.message}`);
        return { status: false, message: error.message || 'Failed to fetch ingredients', data: [], meta: null };
    }
};

// =====================================================
// 📄 GET SINGLE INGREDIENT
// =====================================================
export const getIngredientById = async (id: number) => {
    try {
        const result = await ingredientRepo.findUnique({ where: { id } });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Ingredient fetched successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to fetch ingredient' };
    }
};

// =====================================================
// ✏️ UPDATE INGREDIENT
// =====================================================
export const updateIngredient = async (
    id: number,
    data: {
        name?: string;
        category?: string;
        image?: string;
        status?: Status;
    }
) => {
    try {
        const existing = await ingredientRepo.findUnique({ where: { id } });

        if (!existing.status) {
            return { status: false, message: 'Ingredient not found' };
        }

        if (data.name) {
            const nameClash = await ingredientRepo.findFirst({
                where: {
                    name: stringHelper.toTitleCase(data.name.trim().toLowerCase()),
                    NOT: { id }
                }
            });

            if (nameClash.status) {
                return { status: false, message: 'Another ingredient with this name already exists' };
            }
        }

        const result = await ingredientRepo.update(id, {
            ...(data.name ? { name: stringHelper.toTitleCase(data.name.trim().toLowerCase()) } : {}),
            ...(data.category ? { category: stringHelper.toTitleCase(data.category.trim()) } : {}),
            ...(data.image !== undefined ? { image: data.image || null } : {}),
            ...(data.status ? { status: data.status } : {})
        });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Ingredient updated successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to update ingredient' };
    }
};

// =====================================================
// 🗑️ DELETE INGREDIENT
// =====================================================
export const deleteIngredient = async (id: number) => {
    try {
        const existing = await ingredientRepo.findUnique({ where: { id } });

        if (!existing.status) {
            return { status: false, message: 'Ingredient not found' };
        }

        const result = await ingredientRepo.delete({ id });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Ingredient deleted successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to delete ingredient' };
    }
};