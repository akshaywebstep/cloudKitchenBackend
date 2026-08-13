import { Router } from 'express';
import * as IngredientController from './ingredient.controller';
import { verifyToken } from "../auth/auth.middleware";
import {
  validateCreateIngredient,
  validateUpdateIngredient,
} from "./ingredient.validation";
import InventoryRoutes from "./inventory/inventory.route";
import StocksRoutes from "./stock/stock.route";
import { checkPermission } from "../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../prisma/generated/prisma/client";

const router = Router({
  mergeParams: true,
});

router.use("/:kitchenId/:branchId/inventory", InventoryRoutes);
router.use("/:kitchenId/:branchId/stock", StocksRoutes);

// 📌 Create Ingredient
// POST /api/v1/admin/ingredient
router.post(
  "/",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "ingredient",
    action: Action.CREATE,
  }),
  validateCreateIngredient,
  IngredientController.CreateIngredient,
);

// 📌 Get All Ingredients
// GET /api/v1/admin/ingredient
router.get(
  "/",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "ingredient",
    action: Action.VIEW,
  }),
  IngredientController.getIngredients,
);

// 📌 Get Single Ingredient
// GET /api/v1/admin/ingredient/:id
router.get(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "ingredient",
    action: Action.VIEW,
  }),
  IngredientController.getIngredientById,
);

// 📌 Update Ingredient
// PUT /api/v1/admin/ingredient/:id
router.put(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "ingredient",
    action: Action.UPDATE,
  }),
  validateUpdateIngredient,
  IngredientController.updateIngredient,
);

// 📌 Delete Ingredient
// DELETE /api/v1/admin/ingredient/:id
router.delete(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "ingredient",
    action: Action.DELETE,
  }),
  IngredientController.deleteIngredient,
);

export default router;