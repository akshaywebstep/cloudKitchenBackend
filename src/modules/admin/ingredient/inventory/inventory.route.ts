import { Router } from 'express';
import * as InventoryController from './inventory.controller';
import { verifyToken } from '../../auth/auth.middleware';
import { validateCreateInventory, validateUpdateInventory } from './inventory.validation';
import { checkPermission } from '../../../../core/permission/permission.middleware';
import { Panel, Action } from '../../../../../prisma/generated/prisma/client';

const router = Router({
    mergeParams: true
});

// 📌 Map ingredients to a branch
// POST /api/v1/kitchen/branch/:branchId/inventory
router.post(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "inventory", action: Action.CREATE }),
    validateCreateInventory,
    InventoryController.createInventory
);

// 📌 Get branch inventory mappings
// GET /api/v1/kitchen/branch/:branchId/inventory
router.get(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "inventory", action: Action.VIEW }),
    InventoryController.getInventory
);

// 📌 Update a mapping's unit
// PUT /api/v1/kitchen/branch/:branchId/inventory/:id
router.put(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "inventory", action: Action.UPDATE }),
    validateUpdateInventory,
    InventoryController.updateInventory
);

// 📌 Delete a mapping
// DELETE /api/v1/kitchen/branch/:branchId/inventory/:id
router.delete(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "inventory", action: Action.DELETE }),
    InventoryController.deleteInventory
);

export default router;