import { Router } from 'express';
import * as OrderController from './order.controller';
import { verifyToken } from '../auth/auth.middleware';
import {
    validateCreateOrder,
    validateOrderId,
    validateBulkUpdateOrderStatus
} from './order.validation';
import { checkPermission } from '../../../core/permission/permission.middleware';
import { Panel, Action } from '../../../../prisma/generated/prisma/client';

const router = Router({ mergeParams: true });

// 📌 Create Order (Manual)
// POST /api/v1/kitchen/order/branch/:branchId
router.post(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({
        panel: Panel.KITCHEN,
        module: "order",
        action: Action.CREATE,
    }),
    validateCreateOrder,
    OrderController.createOrder
);

// 📌 Get All Orders
// GET /api/v1/kitchen/order/branch/:branchId/
router.get(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({
        panel: Panel.KITCHEN,
        module: "order",
        action: Action.VIEW,
    }),
    OrderController.getOrders
);

// 📌 Get Single Order
// GET /api/v1/kitchen/order/branch/:branchId/:id
router.get(
    '/:id',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({
        panel: Panel.KITCHEN,
        module: "order",
        action: Action.VIEW,
    }),
    validateOrderId,
    OrderController.getOrderById
);

// 📌 Update Order Status (Bulk)
// PATCH /api/v1/kitchen/order/branch/:branchId/bulk-status
router.patch(
    '/bulk-status',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    checkPermission({
        panel: Panel.KITCHEN,
        module: "order",
        action: Action.UPDATE,
    }),
    validateBulkUpdateOrderStatus,
    OrderController.bulkUpdateOrderStatus
);

export default router;