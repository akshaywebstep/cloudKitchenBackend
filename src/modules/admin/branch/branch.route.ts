import { Router } from 'express';
import * as BranchController from './branch.controller';
import { verifyToken } from '../auth/auth.middleware';
import { validateCreateBranch, validateUpdateBranch } from './branch.validation';
import { checkPermission } from '../../../core/permission/permission.middleware';
import { Panel, Action } from '../../../../prisma/generated/prisma/client';

const router = Router({ mergeParams: true });

// 📌 Create Branch
// POST /api/v1/admin/branch
router.post(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "branch", action: Action.CREATE }),
    validateCreateBranch,
    BranchController.createBranch
);

// 📌 Get All Branches
// GET /api/v1/admin/branch
router.get(
    '/',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "branch", action: Action.VIEW }),
    BranchController.getBranches
);

// 📌 Get Single Branch
// GET /api/v1/admin/branch/:id
router.get(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "branch", action: Action.VIEW }),
    BranchController.getBranchById
);

// 📌 Update Branch
// PUT /api/v1/admin/branch/:id
router.put(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "branch", action: Action.UPDATE }),
    validateUpdateBranch,
    BranchController.updateBranch
);

// 📌 Delete Branch
// DELETE /api/v1/admin/branch/:id
router.delete(
    '/:id',
    verifyToken(),
    checkPermission({ panel: Panel.ADMIN, module: "branch", action: Action.DELETE }),
    BranchController.deleteBranch
);

export default router;