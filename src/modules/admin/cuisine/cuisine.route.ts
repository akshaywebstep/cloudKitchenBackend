import { Router } from 'express';
import * as CuisineController from './cuisine.controller';
import { verifyToken } from '../auth/auth.middleware';
import { validateCreateCuisine, validateUpdateCuisine } from './cuisine.validation';
import { checkPermission } from '../../../core/permission/permission.middleware';
import { Panel, Action } from '../../../../prisma/generated/prisma/client';

const router = Router({
    mergeParams: true
});

// 📌 Create Cuisine
// POST /api/v1/admin/cuisine
router.post(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "cuisine", action: Action.CREATE }),
    validateCreateCuisine,
    CuisineController.CreateCuisine
);

// 📌 Get All Cuisines
// GET /api/v1/admin/cuisine
router.get(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "cuisine", action: Action.VIEW }),
    CuisineController.getCuisines
);

// 📌 Get Single Cuisine
// GET /api/v1/admin/cuisine/:id
router.get(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "cuisine", action: Action.VIEW }),
    CuisineController.getCuisineById
);

// 📌 Update Cuisine
// PUT /api/v1/admin/cuisine/:id
router.put(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "cuisine", action: Action.UPDATE }),
    validateUpdateCuisine,
    CuisineController.updateCuisine
);

// 📌 Delete Cuisine
// DELETE /api/v1/admin/cuisine/:id
router.delete(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "cuisine", action: Action.DELETE }),
    CuisineController.deleteCuisine
);

export default router;