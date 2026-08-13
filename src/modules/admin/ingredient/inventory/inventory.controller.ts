import { Request, Response } from 'express';
import * as InventoryService from './inventory.service';
import * as BranchService from '../../branch/branch.service'; // 🔧 adjust path to match your stock.controller.ts pattern
import debugHelper from '../../../../core/helpers/debug';

// =====================================================
// 📦 CREATE / MAP INGREDIENTS TO BRANCH
// =====================================================
export const createInventory = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE INVENTORY MAPPING START ===');

    try {
        const kitchenId = Number(req.params.kitchenId);   // ✅ params se
        const branchId = Number(req.params.branchId);      // ✅ params se

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

        const { ingredients } = req.body;

        const result = await InventoryService.createInventory({
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
            message: result.message,
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ CREATE INVENTORY MAPPING ERROR:', error);
        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    } finally {
        debugHelper.debug('=== CREATE INVENTORY MAPPING END ===');
    }
};

// =====================================================
// 📄 GET BRANCH INVENTORY
// =====================================================
export const getInventory = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET INVENTORY START ===');

    try {
          const kitchenId = Number(req.params.kitchenId);   
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

        const { page = 1, limit = 10, name, category } = req.query;

        const result = await InventoryService.getInventory({
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
            message: 'Inventory fetched successfully',
            data: result.data,
            meta: result.meta
        });

    } catch (error: any) {
        debugHelper.debugError('❌ GET INVENTORY ERROR:', error);
        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    } finally {
        debugHelper.debug('=== GET INVENTORY END ===');
    }
};

// =====================================================
// ✏️ UPDATE MAPPING
// =====================================================
export const updateInventory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await InventoryService.updateInventory(id, req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// 🗑️ DELETE MAPPING
// =====================================================
export const deleteInventory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await InventoryService.deleteInventory(id);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};