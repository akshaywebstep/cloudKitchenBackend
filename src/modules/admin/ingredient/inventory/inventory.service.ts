import { prisma } from '../../../../../lib/prisma';
import DebugHelper from '../../../../core/helpers/debug';
import stringHelper from '../../../../core/helpers/string.helper';
import branchIngredientInventoryRepo from './inventory.repository';

// =====================================================
// ✅ CREATE / MAP INGREDIENTS TO BRANCH
// =====================================================
export const createInventory = async (data: {
    kitchenId: number;
    branchId: number;
    ingredients: Array<{
        id: number;
        unit: string;
    }>;
}) => {
    const { kitchenId, branchId, ingredients } = data;

    DebugHelper.debug(
        '[Inventory Service] Mapping ingredients to branch...',
        JSON.stringify(data, null, 2)
    );

    try {
        const result = await prisma.$transaction(async (tx) => {

            // ===========================================
            // 🔍 VALIDATE MASTER INGREDIENT IDS EXIST
            // ===========================================
            const ingredientIds = ingredients.map(item => BigInt(item.id));

            const masterIngredients = await tx.ingredient.findMany({
                where: { id: { in: ingredientIds } },
                select: { id: true }
            });

            const validIds = new Set(masterIngredients.map(i => Number(i.id)));
            const invalidIds = ingredients
                .map(item => item.id)
                .filter(id => !validIds.has(id));

            if (invalidIds.length > 0) {
                throw new Error(`Invalid ingredient ids: ${invalidIds.join(', ')}`);
            }

            // ===========================================
            // 🔍 CHECK ALREADY MAPPED
            // ===========================================
            const existingMappings = await tx.branchIngredientInventory.findMany({
                where: {
                    kitchenId: BigInt(kitchenId),
                    branchId: BigInt(branchId),
                    ingredientId: { in: ingredientIds }
                },
                select: { ingredientId: true }
            });

            const alreadyMappedIds = new Set(
                existingMappings.map(item => Number(item.ingredientId))
            );

            // ===========================================
            // ➕ CREATE ONLY NEW MAPPINGS
            // ===========================================
            const toCreate = ingredients.filter(
                item => !alreadyMappedIds.has(item.id)
            );

            if (toCreate.length > 0) {
                await tx.branchIngredientInventory.createMany({
                    data: toCreate.map(item => ({
                        kitchenId: BigInt(kitchenId),
                        branchId: BigInt(branchId),
                        ingredientId: BigInt(item.id),
                        unit: item.unit as any
                    })),
                    skipDuplicates: true
                });
            }

            // ===========================================
            // 📄 RETURN FULL LIST FOR THIS BRANCH
            // ===========================================
            return await tx.branchIngredientInventory.findMany({
                where: {
                    kitchenId: BigInt(kitchenId),
                    branchId: BigInt(branchId),
                    ingredientId: { in: ingredientIds }
                },
                include: {
                    ingredient: true
                },
                orderBy: { id: 'desc' }
            });
        });

        return {
            status: true,
            data: stringHelper.convertBigInt(result, "number"),
            message: 'Ingredients mapped to branch successfully'
        };

    } catch (error: any) {
        DebugHelper.debugError('[Inventory Service] createInventory Error', error);
        return {
            status: false,
            message: error.message || 'Failed to map ingredients to branch'
        };
    }
};

// =====================================================
// 📄 GET BRANCH INVENTORY MAPPINGS
// =====================================================
export const getInventory = async (params: {
    page: number;
    limit: number;
    filters: {
        kitchenId: number;
        branchId: number;
        name?: string;
        category?: string;
    };
}) => {
    try {
        const { page, limit, filters } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            kitchenId: BigInt(filters.kitchenId),
            branchId: BigInt(filters.branchId),
            ingredient: {}
        };

        if (filters.name) {
            where.ingredient.name = { contains: filters.name.trim() };
        }

        if (filters.category) {
            where.ingredient.category = { contains: filters.category.trim() };
        }

        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            branchIngredientInventoryRepo.findMany({
                where,
                include: { ingredient: true },
                skip,
                take: limit,
                orderBy: { id: 'desc' }
            }),
            branchIngredientInventoryRepo.count({ where }),
            branchIngredientInventoryRepo.count({
                where: {
                    kitchenId: BigInt(filters.kitchenId),
                    branchId: BigInt(filters.branchId)
                }
            })
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
        DebugHelper.debugError('[Inventory Service] getInventory failed', error);
        return { status: false, message: error.message || 'Failed to fetch inventory', data: [], meta: null };
    }
};

// =====================================================
// ✏️ UPDATE MAPPING (change unit)
// =====================================================
export const updateInventory = async (id: number, data: { unit: string }) => {
    try {
        const existing = await branchIngredientInventoryRepo.findUnique({
            where: { id: BigInt(id) } as any
        });

        if (!existing.status) {
            return { status: false, message: 'Inventory mapping not found' };
        }

        const result = await branchIngredientInventoryRepo.update(BigInt(id), {
            unit: data.unit as any
        });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Inventory mapping updated successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to update inventory mapping' };
    }
};

// =====================================================
// 🗑️ DELETE MAPPING
// =====================================================
export const deleteInventory = async (id: number) => {
    try {
        const existing = await branchIngredientInventoryRepo.findUnique({
            where: { id: BigInt(id) } as any
        });

        if (!existing.status) {
            return { status: false, message: 'Inventory mapping not found' };
        }

        const result = await branchIngredientInventoryRepo.delete({ id: BigInt(id) });

        if (!result.status) {
            return { status: false, message: result.message };
        }

        return { status: true, data: result.data, message: 'Inventory mapping deleted successfully' };
    } catch (error: any) {
        return { status: false, message: error.message || 'Failed to delete inventory mapping' };
    }
};