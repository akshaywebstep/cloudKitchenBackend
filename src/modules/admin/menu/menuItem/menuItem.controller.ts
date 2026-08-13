import { Request, Response } from 'express';
import * as MenuItemService from './menuItem.service';
import * as BranchService from '../../branch/branch.service';
import debugHelper from '../../../../core/helpers/debug';
import menuItemRepo from './menuItem.repository';
import menuCategoryRepo from '../../../shared/menu/category.repository';
// import branchIngredientInventoryRepo from '../../ingredient/ingredient.repository';
import branchIngredientInventoryRepo from '../../../kitchen/branch/ingredient/ingredient.repository';

// =====================================================
// ✅ CREATE MENU
// =====================================================
export const createMenuItem = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE MENU START ===');

    try {
        const {
            kitchenId,
            branchId,
            name,
            description,
            price,
            category,
            subCategory,
            ingredients
        } = req.body;

        // ===============================================
        // 🔒 VERIFY BRANCH BELONGS TO KITCHEN
        // ===============================================
        const branchResult = await BranchService.getBranchById(BigInt(branchId));
        if (!branchResult.status) {
            return res.status(404).json({
                status: false,
                message: branchResult.message
            });
        }

        if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
            return res.status(403).json({
                status: false,
                message: 'Branch does not belong to this kitchen'
            });
        }

        const errors: Record<string, string> = {};

        // ===============================================
        // 🔍 CHECK EXISTING MENU ITEM
        // ===============================================
        const existing = await menuItemRepo.findFirst({
            where: {
                kitchenId: BigInt(kitchenId),
                branchId: BigInt(branchId),
                name: name
            }
        });

        if (existing.status) {
            errors.name = "Menu item already exists with same name";
        }

        // ===============================================
        // 🏷️ VALIDATE CATEGORY
        // ===============================================
        if (category?.id) {
            const categoryResponse = await menuCategoryRepo.findUnique({
                where: { id: BigInt(category.id) },
                select: { id: true }
            });

            if (!categoryResponse.status || !categoryResponse.data) {
                errors.category = "Category not found";
            }
        }

        // ===============================================
        // 🏷️ VALIDATE SUB CATEGORY
        // ===============================================
        if (subCategory?.id) {
            const subCategoryResponse = await menuCategoryRepo.findUnique({
                where: { id: BigInt(subCategory.id) },
                select: { id: true, parentId: true }
            });

            if (!subCategoryResponse.status || !subCategoryResponse.data) {
                errors.subCategory = "Sub category not found";
            } else {
                if (!subCategoryResponse.data.parentId) {
                    errors.subCategory = "Selected category is not a sub category";
                } else if (category?.id) {
                    if (Number(subCategoryResponse.data.parentId) !== Number(category.id)) {
                        errors.subCategory = "Sub category does not belong to selected category";
                    }
                }
            }
        }

        // ===============================================
        // 🥬 VALIDATE INGREDIENTS
        // ===============================================
        if (ingredients?.length) {
            const ingredientIds = ingredients.map((item: { id: number }) => Number(item.id));
            const ingredientBigIntIds = ingredientIds.map((id: number) => BigInt(id));

            const inventoryResponse = await branchIngredientInventoryRepo.findMany({
                where: {
                    kitchenId: BigInt(kitchenId),
                    branchId: BigInt(branchId),
                    ingredientId: { in: ingredientBigIntIds }
                },
                select: { ingredientId: true }
            });

            const foundIds = new Set(
                inventoryResponse.data.map((item: any) => Number(item.ingredientId))
            );

            const invalidIngredients = ingredientIds.filter((id: number) => !foundIds.has(id));

            if (invalidIngredients.length > 0) {
                errors.ingredients = `Invalid ingredient ids: ${invalidIngredients.join(', ')}`;
            }
        }

        // ===============================================
        // ❌ RETURN ERRORS
        // ===============================================
        if (Object.keys(errors).length > 0) {
            debugHelper.debugWarn("Validation failed:", errors);
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors
            });
        }

        // ===============================================
        // 🚀 CREATE MENU ITEM
        // ===============================================
        const result = await MenuItemService.createMenuItem({
            kitchenId,
            branchId,
            name,
            description,
            price,
            category,
            subCategory,
            ingredients
        });

        if (!result.status) {
            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        return res.status(201).json({
            status: true,
            message: result.message,
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ CREATE MENU ERROR:', error);
        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    } finally {
        debugHelper.debug('=== CREATE MENU END ===');
    }
};

// =====================================================
// 📄 GET ALL MENUES
// =====================================================
export const getMenuItemes = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET MENUES START ===');

    try {
        const {
            page = 1, limit = 10,
            kitchenId, branchId,
            name, category, categoryId, subCategory, subCategoryId
        } = req.query;

        if (!kitchenId || !branchId) {
            return res.status(400).json({
                status: false,
                message: 'kitchenId and branchId are required'
            });
        }

        const branchResult = await BranchService.getBranchById(BigInt(Number(branchId)));
        if (!branchResult.status) {
            return res.status(404).json({
                status: false,
                message: branchResult.message
            });
        }

        const result = await MenuItemService.getMenuItemes({
            page: Number(page),
            limit: Number(limit),
            filters: {
                kitchenId: Number(kitchenId),
                branchId: Number(branchId),
                name: name ? String(name) : undefined,
                category: category ? String(category) : undefined,
                categoryId: categoryId ? Number(categoryId) : undefined,
                subCategory: subCategory ? String(subCategory) : undefined,
                subCategoryId: subCategoryId ? Number(subCategoryId) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'MenuItemes fetched successfully',
            data: result.data,
            meta: result.meta
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET MENUES END ===');
    }
};

// =====================================================
// 🔍 GET SINGLE MENU
// =====================================================
export const getMenuItemById = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET MENU BY ID START ===');

    try {
        const { id } = req.params;
        const { kitchenId, branchId } = req.query;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ status: false, message: "Invalid menuItem id" });
        }

        const result = await MenuItemService.getMenuItemById(BigInt(id));

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        if (kitchenId && branchId) {
            if (
                Number(result.data?.kitchenId) !== Number(kitchenId) ||
                Number(result.data?.branchId) !== Number(branchId)
            ) {
                return res.status(403).json({
                    status: false,
                    message: 'Menu item does not belong to this branch'
                });
            }
        }

        return res.status(200).json({
            status: true,
            message: 'MenuItem fetched successfully',
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET MENU BY ID END ===');
    }
};

// =====================================================
// ✏️ UPDATE MENU
// =====================================================
export const updateMenuItem = async (req: Request, res: Response) => {
    debugHelper.debug('=== UPDATE MENU START ===');

    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ status: false, message: "Invalid menuItem id" });
        }

        const {
            kitchenId,
            branchId,
            name,
            category,
            subCategory,
            ingredients
        } = req.body;

        const errors: Record<string, string> = {};

        // ===============================================
        // 🔍 CHECK MENU ITEM EXISTS
        // ===============================================
        const existingMenuItem = await menuItemRepo.findUnique({
            where: { id: BigInt(id) },
            select: { id: true, kitchenId: true, branchId: true, name: true }
        });

        if (!existingMenuItem.status || !existingMenuItem.data) {
            return res.status(404).json({ status: false, message: "MenuItem not found" });
        }

        // ===============================================
        // 🔒 CHECK OWNERSHIP (agar kitchenId/branchId body mein diya hai to match karo)
        // ===============================================
        const effectiveKitchenId = kitchenId ?? Number(existingMenuItem.data.kitchenId);
        const effectiveBranchId = branchId ?? Number(existingMenuItem.data.branchId);

        if (
            Number(existingMenuItem.data.kitchenId) !== Number(effectiveKitchenId) ||
            Number(existingMenuItem.data.branchId) !== Number(effectiveBranchId)
        ) {
            return res.status(403).json({ status: false, message: "Unauthorized access" });
        }

        // ===============================================
        // 🔍 CHECK DUPLICATE NAME
        // ===============================================
        if (name) {
            const duplicateMenuItem = await menuItemRepo.findFirst({
                where: {
                    kitchenId: BigInt(effectiveKitchenId),
                    branchId: BigInt(effectiveBranchId),
                    name,
                    NOT: { id: BigInt(id) }
                },
                select: { id: true }
            });

            if (duplicateMenuItem.status && duplicateMenuItem.data) {
                errors.name = "Menu item already exists with same name";
            }
        }

        // ===============================================
        // 🏷️ VALIDATE CATEGORY
        // ===============================================
        if (category?.id) {
            const categoryResponse = await menuCategoryRepo.findUnique({
                where: { id: BigInt(category.id) },
                select: { id: true }
            });

            if (!categoryResponse.status || !categoryResponse.data) {
                errors.category = "Category not found";
            }
        }

        // ===============================================
        // 🏷️ VALIDATE SUB CATEGORY
        // ===============================================
        if (subCategory?.id) {
            const subCategoryResponse = await menuCategoryRepo.findUnique({
                where: { id: BigInt(subCategory.id) },
                select: { id: true, parentId: true }
            });

            if (!subCategoryResponse.status || !subCategoryResponse.data) {
                errors.subCategory = "Sub category not found";
            } else {
                if (!subCategoryResponse.data.parentId) {
                    errors.subCategory = "Selected category is not a sub category";
                } else if (category?.id) {
                    if (Number(subCategoryResponse.data.parentId) !== Number(category.id)) {
                        errors.subCategory = "Sub category does not belong to selected category";
                    }
                }
            }
        }

        // ===============================================
        // 🥬 VALIDATE INGREDIENTS
        // ===============================================
        if (ingredients?.length) {
            const ingredientIds = ingredients.map((item: { id: number }) => Number(item.id));

            const inventoryResponse = await branchIngredientInventoryRepo.findMany({
                where: {
                    kitchenId: BigInt(effectiveKitchenId),
                    branchId: BigInt(effectiveBranchId),
                    ingredientId: { in: ingredientIds.map((id: number) => BigInt(id)) }
                },
                select: { ingredientId: true }
            });

            const foundIds = new Set(
                inventoryResponse.data.map((item: any) => Number(item.ingredientId))
            );

            const invalidIngredients = ingredientIds.filter(
                (ingredientId: number) => !foundIds.has(ingredientId)
            );

            if (invalidIngredients.length > 0) {
                errors.ingredients = `Invalid ingredient ids: ${invalidIngredients.join(', ')}`;
            }
        }

        // ===============================================
        // ❌ RETURN VALIDATION ERRORS
        // ===============================================
        if (Object.keys(errors).length > 0) {
            debugHelper.debugWarn("Validation failed:", errors);
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors
            });
        }

        const updateData = { ...req.body };

        // ===============================================
        // 🚀 UPDATE MENU ITEM
        // ===============================================
        const result = await MenuItemService.updateMenuItem(BigInt(id), updateData);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({
            status: true,
            message: 'MenuItem updated successfully',
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ UPDATE MENU ERROR:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== UPDATE MENU END ===');
    }
};

// =====================================================
// ❌ DELETE MENU
// =====================================================
export const deleteMenuItem = async (req: Request, res: Response) => {
    debugHelper.debug('=== DELETE MENU START ===');

    try {
        const { id } = req.params;
        const { kitchenId, branchId } = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ status: false, message: "Invalid menuItem id" });
        }

        const existing = await MenuItemService.getMenuItemById(BigInt(id));
        if (!existing.status) {
            return res.status(404).json({ status: false, message: existing.message });
        }

        if (kitchenId && branchId) {
            if (
                Number(existing.data?.kitchenId) !== Number(kitchenId) ||
                Number(existing.data?.branchId) !== Number(branchId)
            ) {
                return res.status(403).json({
                    status: false,
                    message: 'Menu item does not belong to this branch'
                });
            }
        }

        const result = await MenuItemService.deleteMenuItem(BigInt(id));

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({
            status: true,
            message: 'MenuItem deleted successfully'
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== DELETE MENU END ===');
    }
};

// =====================================================
// 🔄 TOGGLE STATUS
// =====================================================
export const updateMenuItemStatus = async (req: Request, res: Response) => {
    debugHelper.debug('=== UPDATE MENU STATUS START ===');

    try {
        const { id } = req.params;
        const { kitchenId, branchId, status } = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ status: false, message: "Invalid menuItem id" });
        }

        const existing = await MenuItemService.getMenuItemById(BigInt(id));
        if (!existing.status) {
            return res.status(404).json({ status: false, message: existing.message });
        }

        if (kitchenId && branchId) {
            if (
                Number(existing.data?.kitchenId) !== Number(kitchenId) ||
                Number(existing.data?.branchId) !== Number(branchId)
            ) {
                return res.status(403).json({
                    status: false,
                    message: 'Menu item does not belong to this branch'
                });
            }
        }

        const result = await MenuItemService.updateMenuItemStatus(BigInt(id), status);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({
            status: true,
            message: 'MenuItem status updated',
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== TOGGLE MENU STATUS END ===');
    }
};