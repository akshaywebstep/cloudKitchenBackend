import DebugHelper from '../../../../core/helpers/debug';
import menuItemRepo from './menu.repository';
import {
    Status
} from '../../../../../prisma/generated/prisma/client';

import { prisma } from '../../../../../lib/prisma';

import stringHelper from '../../../../core/helpers/string.helper';

// =====================================================
// ✅ CREATE MENU
// =====================================================
export const createMenuItem = async (data: {
    kitchenId: number;
    branchId: number;

    name: string;
    description?: string;
    price: number;

    category?: {
        id?: number;
        name?: string;
    };

    subCategory?: {
        id?: number;
        name?: string;
    };

    ingredients?: Array<{
        id: number;
        quantity: number;
    }>;
}) => {

    const {
        kitchenId,
        branchId,

        name,
        description,
        price,

        category,
        subCategory,

        ingredients = []
    } = data;

    DebugHelper.debug(
        '[MenuItem Service] Saving new menuItem...'
    );

    DebugHelper.debug(
        '[MenuItem Service] Data:',
        JSON.stringify(data, null, 2)
    );

    try {

        // ===============================================
        // 🧠 TRANSACTION START
        // ===============================================
        const result = await prisma.$transaction(
            async (tx) => {

                // ===============================================
                // 🏷️ CATEGORY
                // ===============================================
                let categoryId: bigint | undefined;

                if (category?.id) {

                    categoryId = BigInt(category.id);
                }
                else if (category?.name) {

                    const createdCategory =
                        await tx.menuCategory.upsert({
                            where: {
                                name: category.name.trim()
                            },
                            update: {},
                            create: {
                                name: stringHelper.toTitleCase(
                                    category.name.trim()
                                ),
                                status: Status.PENDING
                            }
                        });

                    categoryId = createdCategory.id;
                }

                // ===============================================
                // 🏷️ SUB CATEGORY
                // ===============================================
                let subCategoryId: bigint | undefined;

                if (subCategory?.id) {

                    subCategoryId =
                        BigInt(subCategory.id);
                }
                else if (
                    subCategory?.name
                ) {

                    // ===============================================
                    // 🔥 ENSURE CATEGORY EXISTS
                    // ===============================================
                    if (!categoryId) {

                        throw new Error(
                            "Category is required for sub category"
                        );
                    }

                    const normalizedSubCategoryName =
                        stringHelper.toTitleCase(
                            subCategory.name.trim()
                        );

                    // ===============================================
                    // 🔍 FIND EXISTING SUB CATEGORY
                    // ===============================================
                    const existingSubCategory =
                        await tx.menuCategory.findFirst({
                            where: {
                                name: normalizedSubCategoryName,
                                parentId: Number(categoryId)
                            }
                        });

                    if (existingSubCategory) {

                        subCategoryId =
                            existingSubCategory.id;
                    }
                    else {

                        // ===============================================
                        // ➕ CREATE NEW SUB CATEGORY
                        // ===============================================
                        const createdSubCategory =
                            await tx.menuCategory.create({
                                data: {
                                    name: normalizedSubCategoryName,

                                    parent: {
                                        connect: {
                                            id: categoryId
                                        }
                                    },

                                    status: Status.PENDING
                                }
                            });

                        subCategoryId =
                            createdSubCategory.id;
                    }
                }

                // ===============================================
                // 🍽️ CREATE MENU ITEM
                // ===============================================
                const menuItem =
                    await tx.menuItem.create({
                        data: {

                            kitchen: {
                                connect: {
                                    id: BigInt(kitchenId)
                                }
                            },

                            branch: {
                                connect: {
                                    id: BigInt(branchId)
                                }
                            },

                            name,
                            description,
                            price,

                            ...(categoryId && {
                                category: {
                                    connect: {
                                        id: categoryId
                                    }
                                }
                            }),

                            ...(subCategoryId && {
                                subCategory: {
                                    connect: {
                                        id: subCategoryId
                                    }
                                }
                            })
                        }
                    });

                // ===============================================
                // 🥬 MAP INGREDIENTS
                // ===============================================
                if (ingredients.length > 0) {

                    const inventoryItems =
                        await tx.branchIngredientInventory.findMany({
                            where: {
                                kitchenId: BigInt(kitchenId),
                                branchId: BigInt(branchId),

                                ingredientId: {
                                    in: ingredients.map(
                                        item =>
                                            BigInt(item.id)
                                    )
                                }
                            },
                            select: {
                                id: true,
                                ingredientId: true
                            }
                        });

                    const inventoryMap =
                        new Map(
                            inventoryItems.map(item => [
                                Number(item.ingredientId),
                                item.id
                            ])
                        );

                    await tx.menuItemIngredient.createMany({
                        data: ingredients.map(
                            ingredient => ({
                                menuItemId: menuItem.id,

                                inventoryItemId:
                                    inventoryMap.get(
                                        ingredient.id
                                    )!,

                                quantityRequired:
                                    ingredient.quantity
                            })
                        ),
                        skipDuplicates: true
                    });
                }

                return menuItem;
            }
        );

        return {
            status: true,
            data: stringHelper.convertBigInt(result, "number"),
            message:
                'MenuItem created successfully'
        };

    } catch (error: any) {

        DebugHelper.debugError(
            '[MenuItem Service] Error:',
            error
        );

        return {
            status: false,
            message:
                error.message ||
                'Failed to create menuItem'
        };
    }
};

// =====================================================
// 📄 GET ALL MENUES
// =====================================================
export const getMenuItemes = async (params: {
    page: number;
    limit: number;

    filters: {
        kitchenId: number;
        branchId: number;

        name?: string;

        category?: string;
        categoryId?: number;

        subCategory?: string;
        subCategoryId?: number;

        status?: string;
    };
}) => {

    try {

        const {
            page,
            limit,
            filters
        } = params;

        const skip =
            (page - 1) * limit;

        DebugHelper.debug(
            `[MenuItem Service] Fetching menuItems | Page: ${page}`
        );

        // ===============================================
        // 🔍 BUILD WHERE
        // ===============================================
        const where: any = {
            kitchenId: BigInt(filters.kitchenId),
            branchId: BigInt(filters.branchId),
            status: Status.ACTIVE
        };

        // ===============================================
        // 🔎 SEARCH BY NAME
        // ===============================================
        if (filters.name?.trim()) {

            where.OR = [
                {
                    name: {
                        contains: filters.name.trim()
                    }
                }

                /*
                {
                    description: {
                        contains: filters.name.trim()
                    }
                }
                */
            ];
        }

        // ===============================================
        // 🏷️ CATEGORY NAME FILTER
        // ===============================================
        if (filters.category?.trim()) {

            where.category = {
                name: {
                    contains: filters.category.trim()
                }
            };
        }

        // ===============================================
        // 🏷️ CATEGORY ID FILTER
        // ===============================================
        if (filters.categoryId) {

            where.categoryId =
                BigInt(filters.categoryId);
        }

        // ===============================================
        // 🏷️ SUB CATEGORY NAME FILTER
        // ===============================================
        if (filters.subCategory?.trim()) {

            where.subCategory = {
                ...(where.subCategory || {}),
                name: {
                    contains: filters.subCategory.trim()
                }
            };
        }

        // ===============================================
        // 🏷️ SUB CATEGORY ID FILTER
        // ===============================================
        if (filters.subCategoryId) {

            where.subCategoryId =
                BigInt(filters.subCategoryId);
        }

        // ===============================================
        // 🔄 STATUS FILTER
        // ===============================================
        if (filters.status) {

            where.status =
                filters.status;
        }

        // ===============================================
        // 📦 FETCH DATA
        // ===============================================
        const [
            dataRes,
            filteredCountRes,
            totalCountRes
        ] = await Promise.all([

            menuItemRepo.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: "desc"
                },

                include: {
                    category: true,

                    subCategory: true,

                    ingredients: {
                        include: {
                            inventoryItem: {
                                include: {
                                    ingredient: true
                                }
                            }
                        }
                    }
                }
            }),

            // 🔥 FILTERED COUNT
            menuItemRepo.count({
                where
            }),

            // 🔥 TOTAL COUNT
            menuItemRepo.count({
                where: {
                    kitchenId: BigInt(
                        filters.kitchenId
                    ),
                    branchId: BigInt(
                        filters.branchId
                    ),
                    status: Status.ACTIVE
                }
            })
        ]);

        const data =
            dataRes.data || [];

        const filtered =
            filteredCountRes.data || 0;

        const total =
            totalCountRes.data || 0;

        const totalPages =
            Math.ceil(filtered / limit);

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

                hasNextPage:
                    page < totalPages,

                hasPrevPage:
                    page > 1
            }
        };

    } catch (error: any) {

        DebugHelper.debugError(
            `[MenuItem Service] getMenuItemes failed: ${error.message}`
        );

        return {
            status: false,

            message:
                "Failed to fetch menuItems",

            data: [],

            meta: null
        };
    }
};

// =====================================================
// 🔍 GET MENU BY ID
// =====================================================
export const getMenuItemById = async (
    id: bigint
) => {

    try {

        DebugHelper.debug(
            `[MenuItem Service] Fetching menuItem: ${id}`
        );

        const response =
            await menuItemRepo.findUnique({
                where: { id },

                include: {
                    category: true,
                    subCategory: true,

                    ingredients: {
                        include: {
                            inventoryItem: {
                                include: {
                                    ingredient: true
                                }
                            }
                        }
                    }
                }
            });

        if (!response?.data) {

            return {
                status: false,
                message:
                    'MenuItem not found'
            };
        }

        return {
            status: true,
            data: response.data
        };

    } catch (error: any) {

        DebugHelper.debugError(
            `[MenuItem Service] getMenuItemById failed: ${error.message}`
        );

        return {
            status: false,
            message:
                'Something went wrong'
        };
    }
};

// =====================================================
// ✏️ UPDATE MENU
// =====================================================
export const updateMenuItem = async (
    id: bigint,
    data: any
) => {

    try {

        DebugHelper.debug(
            `[MenuItem Service] Updating menuItem: ${id}`
        );

        const existing =
            await menuItemRepo.findUnique({
                where: { id }
            });

        if (!existing?.data) {

            return {
                status: false,
                message:
                    'MenuItem not found'
            };
        }

        const kitchenId = Number(existing.data.kitchenId);
        const branchId = Number(existing.data.branchId);

        const result =
            await prisma.$transaction(
                async (tx) => {

                    let categoryId:
                        bigint | undefined;

                    let subCategoryId:
                        bigint | undefined;

                    // ===============================================
                    // 🏷️ CATEGORY
                    // ===============================================
                    if (data.category?.id) {

                        categoryId =
                            BigInt(data.category.id);
                    }
                    else if (
                        data.category?.name
                    ) {

                        const category =
                            await tx.menuCategory.upsert({
                                where: {
                                    name:
                                        data.category.name.trim()
                                },
                                update: {},
                                create: {
                                    name:
                                        stringHelper.toTitleCase(
                                            data.category.name.trim()
                                        ),

                                    status:
                                        Status.PENDING
                                }
                            });

                        categoryId =
                            category.id;
                    }

                    // ===============================================
                    // 🏷️ SUB CATEGORY
                    // ===============================================
                    if (data.subCategory?.id) {

                        subCategoryId =
                            BigInt(
                                data.subCategory.id
                            );
                    }
                    else if (
                        data.subCategory?.name &&
                        categoryId
                    ) {

                        const subCategory =
                            await tx.menuCategory.upsert({
                                where: {
                                    name:
                                        data.subCategory.name.trim()
                                },
                                update: {},
                                create: {
                                    name:
                                        stringHelper.toTitleCase(
                                            data.subCategory.name.trim()
                                        ),

                                    parent: {
                                        connect: {
                                            id: categoryId
                                        }
                                    },

                                    status:
                                        Status.PENDING
                                }
                            });

                        subCategoryId =
                            subCategory.id;
                    }

                    // ===============================================
                    // ✏️ UPDATE MENU ITEM
                    // ===============================================
                    const updatedMenuItem =
                        await tx.menuItem.update({
                            where: { id },

                            data: {
                                ...(data.name && {
                                    name: data.name
                                }),

                                ...(data.description !== undefined && {
                                    description:
                                        data.description
                                }),

                                ...(data.price !== undefined && {
                                    price: data.price
                                }),

                                ...(categoryId && {
                                    category: {
                                        connect: {
                                            id: categoryId
                                        }
                                    }
                                }),

                                ...(subCategoryId && {
                                    subCategory: {
                                        connect: {
                                            id: subCategoryId
                                        }
                                    }
                                })
                            }
                        });

                    // ===============================================
                    // 🥬 UPDATE INGREDIENTS
                    // ===============================================
                    if (
                        Array.isArray(
                            data.ingredients
                        )
                    ) {

                        await tx.menuItemIngredient.deleteMany({
                            where: {
                                menuItemId: id
                            }
                        });

                        if (
                            data.ingredients.length > 0
                        ) {

                            const inventoryItems =
                                await tx.branchIngredientInventory.findMany({
                                    where: {
                                        kitchenId: BigInt(kitchenId),
                                        branchId: BigInt(branchId),
                                        ingredientId: {
                                            in:
                                                data.ingredients.map(
                                                    (
                                                        item: any
                                                    ) =>
                                                        BigInt(
                                                            item.id
                                                        )
                                                )
                                        }
                                    },

                                    select: {
                                        id: true,
                                        ingredientId: true
                                    }
                                });

                            const inventoryMap =
                                new Map(
                                    inventoryItems.map(
                                        item => [
                                            Number(
                                                item.ingredientId
                                            ),
                                            item.id
                                        ]
                                    )
                                );

                            await tx.menuItemIngredient.createMany({
                                data:
                                    data.ingredients.map(
                                        (
                                            ingredient: any
                                        ) => ({
                                            menuItemId:
                                                id,

                                            inventoryItemId:
                                                inventoryMap.get(
                                                    ingredient.id
                                                )!,

                                            quantityRequired:
                                                ingredient.quantity
                                        })
                                    ),

                                skipDuplicates:
                                    true
                            });
                        }
                    }

                    return updatedMenuItem;
                }
            );

        return {
            status: true,
            message:
                'MenuItem updated successfully',
            data: stringHelper.convertBigInt(result, "number")
        };

    } catch (error: any) {

        DebugHelper.debugError(
            `[MenuItem Service] updateMenuItem failed: ${error.message}`
        );

        return {
            status: false,
            message:
                'Something went wrong while updating menuItem'
        };
    }
};

// =====================================================
// ❌ DELETE MENU
// =====================================================
export const deleteMenuItem = async (
    id: bigint
) => {

    try {

        DebugHelper.debug(
            `[MenuItem Service] Deleting menuItem: ${id}`
        );

        const existing =
            await menuItemRepo.findUnique({
                where: { id }
            });

        if (!existing?.data) {

            return {
                status: false,
                message:
                    'MenuItem not found'
            };
        }

        const response =
            await menuItemRepo.update(
                Number(id),
                {
                    status: Status.INACTIVE
                }
            );

        if (!response.status) {

            return {
                status: false,
                message:
                    'Failed to delete menuItem'
            };
        }

        return {
            status: true,
            message:
                'MenuItem deleted successfully'
        };

    } catch (error: any) {

        DebugHelper.debugError(
            `[MenuItem Service] deleteMenuItem failed: ${error.message}`
        );

        return {
            status: false,
            message:
                'Something went wrong while deleting menuItem'
        };
    }
};

// =====================================================
// 🔄 UPDATE STATUS
// =====================================================
export const updateMenuItemStatus = async (
    id: bigint,
    status: Status
) => {

    try {

        DebugHelper.debug(
            `[MenuItem Service] Updating status: ${id} -> ${status}`
        );

        const existing =
            await menuItemRepo.findUnique({
                where: {
                    id: Number(id)
                }
            });

        if (!existing?.data) {

            return {
                status: false,
                message:
                    'MenuItem not found'
            };
        }

        if (
            existing.data.status === status
        ) {

            return {
                status: false,
                message:
                    `MenuItem already ${status}`
            };
        }

        const response =
            await menuItemRepo.update(
                Number(id),
                { status }
            );

        return {
            status: true,
            message:
                'MenuItem status updated successfully',
            data: response.data
        };

    } catch (error: any) {

        DebugHelper.debugError(
            `[MenuItem Service] updateMenuItemStatus failed: ${error.message}`
        );

        return {
            status: false,
            message:
                'Something went wrong'
        };
    }
};