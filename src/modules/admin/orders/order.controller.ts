import { Request, Response } from 'express';
import * as OrderService from './order.service';
import debugHelper from '../../../core/helpers/debug';

// =====================================================
// 📄 GET ALL ORDERS (Admin — poore system ke orders)
// =====================================================
export const getOrders = async (req: Request, res: Response) => {
    debugHelper.debug('=== ADMIN GET ALL ORDERS START ===');

    try {
        const { page = 1, limit = 10, kitchenId, branchId, status } = req.query;

        const result = await OrderService.getOrders({
            page: Number(page),
            limit: Number(limit),
            filters: {
                kitchenId: kitchenId ? Number(kitchenId) : undefined,
                branchId: branchId ? Number(branchId) : undefined,
                status: status ? (String(status) as any) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Orders fetched successfully',
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== ADMIN GET ALL ORDERS END ===');
    }
};

// =====================================================
// 🔍 GET SINGLE ORDER (Admin — koi bhi order, koi restriction nahi)
// =====================================================
export const getOrderById = async (req: Request, res: Response) => {
    debugHelper.debug('=== ADMIN GET ORDER BY ID START ===');

    try {
        const { id } = req.params;

        if (!id || Array.isArray(id) || isNaN(Number(id))) {
            return res.status(400).json({ status: false, message: 'Invalid order id' });
        }

        const result = await OrderService.getOrderById(Number(id));

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: 'Order fetched successfully', data: result.data });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== ADMIN GET ORDER BY ID END ===');
    }
};