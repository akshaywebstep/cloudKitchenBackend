import { prisma } from '../../../../../../lib/prisma';
import DebugHelper from '../../../../../core/helpers/debug';
import stringHelper from '../../../../../core/helpers/string.helper';
import stockRepo from './stock.repository';

// =====================================================
// 📦 CREATE STOCK
// =====================================================
export const createStock = async (data: {
    kitchenId: number;
    branchId: number;
    stocks: Array<{
        id: number;
        stock: number;
        expireAt?: Date;
    }>;
}) => {

    const {
        kitchenId,
        branchId,
        stocks
    } = data;

    try {

        DebugHelper.debug(
            '[Stock Service] Create Stock Payload',
            JSON.stringify(data, null, 2)
        );

        // ===============================================
        // 🧠 TRANSACTION START
        // ===============================================
        const result = await prisma.$transaction(async (tx) => {

            // ===========================================
            // ✅ INGREDIENT IDS
            // ===========================================
            const ingredientIds = stocks.map(item =>
                BigInt(item.id)
            );

            // ===========================================
            // ✅ FETCH INVENTORY ITEMS
            // ===========================================
            const inventoryItems =
                await tx.branchIngredientInventory.findMany({
                    where: {
                        kitchenId: BigInt(kitchenId),
                        branchId: BigInt(branchId),
                        ingredientId: {
                            in: ingredientIds
                        }
                    },
                    select: {
                        id: true,
                        ingredientId: true
                    }
                });

            // ===========================================
            // 📦 CREATE INVENTORY STOCKS
            // ⚠️ SKIP UNMAPPED INGREDIENTS
            // ===========================================
            const payload = stocks
                .map(item => {

                    const inventoryItem = inventoryItems.find(
                        inv =>
                            Number(inv.ingredientId) === Number(item.id)
                    );

                    // ❌ skip if not mapped
                    if (!inventoryItem) {
                        return null;
                    }

                    return {
                        inventoryItemId: inventoryItem.id,
                        quantity: item.stock,
                        expiryDate: item.expireAt
                            ? new Date(item.expireAt)
                            : null
                    };
                })
                .filter(Boolean) as {
                    inventoryItemId: bigint;
                    quantity: number;
                    expiryDate: Date | null;
                }[];

            // ===========================================
            // ❌ NOTHING TO INSERT
            // ===========================================
            if (payload.length === 0) {
                throw new Error(
                    'No valid mapped ingredients found for this branch'
                );
            }

            // ===========================================
            // ✅ INSERT STOCKS
            // ===========================================
            await tx.inventoryStock.createMany({
                data: payload
            });

            // ===========================================
            // 📄 RETURN CREATED STOCKS
            // ===========================================
            return await tx.inventoryStock.findMany({
                where: {
                    inventoryItem: {
                        kitchenId: BigInt(kitchenId),
                        branchId: BigInt(branchId)
                    }
                },
                include: {
                    inventoryItem: {
                        include: {
                            ingredient: true,
                            branch: true
                        }
                    }
                },
                orderBy: {
                    id: 'desc'
                }
            });

        });

        return {
            status: true,
            message: 'Stocks added successfully',
            data: stringHelper.convertBigInt(result)
        };

    } catch (error: any) {

        DebugHelper.debugError(
            '[Stock Service] createStock Error',
            error
        );

        return {
            status: false,
            message: error.message || 'Failed to add stocks'
        };
    }
};

// =====================================================
// 📄 GET STOCKS
// =====================================================
export const getStocks = async (params: {
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

        DebugHelper.debug(
            `[Stock Service] Fetching Stocks | Page: ${page}`,
            filters
        );

        // ===============================================
        // 🔍 BUILD WHERE FILTER
        // ===============================================
        const where: any = {

            inventoryItem: {
                kitchenId: BigInt(filters.kitchenId),
                branchId: BigInt(filters.branchId),

                ingredient: {}
            }
        };

        // 🔍 NAME FILTER
        if (filters.name) {

            where.inventoryItem.ingredient.name = {
                contains: filters.name.trim()
            };
        }

        // 🔍 CATEGORY FILTER
        if (filters.category) {

            where.inventoryItem.ingredient.category = {
                contains: filters.category.trim()
            };
        }

        // ===============================================
        // 📦 FETCH DATA
        // ===============================================
        const [
            dataRes,
            filteredCountRes,
            totalCountRes
        ] = await Promise.all([

            // ===========================================
            // 📄 DATA
            // ===========================================
            stockRepo.findMany({
                where,
                select: {
                    id: true,
                    quantity: true,
                    expiryDate: true,
                    createdAt: true,

                    inventoryItem: {
                        select: {
                            id: true,
                            unit: true,

                            ingredient: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    category: true,
                                    status: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: {
                    id: 'desc'
                }
            }),

            // ===========================================
            // 🔢 FILTERED COUNT
            // ===========================================
            stockRepo.count({
                where
            }),

            // ===========================================
            // 🔢 TOTAL COUNT
            // ===========================================
            stockRepo.count({
                where: {
                    inventoryItem: {
                        kitchenId: BigInt(filters.kitchenId),
                        branchId: BigInt(filters.branchId)
                    }
                }
            })
        ]);

        // ===============================================
        // 🧹 FORMAT RESPONSE
        // ===============================================
        const data = dataRes.data || [];
        const filtered = filteredCountRes.data || 0;
        const total = totalCountRes.data || 0;

        const totalPages = Math.ceil(filtered / limit);

        return {
            status: true,
            data: stringHelper.convertBigInt(data),
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

        DebugHelper.debugError(
            `[Stock Service] getStocks failed`,
            error
        );

        return {
            status: false,
            message: error.message || 'Failed to fetch stocks',
            data: [],
            meta: null
        };
    }
};