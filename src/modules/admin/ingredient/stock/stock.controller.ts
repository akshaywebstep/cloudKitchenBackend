import { Request, Response } from 'express';
import * as StockService from './stock.service';
import * as BranchService from '../../branch.service';
import debugHelper from '../../../../../core/helpers/debug';

// =====================================================
// 📦 CREATE STOCK
// =====================================================
export const createStock = async (req: Request, res: Response) => {

    debugHelper.debug('=== CREATE STOCK START ===');

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

        const { stocks } = request.body;

        debugHelper.debugWarn(
            'Create Stock Payload',
            JSON.stringify(req.body, null, 2)
        );

        const result = await StockService.createStock({
            kitchenId,
            branchId,
            stocks
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

        debugHelper.debugError('❌ CREATE STOCK ERROR:', error);

        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });

    } finally {

        debugHelper.debug('=== CREATE STOCK END ===');

    }
};

// =====================================================
// 📄 GET STOCKS
// =====================================================
export const getStocks = async (req: Request, res: Response) => {

    debugHelper.debug('=== GET STOCKS START ===');

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
            page = 1,
            limit = 10,
            name,
            category
        } = req.query;

        const result = await StockService.getStocks({
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
            message: 'Stocks fetched successfully',
            data: result.data,
            meta: result.meta
        });

    } catch (error: any) {

        debugHelper.debugError('❌ GET STOCKS ERROR:', error);

        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });

    } finally {

        debugHelper.debug('=== GET STOCKS END ===');

    }
};