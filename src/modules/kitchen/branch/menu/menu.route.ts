import { Router } from 'express';
import * as MenuItemController from './menu.controller';
import { verifyToken } from '../../auth/auth.middleware';
import {
    validateCreateMenuItem,
    validateUpdateMenuItem,
    validateMenuItemId,
    validateMenuItemStatus
} from './menu.validation';
import { checkPermission } from "../../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../../prisma/generated/prisma/client";

const router = Router({
  mergeParams: true,
});

// 📌 Create MenuItem
// POST /api/v1/kitchen/menu
router.post(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "menu",
    action: Action.CREATE,
  }),
  validateCreateMenuItem,
  MenuItemController.createMenuItem,
);

// 📌 Get All MenuItemes
// GET /api/v1/kitchen/menu
router.get(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "menu",
    action: Action.VIEW,
  }),
  MenuItemController.getMenuItemes,
);

// 📌 Get MenuItems for Select (dropdown — order )
// GET /api/v1/kitchen/menu/select
router.get(
  "/select",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "menu",
    action: Action.VIEW,
  }),
  MenuItemController.getMenuItemsForSelect,
);

// 📌 Get Single MenuItem
// GET /api/v1/kitchen/menu/:id
router.get(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "menu",
    action: Action.VIEW,
  }),
  validateMenuItemId,
  MenuItemController.getMenuItemById,
);

// 📌 Update MenuItem
// PUT /api/v1/kitchen/menu/:id
router.put(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "menu",
    action: Action.UPDATE,
  }),
  validateMenuItemId,
  validateUpdateMenuItem,
  MenuItemController.updateMenuItem,
);

// 📌 Delete MenuItem (soft delete)
router.delete(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "menu",
    action: Action.DELETE,
  }),
  validateMenuItemId,
  MenuItemController.deleteMenuItem,
);

// 📌 Update Status
router.patch(
  "/:id/status",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.KITCHEN,
    module: "menu",
    action: Action.UPDATE,
  }),
  validateMenuItemId,
  validateMenuItemStatus,
  MenuItemController.updateMenuItemStatus,
);

export default router;