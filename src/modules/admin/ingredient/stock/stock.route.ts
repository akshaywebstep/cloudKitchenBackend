import { Router } from 'express';
import * as StockController from './stock.controller';
import { verifyToken } from '../../../auth/auth.middleware';
import { validateCreateStock } from './stock.validation';

const router = Router({
    mergeParams: true
});

// 📌 Create Stock
// POST /api/v1/kitchen/branch/:branchId/stock
router.post(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateCreateStock,
    StockController.createStock
);

// 📌 Get All Stocks
// GET /api/v1/kitchen/branch/:branchId/stock
router.get(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    StockController.getStocks
);

export default router;