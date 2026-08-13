import { Router } from 'express';
import { verifyToken } from '../auth/auth.middleware';
import * as SubscriptionAdminController from './subscription.controller';
import {
    validateCreateSubscription,
    validateUpdateSubscription,
    validateSubscriptionId,
} from './subscription.validation';
import { checkPermission } from '../../../core/permission/permission.middleware';
import { Panel, Action } from '../../../../prisma/generated/prisma/client';

const router = Router({ mergeParams: true });

// 📌 Create Subscription Plan
// POST /api/v1/admin/subscription
router.post(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "subscription", action: Action.CREATE }),
    validateCreateSubscription,
    SubscriptionAdminController.createSubscription
);

// 📌 List Subscription Plans
// GET /api/v1/admin/subscription
router.get(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "subscription", action: Action.VIEW }),
    SubscriptionAdminController.getSubscriptions
);

// 📌 Get Single Plan (preview)
// GET /api/v1/admin/subscription/:id
router.get(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "subscription", action: Action.VIEW }),
    validateSubscriptionId,
    SubscriptionAdminController.getSubscriptionById
);

// 📌 Update Subscription Plan
// PUT /api/v1/admin/subscription/:id
router.put(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "subscription", action: Action.UPDATE }),
    validateSubscriptionId,
    validateUpdateSubscription,
    SubscriptionAdminController.updateSubscription
);

export default router;