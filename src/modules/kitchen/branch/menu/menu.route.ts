import { Router } from 'express';
import * as MenuItemController from './menu.controller';
import { verifyToken } from '../../auth/auth.middleware';
import {
    validateCreateMenuItem,
    validateUpdateMenuItem,
    validateMenuItemId,
    validateMenuItemStatus
} from './menu.validation';

const router = Router({
    mergeParams: true
});

// 📌 Create MenuItem
// POST /api/v1/kitchen/menu
router.post(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateCreateMenuItem,
    MenuItemController.createMenuItem
);

// 📌 Get All MenuItemes
// GET /api/v1/kitchen/menu
router.get(
    '/',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    MenuItemController.getMenuItemes
);

// 📌 Get Single MenuItem
// GET /api/v1/kitchen/menu/:id
router.get(
    '/:id',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateMenuItemId,
    MenuItemController.getMenuItemById
);

// 📌 Update MenuItem
// PUT /api/v1/kitchen/menu/:id
router.put(
    '/:id',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateMenuItemId,
    validateUpdateMenuItem,
    MenuItemController.updateMenuItem
);

// 📌 Delete MenuItem (soft delete)
router.delete(
    '/:id',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateMenuItemId,
    MenuItemController.deleteMenuItem
);

// 📌 Update Status
router.patch(
    '/:id/status',
    verifyToken({ checkOnboarding: true, checkSubscription: true }),
    validateMenuItemId,
    validateMenuItemStatus,
    MenuItemController.updateMenuItemStatus
);

export default router;