import { Router } from 'express';
import * as BranchController from './branch.controller';
import { verifyToken } from '../auth/auth.middleware';
import ingredientRoutes from './ingredient/ingredient.route';
import menuRoutes from './menu/menu.route';
import {
    validateCreateBranch,
    validateUpdateBranch,
    validateBranchId,
    validateBranchStatus
} from './branch.validation';
import { checkPermission } from "../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../prisma/generated/prisma/client";

const router = Router({
  mergeParams: true,
});

// 📌 Create Branch
// POST /api/v1/kitchen/branch
router.post(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "branch",
    action: Action.CREATE,
  }),
  validateCreateBranch,
  BranchController.createBranch,
);

// 📌 Get All Branches
// GET /api/v1/kitchen/branch
router.get(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "branch",
    action: Action.VIEW,
  }),
  BranchController.getBranches,
);

// 📌 Get Single Branch
// GET /api/v1/kitchen/branch/:id
router.get(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "branch",
    action: Action.VIEW,
  }),
  validateBranchId,
  BranchController.getBranchById,
);

// 📌 Update Branch
// PUT /api/v1/kitchen/branch/:id
router.put(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "branch",
    action: Action.UPDATE,
  }),
  validateBranchId,
  validateUpdateBranch,
  BranchController.updateBranch,
);

// 📌 Delete Branch (soft delete)
router.delete(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "branch",
    action: Action.DELETE,
  }),
  validateBranchId,
  BranchController.deleteBranch,
);

// 📌 Update Status
router.patch(
  "/:id/status",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "branch",
    action: Action.UPDATE,
  }),
  validateBranchId,
  validateBranchStatus,
  BranchController.updateBranchStatus,
);

router.use('/:branchId/ingredient', ingredientRoutes);
router.use('/:branchId/menu', menuRoutes);

export default router;