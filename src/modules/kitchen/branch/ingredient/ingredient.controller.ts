import { Request, Response } from 'express';
import * as IngredientService from './ingredient.service';
import * as BranchService from '../branch.service';
import debugHelper from '../../../../core/helpers/debug';

// =====================================================
// ✅ CREATE INGREDIENT
// =====================================================
export const CreateIngredient = async (req: Request, res: Response) => {
    debugHelper.debug('=== SELECT PLAN START ===');

    try {
        const request = req as Request & {
            kitchen: { id: number };
        };

        const kitchenId = request.kitchen.id;

        const branchId = Number(req.params.branchId);
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

        const {
            ingredients
        } = request.body;

        debugHelper.debugWarn('req.body', JSON.stringify(req.body, null, 2));

        // --- Step 6: Prepare DB payload ---
        debugHelper.debug('[Register Controller] Calling AuthService.createKitchenService...');
        const result = await IngredientService.createIngredient({
            kitchenId,
            branchId,
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
            message: result.message
        });

    } catch (error: any) {
        debugHelper.debugError('❌ SELECT PLAN ERROR:', error);

        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    } finally {
        debugHelper.debug('=== SELECT PLAN END ===');
    }
};

// =====================================================
// 📄 GET ALL INGREDIENTS
// =====================================================
export const getIngredients = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET INGREDIENTS START ===');

    const request = req as Request & {
        kitchen: { id: number };
    };

    const kitchenId = request.kitchen.id;

    const branchId = Number(req.params.branchId);
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

    try {
        const { page = 1, limit = 10, name, category } = req.query;

        const result = await IngredientService.getIngredients({
            page: Number(page),
            limit: Number(limit),
            filters: {
                kitchenId,
                branchId,
                name: name ? String(name) : undefined,
                category: category ? String(category) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Branches fetched successfully',
            data: result.data,
            meta: result.meta
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);

        return res.status(500).json({
            status: false,
            message: error.message
        });

    } finally {
        debugHelper.debug('=== GET INGREDIENTS END ===');
    }
};

export const updateInventoryIngredient = async (req: Request, res: Response) => {
    try {
        const request = req as Request & { kitchen: { id: number } };
        const kitchenId = request.kitchen.id;
        const branchId = Number(req.params.branchId);
        const inventoryId = Number(req.params.inventoryId);

        const branchResult = await BranchService.getBranchById(BigInt(branchId));
        if (!branchResult.status) {
            return res.status(404).json({ status: false, message: branchResult.message });
        }

        if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
            return res.status(403).json({ status: false, message: 'Branch does not belong to this kitchen' });
        }

        const result = await IngredientService.updateInventoryIngredient({
            kitchenId,
            branchId,
            inventoryId,
            ...req.body
        });

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({
            status: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    }
};

export const deleteInventoryIngredient = async (req: Request, res: Response) => {
    try {
        const request = req as Request & { kitchen: { id: number } };
        const kitchenId = request.kitchen.id;
        const branchId = Number(req.params.branchId);
        const inventoryId = Number(req.params.inventoryId);

        const branchResult = await BranchService.getBranchById(BigInt(branchId));
        if (!branchResult.status) {
            return res.status(404).json({ status: false, message: branchResult.message });
        }

        if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
            return res.status(403).json({ status: false, message: 'Branch does not belong to this kitchen' });
        }

        const result = await IngredientService.deleteInventoryIngredient({
            kitchenId,
            branchId,
            inventoryId
        });

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({
            status: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    }
};
