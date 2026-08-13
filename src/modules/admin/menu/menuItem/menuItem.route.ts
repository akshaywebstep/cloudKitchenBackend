import { Router } from "express";
import * as MenuItemController from "./menuItem.controller";
import { verifyToken } from "../../auth/auth.middleware";
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
} from "./menuItem.validation";
import { checkPermission } from "../../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../../prisma/generated/prisma/client";

const router = Router();

router.post(
  "/",
  verifyToken(),
  checkPermission({ panel: Panel.ADMIN, module: "menuItem", action: Action.CREATE }),
  validateCreateMenuItem,
  MenuItemController.createMenuItem,
);

router.get(
  "/",
  verifyToken(),
  checkPermission({ panel: Panel.ADMIN, module: "menuItem", action: Action.VIEW }),
  MenuItemController.getMenuItemes
);

router.get(
  "/:id",
  verifyToken(),
  checkPermission({ panel: Panel.ADMIN, module: "menuItem", action: Action.VIEW }),
  MenuItemController.getMenuItemById
);

router.put(
  "/:id",
  verifyToken(),
  checkPermission({ panel: Panel.ADMIN, module: "menuItem", action: Action.UPDATE }),
  validateUpdateMenuItem,
  MenuItemController.updateMenuItem,
);

router.delete(
  "/:id",
  verifyToken(),
  checkPermission({ panel: Panel.ADMIN, module: "menuItem", action: Action.DELETE }),
  MenuItemController.deleteMenuItem
);

export default router;