import { Router } from "express";
import * as MenuCategoryController from "./menuCategory.controller";
import { verifyToken } from "../auth/auth.middleware";
import {
  validateCreateMenuCategory,
  validateUpdateMenuCategory,
} from "./menuCategory.validation";
import MenuItemRoutes from "./menuItem/menuItem.route";
import { checkPermission } from "../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../prisma/generated/prisma/client";

const router = Router({ mergeParams: true });

router.use("/menu-item", MenuItemRoutes);

// 📌 Create Menu Category
// POST /api/v1/admin/menu-category
router.post(
  "/",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "menuCategory",
    action: Action.CREATE,
  }),
  validateCreateMenuCategory,
  MenuCategoryController.createMenuCategory,
);

// 📌 Get All Menu Categories (flat list with filters)
// GET /api/v1/admin/menu-category
router.get(
  "/",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "menuCategory",
    action: Action.VIEW,
  }),
  MenuCategoryController.getMenuCategories,
);

// 🌳 Get Nested Tree (parent → children)
// GET /api/v1/admin/menu-category/tree
router.get(
  "/tree",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "menuCategory",
    action: Action.VIEW,
  }),
  MenuCategoryController.getMenuCategoryTree,
);

// 📌 Get Single Menu Category
// GET /api/v1/admin/menu-category/:id
router.get(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "menuCategory",
    action: Action.VIEW,
  }),
  MenuCategoryController.getMenuCategoryById,
);

// 📌 Update Menu Category
// PUT /api/v1/admin/menu-category/:id
router.put(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "menuCategory",
    action: Action.UPDATE,
  }),
  validateUpdateMenuCategory,
  MenuCategoryController.updateMenuCategory,
);

// 📌 Delete Menu Category
// DELETE /api/v1/admin/menu-category/:id
router.delete(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "menuCategory",
    action: Action.DELETE,
  }),
  MenuCategoryController.deleteMenuCategory,
);

export default router;
