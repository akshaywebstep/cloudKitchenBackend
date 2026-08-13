import { Request, Response } from 'express';
import * as OrderService from './order.service';
import * as BranchService from '../branch/branch.service';
import debugHelper from '../../../core/helpers/debug';

// =====================================================
// ✅ CREATE ORDER (Manual)
// =====================================================
export const createOrder = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE ORDER START ===');

    try {
        const request = req as Request & { kitchen: { id: number } };
        const kitchenId = request.kitchen.id;

        const branchId = Number(req.params.branchId);
        const branchResult = await BranchService.getBranchById(BigInt(branchId));

        if (!branchResult.status) {
            return res.status(404).json({ status: false, message: branchResult.message });
        }

        if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
            return res.status(403).json({ status: false, message: 'Branch does not belong to this kitchen' });
        }

        const { items, customer, billingAddress, shippingAddress } = req.body;

        // ✅ Basic validation
        if (!customer || !customer.firstName) {
            return res.status(400).json({ status: false, message: 'customer.firstName is required' });
        }
        if (!billingAddress || !billingAddress.address1 || !billingAddress.phoneNumber) {
            return res.status(400).json({ status: false, message: 'billingAddress (address1, phoneNumber) is required' });
        }
        if (!shippingAddress || !shippingAddress.address1 || !shippingAddress.phoneNumber) {
            return res.status(400).json({ status: false, message: 'shippingAddress (address1, phoneNumber) is required' });
        }

        const result = await OrderService.createOrder({
            kitchenId,
            branchId,
            items,
            customer,
            billingAddress,
            shippingAddress
        });

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(201).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        debugHelper.debugError('❌ CREATE ORDER ERROR:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== CREATE ORDER END ===');
    }
};

// =====================================================
// 📄 GET ALL ORDERS
// =====================================================
export const getOrders = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET ORDERS START ===');

    try {
        const request = req as Request & { kitchen: { id: number } };
        const kitchenId = request.kitchen.id;

        const branchId = Number(req.params.branchId);
        const branchResult = await BranchService.getBranchById(BigInt(branchId));

        if (!branchResult.status) {
            return res.status(404).json({ status: false, message: branchResult.message });
        }
        if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
            return res.status(403).json({ status: false, message: 'Branch does not belong to this kitchen' });
        }

        const { page = 1, limit = 10, status } = req.query;

        const result = await OrderService.getOrders({
            page: Number(page),
            limit: Number(limit),
            filters: { kitchenId, branchId, status: status ? (String(status) as any) : undefined }
        });

        return res.status(200).json({ status: true, message: 'Orders fetched successfully', data: result.data, meta: result.meta });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET ORDERS END ===');
    }
};

// =====================================================
// 🔍 GET SINGLE ORDER
// =====================================================
export const getOrderById = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET ORDER BY ID START ===');

    try {
        const request = req as Request & { kitchen: { id: number } };
        const kitchenId = request.kitchen.id;
        const branchId = Number(req.params.branchId);
        const { id } = req.params;

        const result = await OrderService.getOrderById(Number(id));

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        if (Number(result.data?.userId) !== Number(kitchenId) || Number(result.data?.branchId) !== Number(branchId)) {
            return res.status(403).json({ status: false, message: 'Order does not belong to this branch' });
        }

        return res.status(200).json({ status: true, message: 'Order fetched successfully', data: result.data });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET ORDER BY ID END ===');
    }
};


// =====================================================
// 🔄 BULK UPDATE ORDER STATUS
// =====================================================
export const bulkUpdateOrderStatus = async (req: Request, res: Response) => {
    debugHelper.debug('=== BULK UPDATE ORDER STATUS START ===');

    try {
        const request = req as Request & { kitchen: { id: number } };
        const kitchenId = request.kitchen.id;
        const branchId = Number(req.params.branchId);

        // 1. Check Branch Ownership
        const branchResult = await BranchService.getBranchById(BigInt(branchId));
        if (!branchResult.status) {
            return res.status(404).json({ status: false, message: branchResult.message });
        }
        if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
            return res.status(403).json({ status: false, message: 'Branch does not belong to this kitchen' });
        }

        const { orderIds, status } = req.body;

        // 2. Body Validation
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ status: false, message: 'orderIds must be a non-empty array' });
        }
        if (!status) {
            return res.status(400).json({ status: false, message: 'status is required' });
        }

        // 3. Call Service
        const result = await OrderService.bulkUpdateOrderStatus({
            kitchenId,
            branchId,
            orderIds,
            status
        });

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== BULK UPDATE ORDER STATUS END ===');
    }
};